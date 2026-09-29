import { z } from 'zod';

const NAME_ERROR = 'Please enter your name.';
const MESSAGE_ERROR = 'Tell me a bit more (10+ characters).';

/** Server-side validation used by the Pages Function (functions/api/contact.ts). */
export const contactSchema = z.object({
  name: z.string({ error: NAME_ERROR }).trim().min(2, NAME_ERROR).max(80),
  email: z.email({ error: 'Please enter a valid email address.' }),
  topic: z.string().trim().max(80).optional(),
  message: z.string({ error: MESSAGE_ERROR }).trim().min(10, MESSAGE_ERROR).max(2000),
  /** Honeypot: humans never see this field. */
  company: z.string().optional(),
});
