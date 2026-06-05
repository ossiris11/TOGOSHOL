import { ensureDatabase } from '../src/database.js';
import { prisma } from '../src/db.js';

await ensureDatabase();
await prisma.$disconnect();

console.log('Database schema is ready');
