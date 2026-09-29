import { useState, type SubmitEvent } from 'react';
import { profile } from '@/data/profile';
import { sendContactForm, type ContactField } from '@/lib/contact/api';
import { useGameStore } from '@/scene/store/gameStore';
import { ACCENTS } from '@/scene/world/cityLayout';
import { PanelFrame } from './PanelFrame';

type Status = 'idle' | 'sending' | 'sent' | 'error';
type FieldErrors = Partial<Record<ContactField, string[]>>;

const inputClass =
  'w-full rounded-md border border-white/15 bg-night/70 px-3 py-2.5 text-base text-white placeholder:text-white/35 outline-none transition focus:border-neon-magenta focus:ring-1 focus:ring-neon-magenta';

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="mt-1 text-sm text-neon-magenta">{messages[0]}</p>;
}

export function ContactPanel({ topic }: { topic?: string }) {
  const setSignalPending = useGameStore((state) => state.setSignalPending);
  const closePanel = useGameStore((state) => state.closePanel);
  const [status, setStatus] = useState<Status>('idle');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');
    setFieldErrors({});

    const result = await sendContactForm(new FormData(event.currentTarget));

    if (result.ok) {
      setStatus('sent');
      setSignalPending(true);
      return;
    }
    setFieldErrors(result.fields ?? {});
    setErrorMessage(result.message);
    setStatus('error');
  };

  if (status === 'sent') {
    return (
      <PanelFrame title="Signal sent" eyebrow="Transmission complete" accent={ACCENTS.magenta}>
        <p className="text-lg text-white/85">
          Thanks! Your message is on its way. I'll get back to you at the address you provided — usually
          within 24 hours.
        </p>
        <button
          type="button"
          onClick={closePanel}
          className="mt-6 rounded-md border border-neon-magenta px-5 py-2.5 font-display text-sm tracking-widest text-neon-magenta uppercase transition hover:bg-neon-magenta/15"
        >
          Back to the district
        </button>
      </PanelFrame>
    );
  }

  return (
    <PanelFrame title="Open a channel" eyebrow={`Direct line · ${profile.email}`} accent={ACCENTS.magenta}>
      <form onSubmit={handleSubmit} noValidate className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Name</span>
            <input name="name" required autoComplete="name" className={inputClass} />
            <FieldError messages={fieldErrors.name} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Email</span>
            <input name="email" type="email" required autoComplete="email" className={inputClass} />
            <FieldError messages={fieldErrors.email} />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm text-white/70">Topic</span>
          <input name="topic" defaultValue={topic} placeholder="New website, audit, just saying hi…" className={inputClass} />
          <FieldError messages={fieldErrors.topic} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-white/70">Message</span>
          <textarea name="message" required rows={5} className={`${inputClass} resize-none`} />
          <FieldError messages={fieldErrors.message} />
        </label>
        {/* Honeypot for bots; hidden from people and assistive tech. */}
        <input name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

        {status === 'error' && (
          <p role="alert" className="text-sm text-neon-magenta">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'sending'}
          className="justify-self-start rounded-md border border-neon-magenta bg-neon-magenta/15 px-6 py-3 font-display text-sm tracking-widest text-white uppercase shadow-[0_0_20px_rgba(255,43,214,0.35)] transition hover:bg-neon-magenta/30 disabled:opacity-60"
        >
          {status === 'sending' ? 'Transmitting…' : 'Send signal'}
        </button>
      </form>
    </PanelFrame>
  );
}
