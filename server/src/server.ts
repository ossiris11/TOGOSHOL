import { assertProductionConfig, config } from './config.js';
import { prisma } from './db.js';
import { buildApp } from './app.js';

assertProductionConfig();

const app = await buildApp();

async function close(signal: string) {
  app.log.info(`Received ${signal}, shutting down`);
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', () => void close('SIGINT'));
process.on('SIGTERM', () => void close('SIGTERM'));

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error(error);
  await prisma.$disconnect();
  process.exit(1);
}
