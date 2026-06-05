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

async function hasImageSignature(filePath: string, ext: string) {
  const handle = await fs.promises.open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(16);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    const signature = buffer.subarray(0, bytesRead);

    if (ext === '.jpg') return signature.length >= 3 && signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff;
    if (ext === '.png') return signature.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    if (ext === '.gif') return signature.subarray(0, 6).toString('ascii') === 'GIF87a' || signature.subarray(0, 6).toString('ascii') === 'GIF89a';
    if (ext === '.webp') return signature.subarray(0, 4).toString('ascii') === 'RIFF' && signature.subarray(8, 12).toString('ascii') === 'WEBP';
    return false;
  } finally {
    await handle.close();
  }
}

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

    if (!(await hasImageSignature(targetPath, ext))) {
      await fs.promises.unlink(targetPath).catch(() => undefined);
      return reply.code(415).send({ ok: false, message: 'Uploaded file does not match declared image type' });
    }

    return reply.code(201).send({ ok: true, url: `/uploads/${name}` });
  });
}
