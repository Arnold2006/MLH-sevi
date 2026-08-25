"use client";

import { useActionState, useEffect, useState } from "react";
import { submitContact, type ContactFormState } from "@/app/(site)/contact/actions";
import { CheckIcon } from "@/components/icons";

const initial: ContactFormState = { ok: false };

function TurnstileWidget() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(() => {
    if (!siteKey) return;
    if (document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) return;
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }, [siteKey]);
  if (!siteKey) return null;
  return <div className="cf-turnstile" data-sitekey={siteKey} data-theme="light" />;
}

export default function ContactFlow() {
  const [instance, setInstance] = useState(0);
  return (
    <ContactForm
      key={instance}
      onReset={() => setInstance((i) => i + 1)}
    />
  );
}

function ContactForm({ onReset }: { onReset: () => void }) {
  const [state, action, pending] = useActionState(submitContact, initial);

  if (state.ok) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckIcon className="h-7 w-7" />
        </span>
        <h3 className="mt-4 text-xl font-bold text-slate-900">Beskeden er sendt!</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
          Tak for din henvendelse – du hører fra mig inden for én hverdag. Er
          opgaven akut, er telefonen altid den hurtigste vej.
        </p>
        <button type="button" className="btn btn-outline mt-6" onClick={onReset}>
          Send en ny besked
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 ring-inset">
          {state.error}
        </p>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">
            Navn *
          </label>
          <input id="name" name="name" required className="input" placeholder="Anne Jensen" />
        </div>
        <div>
          <label htmlFor="email" className="label">
            E-mail *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input"
            placeholder="anne@example.dk"
          />
        </div>
      </div>
      <div>
        <label htmlFor="phone" className="label">
          Telefon <span className="font-normal text-slate-400">(valgfrit)</span>
        </label>
        <input id="phone" name="phone" type="tel" className="input" placeholder="+45 20 34 56 78" />
      </div>
      <div>
        <label htmlFor="message" className="label">
          Hvad kan jeg hjælpe med? *
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="input resize-y"
          placeholder="Beskriv opgaven eller reparationen – jo flere detaljer, jo bedre bliver tilbuddet."
        />
      </div>
      <input
        type="hidden"
        name="startedAt"
        ref={(el) => {
          if (el && !el.value) el.value = String(Date.now());
        }}
      />
      <div aria-hidden="true" className="hidden">
        <label htmlFor="company">Lad dette felt stå tomt</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Hjemmeside</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <TurnstileWidget />
      <button type="submit" disabled={pending} className="btn btn-primary w-full sm:w-auto">
        {pending ? "Sender…" : "Send besked"}
      </button>
      <p className="text-xs text-slate-400">Beskyttet mod spam — ingen data deles med tredjepart uden Turnstile.</p>
    </form>
  );
}
