import crypto from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { config } from './config.js';
import { prisma } from './db.js';

const scryptKeyLength = 64;

export function hashToken(value: string) {
  return crypto.createHmac('sha256', config.sessionSecret).update(value).digest('hex');
}

export function hashIp(value: string | undefined) {
  if (!value) return undefined;
  return crypto.createHmac('sha256', config.sessionSecret).update(value).digest('hex').slice(0, 32);
}

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
  const derivedKey = crypto.scryptSync(password, salt, scryptKeyLength).toString('hex');
  return `scrypt:${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [scheme, salt, hash] = storedHash.split(':');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = hashPassword(password, salt);
  return timingSafeTextEqual(expected, storedHash);
}

export function verifyAdminPassword(password: string) {
  if (config.adminPasswordHash) return verifyPassword(password, config.adminPasswordHash);
  return timingSafeTextEqual(password, config.adminPassword);
}

export async function verifyAdminPasswordWithSettings(password: string) {
  const setting = await prisma.adminSetting.findUnique({ where: { key: 'adminPasswordHash' } });
  if (setting?.value) return verifyPassword(password, setting.value);
  return verifyAdminPassword(password);
}

export function timingSafeTextEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function createSessionToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function getRequestIp(request: FastifyRequest) {
  const forwardedFor = request.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) return forwardedFor.split(',')[0]?.trim();
  return request.ip;
}

export async function getAdminSession(request: FastifyRequest) {
  const token = request.cookies[config.sessionCookieName];
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.adminSession.findUnique({ where: { tokenHash } });
  if (!session || session.expiresAt.getTime() < Date.now()) {
    if (session) await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  await prisma.adminSession.update({
    where: { id: session.id },
    data: { lastSeenAt: new Date() },
  });

  return session;
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  const session = await getAdminSession(request);
  if (!session) {
    reply.code(401).send({ ok: false, message: 'Admin session required' });
  }
}
