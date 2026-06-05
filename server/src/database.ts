import fs from 'node:fs';
import { config } from './config.js';
import { prisma } from './db.js';
import { schemaStatements } from './databaseSchema.js';

let ensured = false;

export async function ensureDatabase() {
  if (ensured) return;
  await fs.promises.mkdir(config.dataDir, { recursive: true });
  for (const statement of schemaStatements) {
    await prisma.$executeRawUnsafe(statement);
  }
  ensured = true;
}
