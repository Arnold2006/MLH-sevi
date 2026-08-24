"use server";

import { revalidatePath } from "next/cache";
import { loadMessages, saveMessages, uid } from "@/lib/db";

export interface ContactFormState {
  ok: boolean;
  error?: string;
}

function clean(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = clean(formData.get("name"));
  const email = clean(formData.get("email"));
  const phone = clean(formData.get("phone"));
  const message = clean(formData.get("message"));

  const honeypot = clean(formData.get("company"));
  if (honeypot) {
    return { ok: true };
  }
  const startedRaw = clean(formData.get("startedAt"));
  const startedAt = Number(startedRaw);
  if (
    startedRaw &&
    Number.isFinite(startedAt) &&
    startedAt > 0 &&
    Date.now() - startedAt < 1500
  ) {
    return {
      ok: false,
      error: "Det gik lidt for stærkt – vent et øjeblik og send igen.",
    };
  }

  if (!name || !email || !message) {
    return { ok: false, error: "Udfyld venligst navn, e-mail og en kort besked." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Denne e-mailadresse ser ikke rigtig ud." };
  }

  const messages = await loadMessages();
  messages.unshift({
    id: uid(),
    name: name.slice(0, 120),
    email: email.slice(0, 200),
    phone: phone.slice(0, 40),
    message: message.slice(0, 4000),
    createdAt: new Date().toISOString(),
    read: false,
  });
  await saveMessages(messages);
  revalidatePath("/admin", "layout");
  return { ok: true };
}
