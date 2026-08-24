"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../actions";

const initial: LoginState = {};

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, initial);
  return (
    <form action={action} className="space-y-5">
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 ring-inset">
          {state.error}
        </p>
      ) : null}
      <div>
        <label htmlFor="password" className="label">
          Adgangskode
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="input"
          placeholder="••••••••"
        />
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Logger ind…" : "Log ind"}
      </button>
    </form>
  );
}
