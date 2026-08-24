import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "handyman_admin";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "changeme";
}

function secret(): string {
  return (
    process.env.ADMIN_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "summit-dev-secret"
  );
}

export function checkPassword(input: string): boolean {
  const given = createHash("sha256").update(input).digest();
  const expected = createHash("sha256").update(adminPassword()).digest();
  return timingSafeEqual(given, expected);
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createSessionToken(): string {
  const expires = Date.now() + SESSION_MS;
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(payload)) return false;
  if (Number(payload) < Date.now()) return false;
  const expected = sign(payload);
  const given = Buffer.from(sig);
  const want = Buffer.from(expected);
  if (given.length !== want.length) return false;
  return timingSafeEqual(given, want);
}

export async function startSession() {
  const store = await cookies();
  let isHttps = process.env.NODE_ENV === "production";
  try {
    const h = await headers();
    const proto = (h.get("x-forwarded-proto") || h.get("x-forwarded-protocol") || "").split(",")[0].trim().toLowerCase();
    if (proto) isHttps = proto === "https";
  } catch {}
  store.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    maxAge: SESSION_MS / 1000,
    path: "/",
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isLoggedIn(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isLoggedIn())) redirect("/admin/login");
}
