"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { loadMessages, saveMessages, uid } from "@/lib/db";
import { checkContactThrottle, registerContactHit } from "@/lib/contact-throttle";

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
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokal";
  const wait = checkContactThrottle(ip);
  if (wait > 0) {
    const m = Math.ceil(wait / 60);
    return { ok: false, error: `For mange beskeder lige nu. Prøv igen om ${m} min.` };
  }

  // 1) Honeypots - skal være tomme (usynlige for mennesker)
  if (clean(formData.get("company")) || clean(formData.get("website"))) {
    return { ok: true }; // lad robot tro den gik igennem
  }

  // 2) Tidsfælde - form udfyldt for hurtigt = bot (3 sek)
  const startedRaw = clean(formData.get("startedAt"));
  const startedAt = Number(startedRaw);
  if (
    startedRaw &&
    Number.isFinite(startedAt) &&
    startedAt > 0 &&
    Date.now() - startedAt < 3000
  ) {
    return {
      ok: false,
      error: "Det gik lidt for stærkt – vent et øjeblik og send igen.",
    };
  }
  // For gammel form (over 2 timer) = genindlæs
  if (startedRaw && Number.isFinite(startedAt) && Date.now() - startedAt > 2 * 60 * 60 * 1000) {
    return { ok: false, error: "Formularen er udløbet – genindlæs siden og prøv igen." };
  }

  // 3) Cloudflare Turnstile - hvis konfigureret, skal token verificeres
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const token = clean(formData.get("cf-turnstile-response"));
    if (!token) {
      return { ok: false, error: "Bekræft venligst at du ikke er en robot." };
    }
    try {
      const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${encodeURIComponent(turnstileSecret)}&response=${encodeURIComponent(token)}&remoteip=${encodeURIComponent(ip)}`,
      });
      const data = (await verify.json()) as { success: boolean };
      if (!data.success) {
        return { ok: false, error: "Robot-tjek fejlede – prøv igen." };
      }
    } catch {
      return { ok: false, error: "Robot-tjek kunne ikke verificeres – prøv igen." };
    }
  }

  const name = clean(formData.get("name"));
  const email = clean(formData.get("email"));
  const phone = clean(formData.get("phone"));
  const message = clean(formData.get("message"));

  if (!name || !email || !message) {
    return { ok: false, error: "Udfyld venligst navn, e-mail og en kort besked." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Denne e-mailadresse ser ikke rigtig ud." };
  }
  // Bloker link-spam (typisk robot)
  const links = message.match(/https?:\/\/|www\./gi);
  if (links && links.length > 2) {
    return { ok: false, error: "Beskeden indeholder for mange links." };
  }

  registerContactHit(ip);
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
  revalidatePath("/", "layout");
  return { ok: true };
}
