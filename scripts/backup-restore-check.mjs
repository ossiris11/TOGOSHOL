import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const backupDir = process.env.BACKUP_DIR || '/var/backups/togoshol';

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!fs.existsSync(backupDir)) fail(`Backup directory is missing: ${backupDir}`);

const snapshots = fs
  .readdirSync(backupDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(backupDir, entry.name))
  .sort()
  .reverse();

if (snapshots.length === 0) fail(`No backup snapshots found in ${backupDir}`);

const latest = snapshots[0];
const sqlitePath = path.join(latest, 'togoshol.sqlite');
const uploadsPath = path.join(latest, 'uploads.tar.gz');

if (!fs.existsSync(sqlitePath)) fail(`SQLite backup is missing: ${sqlitePath}`);
if (fs.statSync(sqlitePath).size === 0) fail(`SQLite backup is empty: ${sqlitePath}`);
if (!fs.existsSync(uploadsPath)) fail(`Uploads backup is missing: ${uploadsPath}`);
if (fs.statSync(uploadsPath).size === 0) fail(`Uploads backup is empty: ${uploadsPath}`);

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'togoshol-restore-check-'));
const tempDb = path.join(tempDir, 'togoshol.sqlite');
fs.copyFileSync(sqlitePath, tempDb);

const query = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['prisma', 'db', 'execute', '--url', `file:${tempDb}`, '--stdin'],
  {
    input: 'SELECT name FROM sqlite_master WHERE type = "table" LIMIT 1;',
    encoding: 'utf8',
  },
);

fs.rmSync(tempDir, { recursive: true, force: true });

if (query.status !== 0) {
  fail(`SQLite backup failed restore validation:\n${query.stderr || query.stdout}`);
}

console.log(`ok latest backup snapshot: ${latest}`);
console.log(`ok sqlite backup: ${sqlitePath}`);
console.log(`ok uploads backup: ${uploadsPath}`);
