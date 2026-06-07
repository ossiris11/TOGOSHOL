import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const tempDir = path.join(process.cwd(), 'tmp');
fs.mkdirSync(tempDir, { recursive: true });
const dbName = `migration-check-${Date.now()}.sqlite`;
const dbPath = path.join(tempDir, dbName);
const migrationPath = path.join('prisma', 'migrations', '20260607190000_init', 'migration.sql');

const result = spawnSync(`npx prisma db execute --schema prisma/schema.prisma --file ${migrationPath.replaceAll(path.sep, '/')}`, {
  env: { ...process.env, DATABASE_URL: `file:../tmp/${dbName}` },
  encoding: 'utf8',
  shell: true,
});

fs.rmSync(dbPath, { force: true });

if (result.status !== 0) {
  console.error(result.error?.message || result.stderr || result.stdout || 'Migration check failed without output');
  process.exit(result.status || 1);
}

console.log('ok migration SQL applies to a clean SQLite database');
