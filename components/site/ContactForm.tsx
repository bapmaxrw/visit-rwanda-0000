"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { ENQUIRY_TOPICS } from "@/lib/validation";

type Errors = Record<string, string>;

const initial = {
  name: "",
  email: "",
  phone: "",
  topic: "general",
  subject: "",
  message: "",
};

export function ContactForm({ defaults }: { defaults?: Partial<typeof initial> }) {
  const [form, setForm] = useState({ ...initial, ...defaults });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [sent, setSent] = useState<{ reference: string; topic: string } | null>(null);

  const update = (key: keyof typeof initial, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setFailure(null);
    setErrors({});

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.error ?? "Your message could not be sent. Please try again.");
      }

      setSent({ reference: data.enquiry.reference, topic: data.enquiry.topic });
      setForm(initial);
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "Your message could not be sent.");
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-[1.4rem] border border-emerald/25 bg-white p-7">
        <CheckCircle2 className="h-9 w-9 text-emerald" />
        <h2 className="mt-4 font-display text-2xl text-pine">Message received</h2>
        <p className="mt-2 text-[0.88rem] leading-relaxed text-body-soft">
          Thank you — your enquiry has been logged and a copy has been sent to your email address.
          Our tourism team replies during working hours, usually within two business days.
        </p>
        <dl className="mt-5 grid gap-2 rounded-xl bg-pine/[0.04] p-4 text-[0.8rem] sm:grid-cols-2">
          <div>
            <dt className="text-faint">Reference</dt>
            <dd className="font-mono font-semibold text-pine">{sent.reference}</dd>
          </div>
          <div>
            <dt className="text-faint">Topic</dt>
            <dd className="font-medium text-pine">{sent.topic}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={() => setSent(null)}
          className="btn btn-ghost mt-6 !px-4 !py-2 text-xs"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[1.4rem] border border-pine/10 bg-white p-6 sm:p-7"
      noValidate
    >
      {failure && (
        <p
          role="alert"
          className="mb-5 flex items-start gap-2 rounded-xl bg-[#b23a2e]/8 px-4 py-3 text-[0.8rem] text-[#8a3b2f]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {failure}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={errors.name} htmlFor="contact-name">
          <input
            id="contact-name"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            className="input"
            autoComplete="name"
            placeholder="Your name"
          />
        </Field>
        <Field label="Email address" error={errors.email} htmlFor="contact-email">
          <input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            className="input"
            autoComplete="email"
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Telephone (optional)" error={errors.phone} htmlFor="contact-phone">
          <input
            id="contact-phone"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            className="input"
            autoComplete="tel"
            placeholder="+250 7…"
          />
        </Field>
        <Field label="Topic" error={errors.topic} htmlFor="contact-topic">
          <select
            id="contact-topic"
            value={form.topic}
            onChange={(event) => update("topic", event.target.value)}
            className="input"
          >
            {ENQUIRY_TOPICS.map((topic) => (
              <option key={topic.value} value={topic.value}>
                {topic.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Subject" error={errors.subject} htmlFor="contact-subject">
          <input
            id="contact-subject"
            value={form.subject}
            onChange={(event) => update("subject", event.target.value)}
            className="input"
            placeholder="What is your message about?"
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Message" error={errors.message} htmlFor="contact-message">
          <textarea
            id="contact-message"
            value={form.message}
            onChange={(event) => update("message", event.target.value)}
            className="input min-h-36"
            placeholder="Tell us about your trip dates, group size, accessibility needs or the information you are looking for."
          />
        </Field>
      </div>

      <p className="mt-4 text-[0.7rem] leading-relaxed text-faint">
        We only use your details to answer this enquiry. Never include passport numbers, payment
        card details or other sensitive documents.
      </p>

      <button type="submit" disabled={busy} className="btn btn-forest mt-5 w-full sm:w-auto">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="field-label">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-[0.7rem] text-[#b23a2e]">{error}</p>}
    </div>
  );
}
