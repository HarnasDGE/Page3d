import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';

const NAME_ERROR = 'Please enter your name.';
const MESSAGE_ERROR = 'Tell me a bit more (10+ characters).';

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const recentByIp = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const recent = (recentByIp.get(ip) ?? []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  recentByIp.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX;
}

export const server = {
  contact: defineAction({
    accept: 'form',
    input: z.object({
      // Empty form fields arrive as null, so required fields need their own message.
      name: z.string({ error: NAME_ERROR }).trim().min(2, NAME_ERROR).max(80),
      email: z.email({ error: 'Please enter a valid email address.' }),
      topic: z.string().trim().max(80).nullish(),
      message: z.string({ error: MESSAGE_ERROR }).trim().min(10, MESSAGE_ERROR).max(2000),
      /** Honeypot: humans never see this field. */
      company: z.string().nullish(),
    }),
    handler: async (input, context) => {
      // Bots filling the honeypot get a fake success and nothing is delivered.
      if (input.company) return { ok: true as const };

      if (isRateLimited(context.clientAddress)) {
        throw new ActionError({ code: 'TOO_MANY_REQUESTS', message: 'Too many messages, try again later.' });
      }

      // Mock delivery: swap for Resend / SMTP / CRM later.
      console.info('[contact] new message', {
        name: input.name,
        email: input.email,
        topic: input.topic,
        length: input.message.length,
      });

      return { ok: true as const };
    },
  }),
};
