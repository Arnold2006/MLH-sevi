"use client";

import { useActionState } from "react";
import { changePassword, type PasswordState } from "@/app/admin/actions";

const initial: PasswordState = {};

export default function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, initial);
  return (
    <form action={action} className="card max-w-lg space-y-5 p-6">
      {state.ok ? (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700 ring-1 ring-green-200 ring-inset">
          Adgangskoden er skiftet — du er stadig logget ind. Brug den nye kode næste gang du logger ind.
        </p>
      ) : null}
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 ring-inset">
          {state.error}
        </p>
      ) : null}
      <div>
        <label htmlFor="current" className="label">Nuværende adgangskode *</label>
        <input id="current" name="current" type="password" required className="input" autoComplete="current-password" />
      </div>
      <div>
        <label htmlFor="newPassword" className="label">Ny adgangskode *</label>
        <input id="newPassword" name="newPassword" type="password" required className="input" autoComplete="new-password" placeholder="Min. 8 tegn" />
      </div>
      <div>
        <label htmlFor="confirm" className="label">Gentag ny adgangskode *</label>
        <input id="confirm" name="confirm" type="password" required className="input" autoComplete="new-password" />
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Gemmer…" : "Skift adgangskode"}
      </button>
      <p className="text-xs text-slate-400">Gemmes i <code>data/password.json</code> på serveren og overstyrer <code>ADMIN_PASSWORD</code> fra <code>.env.local</code>. Slet filen for at gå tilbage til .env-værdien.</p>
    </form>
  );
}
