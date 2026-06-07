#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="togoshol"
DEFAULT_REPO="git@github.com:ossiris11/TOGOSHOL.git"
DEFAULT_DIR="/opt/togoshol"
DEFAULT_PORT="8787"
NODE_MAJOR="22"

need_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    echo "Run as root: sudo bash scripts/install-vds.sh"
    exit 1
  fi
}

ask() {
  local prompt="$1"
  local default="${2:-}"
  local value
  if [[ -n "$default" ]]; then
    read -r -p "$prompt [$default]: " value
    echo "${value:-$default}"
  else
    read -r -p "$prompt: " value
    echo "$value"
  fi
}

ask_secret() {
  local prompt="$1"
  local value
  read -r -s -p "$prompt: " value
  echo
  echo "$value"
}

yes_no() {
  local prompt="$1"
  local default="${2:-y}"
  local value
  read -r -p "$prompt [$default]: " value
  value="${value:-$default}"
  [[ "$value" =~ ^[YyДд] ]]
}

random_secret() {
  openssl rand -base64 48 | tr -d '\n'
}

install_packages() {
  apt-get update
  apt-get install -y ca-certificates curl git openssl nginx ufw

  if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | sed 's/^v//' | cut -d. -f1)" -lt "$NODE_MAJOR" ]]; then
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
    apt-get install -y nodejs
  fi
}

write_env() {
  local app_dir="$1"
  local host="$2"
  local port="$3"
  local origin="$4"
  local admin_password="$5"
  local session_secret="$6"

  install -d -m 0750 "$app_dir/server/data" "$app_dir/server/uploads"
  cat > "$app_dir/.env" <<EOF
DATABASE_URL="file:../server/data/togoshol.sqlite"
SERVER_HOST="$host"
SERVER_PORT="$port"
PUBLIC_ORIGIN="$origin"
ADMIN_PASSWORD="$admin_password"
SESSION_SECRET="$session_secret"
UPLOAD_DIR="server/uploads"
EOF
  chmod 0600 "$app_dir/.env"
}

sync_repo() {
  local repo="$1"
  local app_dir="$2"
  local branch="$3"

  if [[ -d "$app_dir/.git" ]]; then
    git -C "$app_dir" fetch --all --prune
    git -C "$app_dir" checkout "$branch"
    git -C "$app_dir" pull --ff-only origin "$branch"
  else
    mkdir -p "$(dirname "$app_dir")"
    git clone --branch "$branch" "$repo" "$app_dir"
  fi
}

build_app() {
  local app_dir="$1"
  cd "$app_dir"
  npm ci
  npm run db:generate
  npm run db:migrate
  npm run db:seed
  npm run build
}

write_service() {
  local app_dir="$1"
  local user="$2"

  cat > "/etc/systemd/system/${APP_NAME}.service" <<EOF
[Unit]
Description=TOGOSHOL website and API
After=network.target

[Service]
Type=simple
WorkingDirectory=$app_dir
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run start:prod
Restart=always
RestartSec=5
User=$user
Group=$user
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ReadWritePaths=$app_dir/server/data $app_dir/server/uploads $app_dir/server/dist $app_dir/dist $app_dir/node_modules $app_dir/.env

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  systemctl enable "${APP_NAME}.service"
  systemctl restart "${APP_NAME}.service"
}

