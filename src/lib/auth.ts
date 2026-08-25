import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { promises as fsp } from "fs";
import path from "path";

const COOKIE_NAME = "handyman_admin";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const PASSWORD_FILE = path.join(process.cwd(), "data", "password.json");

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

async function loadStoredHash(): Promise<string | null> {
  try {
    const raw = await fsp.readFile(PASSWORD_FILE, "utf8");
    const j = JSON.parse(raw) as { hash?: string };
    if (typeof j.hash === "string" && /^[a-f0-9]{64}$/i.test(j.hash)) return j.hash.toLowerCase();
    return null;
  } catch {
    return null;
  }
}

async function saveStoredHash(hashHex: string): Promise<void> {
  await fsp.mkdir(path.dirname(PASSWORD_FILE), { recursive: true });
  await fsp.writeFile(PASSWORD_FILE, JSON.stringify({ hash: hashHex.toLowerCase() }, null, 2), "utf8");
}

function hashOf(input: string): Buffer {
  return createHash("sha256").update(input).digest();
}

export async function checkPassword(input: string): Promise<boolean> {
  const given = hashOf(input);
  const stored = await loadStoredHash();
  if (stored) {
    const storedBuf = Buffer.from(stored, "hex");
    if (storedBuf.length === given.length && timingSafeEqual(given, storedBuf)) return true;
    // server-admin kode fra .env virker altid ved siden af ejer-koden
    const server = hashOf(adminPassword());
    if (server.length === given.length && timingSafeEqual(given, server)) return true;
    return false;
  }
  const expected = hashOf(adminPassword());
  if (given.length !== expected.length) return false;
  return timingSafeEqual(given, expected);
}

export async function setStoredPassword(newPassword: string): Promise<void> {
  const hex = hashOf(newPassword).toString("hex");
  await saveStoredHash(hex);
}

export async function isUsingStoredPassword(): Promise<boolean> {
  return (await loadStoredHash()) !== null;
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
