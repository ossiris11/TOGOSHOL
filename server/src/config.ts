import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function loadEnvFile() {
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) continue;
    const key = trimmed.slice(0, equalsIndex).trim();
    const rawValue = trimmed.slice(equalsIndex + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  rootDir,
  isProduction,
  host: process.env.SERVER_HOST || '127.0.0.1',
  port: Number(process.env.SERVER_PORT || 8787),
  publicOrigin: process.env.PUBLIC_ORIGIN || 'http://127.0.0.1:5173',
  sessionCookieName: 'togoshol_admin_session',
  sessionTtlDays: Number(process.env.SESSION_TTL_DAYS || 7),
  sessionSecret: process.env.SESSION_SECRET || (isProduction ? '' : 'togoshol-dev-session-secret-change-in-production'),
  adminPassword: process.env.ADMIN_PASSWORD || (isProduction ? '' : 'admin-change-me'),
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || '',
  uploadDir: path.resolve(rootDir, process.env.UPLOAD_DIR || 'server/uploads'),
  dataDir: path.resolve(rootDir, 'server/data'),
  distDir: path.resolve(rootDir, 'dist'),
};

export function assertProductionConfig() {
  if (!config.isProduction) return;

  const missing = [];
  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL');
  if (!config.sessionSecret || config.sessionSecret.length < 32) missing.push('SESSION_SECRET >= 32 chars');
  if (!config.adminPasswordHash && (!config.adminPassword || config.adminPassword.length < 10)) {
    missing.push('ADMIN_PASSWORD >= 10 chars or ADMIN_PASSWORD_HASH');
  }

  if (missing.length > 0) {
    throw new Error(`Production config is incomplete: ${missing.join(', ')}`);
  }
}