write_nginx() {
  local domain="$1"
  local redirect_domains="$2"
  local port="$3"
  local redirect_block=""

  if [[ -n "$redirect_domains" ]]; then
    redirect_block="
server {
    listen 80;
    server_name $redirect_domains;
    return 301 http://$domain\$request_uri;
}
"
  fi

  cat > "/etc/nginx/sites-available/${APP_NAME}" <<EOF
${redirect_block}
server {
    listen 80;
    server_name $domain;

    client_max_body_size 12m;

    location / {
        proxy_pass http://127.0.0.1:$port;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

  ln -sfn "/etc/nginx/sites-available/${APP_NAME}" "/etc/nginx/sites-enabled/${APP_NAME}"
  nginx -t
  systemctl enable nginx
  systemctl reload nginx
}

install_https() {
  local domain="$1"
  local redirect_domains="$2"
  local email="$3"
  local cert_domains=(-d "$domain")

  if [[ -n "$redirect_domains" ]]; then
    for redirect_domain in $redirect_domains; do
      cert_domains+=(-d "$redirect_domain")
    done
  fi

  apt-get install -y certbot python3-certbot-nginx
  certbot --nginx "${cert_domains[@]}" --non-interactive --agree-tos --redirect -m "$email"
}

setup_firewall() {
  ufw allow OpenSSH
  ufw allow 'Nginx Full'
  ufw --force enable
}

setup_backup() {
  local app_dir="$1"
  local backup_dir="$2"

  install -d -m 0750 "$backup_dir"
  cat > "/usr/local/bin/${APP_NAME}-backup" <<EOF
#!/usr/bin/env bash
set -euo pipefail
stamp=\$(date +%Y%m%d-%H%M%S)
mkdir -p "$backup_dir/\$stamp"
cp "$app_dir/server/data/togoshol.sqlite" "$backup_dir/\$stamp/togoshol.sqlite" 2>/dev/null || true
tar -C "$app_dir/server" -czf "$backup_dir/\$stamp/uploads.tar.gz" uploads 2>/dev/null || true
find "$backup_dir" -mindepth 1 -maxdepth 1 -type d -mtime +14 -exec rm -rf {} +
EOF
  chmod +x "/usr/local/bin/${APP_NAME}-backup"
  cat > "/etc/cron.d/${APP_NAME}-backup" <<EOF
17 3 * * * root /usr/local/bin/${APP_NAME}-backup >/dev/null 2>&1
EOF
}

main() {
  need_root

  echo "TOGOSHOL VDS installer"
  echo "DNS A-record for the domain must already point to this server."
  echo

  local domain redirect_domains repo app_dir branch port admin_password session_secret origin run_user email
  domain="$(ask "Primary domain" "tog-pc.ru")"
  redirect_domains="$(ask "Redirect domains, space-separated" "tog-pc.online")"
  repo="$(ask "Git repository URL" "$DEFAULT_REPO")"
  branch="$(ask "Git branch" "main")"
  app_dir="$(ask "Install directory" "$DEFAULT_DIR")"
  port="$(ask "Internal backend port" "$DEFAULT_PORT")"
  run_user="$(ask "Linux user for service" "www-data")"
  admin_password="$(ask_secret "Admin password")"
  session_secret="$(ask "Session secret, leave empty to generate" "")"
  if [[ -z "$session_secret" ]]; then
    session_secret="$(random_secret)"
  fi
  origin="https://$domain"

  install_packages
  sync_repo "$repo" "$app_dir" "$branch"
  write_env "$app_dir" "127.0.0.1" "$port" "$origin" "$admin_password" "$session_secret"
  chown -R "$run_user:$run_user" "$app_dir"
  build_app "$app_dir"
  chown -R "$run_user:$run_user" "$app_dir/server/data" "$app_dir/server/uploads" "$app_dir/.env"
  write_service "$app_dir" "$run_user"
  write_nginx "$domain" "$redirect_domains" "$port"

  if yes_no "Enable HTTPS via Let's Encrypt?" "y"; then
    email="$(ask "Email for Let's Encrypt")"
    install_https "$domain" "$redirect_domains" "$email"
  fi

  if yes_no "Enable firewall for SSH + HTTP/HTTPS only?" "y"; then
    setup_firewall
  fi

  if yes_no "Enable daily SQLite/uploads backup?" "y"; then
    setup_backup "$app_dir" "$(ask "Backup directory" "/var/backups/togoshol")"
  fi

  echo
  systemctl status "${APP_NAME}.service" --no-pager -l || true
  echo
  echo "Done."
  echo "Site: https://$domain"
  if [[ -n "$redirect_domains" ]]; then
    echo "Redirects: $redirect_domains -> https://$domain"
  fi
  echo "Admin: https://$domain/admin"
  echo "Service: systemctl status ${APP_NAME}.service"
  echo "Logs: journalctl -u ${APP_NAME}.service -f"
}

main "$@"
