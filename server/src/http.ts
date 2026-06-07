import type { FastifyReply } from 'fastify';

export function sendBadRequest(reply: FastifyReply, message: string, details?: unknown) {
  return reply.code(400).send({ ok: false, message, details });
}

export function sendNotFound(reply: FastifyReply, message: string) {
  return reply.code(404).send({ ok: false, message });
}

export function sendConflict(reply: FastifyReply, message: string) {
  return reply.code(409).send({ ok: false, message });
}

export function isPrismaErrorCode(error: unknown, code: string) {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === code;
}

export function parseJsonArray(value: string | null | undefined) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
