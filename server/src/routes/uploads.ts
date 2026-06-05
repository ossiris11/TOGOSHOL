import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import type { FastifyInstance } from 'fastify';
import { config } from '../config.js';
import { requireAdmin } from '../security.js';

const allowedMime = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
]);

export async function registerUploadRoutes(app: FastifyInstance) {
  app.post('/api/admin/uploads/images', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;

    const file = await request.file({ limits: { fileSize: 6 * 1024 * 1024 } });
    if (!file) return reply.code(400).send({ ok: false, message: 'Image file is required' });

    const ext = allowedMime.get(file.mimetype);
    if (!ext) return reply.code(415).send({ ok: false, message: 'Only jpg, png, webp and gif images are allowed' });

    await fs.promises.mkdir(config.uploadDir, { recursive: true });
    const name = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    const targetPath = path.join(config.uploadDir, name);
    await pipeline(file.file, fs.createWriteStream(targetPath));

    return reply.code(201).send({ ok: true, url: `/uploads/${name}` });
  });
}
