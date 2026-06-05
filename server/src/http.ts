import type { FastifyReply } from 'fastify';

export function sendBadRequest(reply: FastifyReply, message: string, details?: unknown) {
  return reply.code(400).send({ ok: false, message, details });
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
