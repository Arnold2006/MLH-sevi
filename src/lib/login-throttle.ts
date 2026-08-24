type AttemptRecord = {
  count: number;
  windowStart: number;
  lockedUntil: number;
};

const attempts = new Map<string, AttemptRecord>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;

export function registerFailure(key: string): void {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.windowStart > WINDOW_MS) {
    attempts.set(key, { count: 1, windowStart: now, lockedUntil: 0 });
    return;
  }
  rec.count += 1;
  if (rec.count >= MAX_ATTEMPTS) {
    rec.lockedUntil = now + LOCKOUT_MS;
    rec.count = 0;
    rec.windowStart = now;
  }
  attempts.set(key, rec);
}

export function isLockedOut(key: string): number {
  const rec = attempts.get(key);
  if (!rec) return 0;
  const remaining = rec.lockedUntil - Date.now();
  if (remaining <= 0) {
    if (rec.lockedUntil) attempts.delete(key);
    return 0;
  }
  return Math.ceil(remaining / 1000);
}

export function resetAttempts(key: string): void {
  attempts.delete(key);
}
