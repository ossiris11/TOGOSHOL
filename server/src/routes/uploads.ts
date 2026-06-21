import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import type { FastifyInstance } from 'fastify';
import sharp from 'sharp';
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

function isSafeUploadName(name: string) {
  return /^[a-zA-Z0-9._-]+$/.test(name) && !name.includes('..');
}

async function removeIfExists(filePath: string) {
  await fs.promises.unlink(filePath).catch(() => undefined);
}

async function createWebpVariants(sourcePath: string, id: string) {
  const source = await fs.promises.readFile(sourcePath);
  const image = sharp(source, { animated: false }).rotate();
  const name = `${id}.webp`;
  const thumbName = `${id}-thumb.webp`;
  const fullPath = path.join(config.uploadDir, name);
  const thumbPath = path.join(config.uploadDir, thumbName);

  await image.clone().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toFile(fullPath);
  await image.clone().resize({ width: 420, height: 420, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toFile(thumbPath);

  return {
    name,
    thumbName,
    url: `/uploads/${name}`,
    thumbUrl: `/uploads/${thumbName}`,
  };
}

async function listUploadedImages() {
  await fs.promises.mkdir(config.uploadDir, { recursive: true });
  const entries = await fs.promises.readdir(config.uploadDir, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .filter((entry) => /\.(jpe?g|png|webp|gif)$/i.test(entry.name))
      .filter((entry) => !entry.name.includes('-thumb.'))
      .map(async (entry) => {
        const filePath = path.join(config.uploadDir, entry.name);
        const stat = await fs.promises.stat(filePath);
        const thumbName = entry.name.replace(/(\.[^.]+)$/, '-thumb.webp');
        const hasThumb = await fs.promises
          .access(path.join(config.uploadDir, thumbName))
          .then(() => true)
          .catch(() => false);

        return {
          name: entry.name,
          url: `/uploads/${entry.name}`,
          thumbUrl: hasThumb ? `/uploads/${thumbName}` : `/uploads/${entry.name}`,
          size: stat.size,
          updatedAt: stat.mtime.toISOString(),
        };
      }),
  );
  return files.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function registerUploadRoutes(app: FastifyInstance) {
  app.get('/api/admin/uploads/images', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    return { ok: true, items: await listUploadedImages() };
  });

  app.post('/api/admin/uploads/images', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;

    const file = await request.file({ limits: { fileSize: 6 * 1024 * 1024 } });
    if (!file) return reply.code(400).send({ ok: false, message: 'Image file is required' });

    const ext = allowedMime.get(file.mimetype);
    if (!ext) return reply.code(415).send({ ok: false, message: 'Only jpg, png, webp and gif images are allowed' });

    await fs.promises.mkdir(config.uploadDir, { recursive: true });
    const id = `${Date.now()}-${crypto.randomUUID()}`;
    const tempName = ext === '.gif' ? `${id}${ext}` : `${id}-source${ext}`;
    const tempPath = path.join(config.uploadDir, tempName);
    await pipeline(file.file, fs.createWriteStream(tempPath));

    if (!(await hasImageSignature(tempPath, ext))) {
      await removeIfExists(tempPath);
      return reply.code(415).send({ ok: false, message: 'Uploaded file does not match declared image type' });
    }

    if (ext === '.gif') {
      return reply.code(201).send({ ok: true, name: tempName, url: `/uploads/${tempName}`, thumbUrl: `/uploads/${tempName}` });
    }

    try {
      const result = await createWebpVariants(tempPath, id);
      await removeIfExists(tempPath);
      return reply.code(201).send({ ok: true, ...result });
    } catch (error) {
      await removeIfExists(tempPath);
      await removeIfExists(path.join(config.uploadDir, `${id}.webp`));
      await removeIfExists(path.join(config.uploadDir, `${id}-thumb.webp`));
      request.log.warn({ error }, 'failed to process uploaded image');
      return reply.code(415).send({ ok: false, message: 'Uploaded image cannot be processed' });
    }
  });

  app.delete<{ Params: { name: string } }>('/api/admin/uploads/images/:name', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;

    const { name } = request.params;
    if (!isSafeUploadName(name)) return reply.code(400).send({ ok: false, message: 'Invalid upload name' });

    const resolvedPath = path.resolve(path.join(config.uploadDir, name));
    if (!resolvedPath.startsWith(config.uploadDir + path.sep)) return reply.code(400).send({ ok: false, message: 'Invalid upload path' });

    await removeIfExists(resolvedPath);
    await removeIfExists(path.join(config.uploadDir, name.replace(/(\.[^.]+)$/, '-thumb.webp')));
    return { ok: true };
  });
}
