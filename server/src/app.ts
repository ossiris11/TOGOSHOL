import fs from 'node:fs';
import path from 'node:path';
import fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import staticPlugin from '@fastify/static';
import { recordAdminAudit } from './audit.js';
import { config } from './config.js';
import { ensureDatabase } from './database.js';
import { registerAuditLogRoutes } from './routes/auditLogs.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerComponentRoutes } from './routes/components.js';
import { registerMetricRoutes } from './routes/metrics.js';
import { registerPageBlockRoutes } from './routes/pageBlocks.js';
import { registerProductRoutes } from './routes/products.js';
import { registerRequestRoutes } from './routes/requests.js';
import { registerReviewRoutes } from './routes/reviews.js';
import { registerUploadRoutes } from './routes/uploads.js';

export async function buildApp() {
  await ensureDatabase();

  const app = fastify({
    logger: { level: 'info' },
    trustProxy: true,
    bodyLimit: 1_000_000,
  });

  await app.register(cors, {
    origin: config.isProduction ? false : [config.publicOrigin, 'http://127.0.0.1:5173', 'http://localhost:5173'],
    credentials: true,
  });
  await app.register(cookie, { secret: config.sessionSecret });
  await app.register(rateLimit, { max: 300, timeWindow: '1 minute' });
  await app.register(multipart);

  app.addHook('onRequest', async (_request, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    reply.header(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "img-src 'self' data: blob: https:",
        "connect-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "form-action 'self'",
      ].join('; '),
    );
  });

  app.addHook('preHandler', async (request, reply) => {
    if (!request.url.startsWith('/api/admin/')) return;
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return;
    if (request.headers['x-togoshol-admin'] === '1') return;
    return reply.code(403).send({ ok: false, message: 'Admin request header required' });
  });

  app.addHook('preHandler', async (request, reply) => {
    if (!request.url.startsWith('/api/admin/')) return;
    if (request.url.startsWith('/api/admin/login')) return;
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return;

    const csrfHeader = request.headers['x-csrf-token'];
    const csrfToken = Array.isArray(csrfHeader) ? csrfHeader[0] : csrfHeader;
    const csrfCookie = request.cookies[config.csrfCookieName];
    if (csrfToken && csrfCookie && csrfToken === csrfCookie) return;

    return reply.code(403).send({ ok: false, message: 'CSRF token required' });
  });

  app.addHook('onResponse', async (request, reply) => {
    await recordAdminAudit(request, reply).catch((error) => request.log.warn({ error }, 'failed to record admin audit log'));
  });

  await fs.promises.mkdir(config.uploadDir, { recursive: true });
  await fs.promises.mkdir(config.dataDir, { recursive: true });

  await app.register(staticPlugin, {
    root: config.uploadDir,
    prefix: '/uploads/',
    decorateReply: false,
  });

  app.get('/api/health', async () => ({ ok: true, service: 'togoshol-api', time: new Date().toISOString() }));

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ error }, 'unhandled request error');
    return reply.code(500).send({ ok: false, message: 'Internal server error' });
  });

  await registerAuthRoutes(app);
  await registerAuditLogRoutes(app);
  await registerProductRoutes(app);
  await registerComponentRoutes(app);
  await registerPageBlockRoutes(app);
  await registerRequestRoutes(app);
  await registerReviewRoutes(app);
  await registerMetricRoutes(app);
  await registerUploadRoutes(app);

  if (fs.existsSync(config.distDir)) {
    await app.register(staticPlugin, {
      root: config.distDir,
      prefix: '/',
      decorateReply: false,
    });
  }

  app.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith('/api/')) {
      return reply.code(404).send({ ok: false, message: 'API route not found' });
    }
    const indexPath = path.join(config.distDir, 'index.html');
    if (fs.existsSync(indexPath)) return reply.type('text/html').send(fs.createReadStream(indexPath));
    return reply.code(404).send('Frontend build is missing. Run npm run build.');
  });

  return app;
}
