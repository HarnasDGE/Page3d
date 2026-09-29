/** Served by the Cloudflare Pages Function in functions/api/contact.ts. */
export const CONTACT_ENDPOINT = '/api/contact';

export type ContactField = 'name' | 'email' | 'topic' | 'message';

export type ContactResponse =
  | { ok: true }
  | { ok: false; message: string; fields?: Partial<Record<ContactField, string[]>> };

/** Posts the contact form to our own server endpoint (never a third-party API). */
export async function sendContactForm(form: FormData): Promise<ContactResponse> {
  try {
    const response = await fetch(CONTACT_ENDPOINT, { method: 'POST', body: form });
    const body = (await response.json().catch(() => null)) as ContactResponse | null;
    return body ?? { ok: false, message: 'Something went wrong, please try again.' };
  } catch {
    return { ok: false, message: 'Network error, please try again.' };
  }
}
