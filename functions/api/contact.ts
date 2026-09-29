/**
 * Cloudflare Pages Function: POST /api/contact
 * Validates the contact form server-side. Delivery is mocked (logged) for now;
 * swap the marked block for Resend / MailChannels / a CRM later.
 */
import { z } from 'zod';
import type { ContactResponse } from '../../src/lib/contact/api';
import { contactSchema } from '../../src/lib/contact/schema';

const json = (body: ContactResponse, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });

/** Empty inputs become undefined so optional fields and required-field messages work. */
function formToObject(form: FormData) {
  const entries = [...form.entries()].map(([key, value]) => [
    key,
    typeof value === 'string' && value.trim() !== '' ? value : undefined,
  ]);
  return Object.fromEntries(entries);
}

export const onRequestPost = async ({ request }: { request: Request }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, message: 'Invalid request.' }, 400);
  }

  const result = contactSchema.safeParse(formToObject(form));
  if (!result.success) {
    return json(
      {
        ok: false,
        message: 'Please check the highlighted fields.',
        fields: z.flattenError(result.error).fieldErrors,
      },
      400,
    );
  }

  const { company, ...message } = result.data;

  // Bots filling the honeypot get a fake success and nothing is delivered.
  if (company) return json({ ok: true });

  // --- Mock delivery: visible in the Pages Functions real-time logs. ---
  console.log('[contact] new message', {
    name: message.name,
    email: message.email,
    topic: message.topic,
    length: message.message.length,
  });

  return json({ ok: true });
};
