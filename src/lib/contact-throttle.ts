type Record = { count: number; windowStart: number };

const hits = new Map<string, Record>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_IN_WINDOW = 3; // 3 beskeder pr. 10 min pr. IP

export function checkContactThrottle(ip: string): number {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.windowStart > WINDOW_MS) return 0;
  if (rec.count >= MAX_IN_WINDOW) {
    return Math.ceil((rec.windowStart + WINDOW_MS - now) / 1000);
  }
  return 0;
}

export function registerContactHit(ip: string): void {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.windowStart > WINDOW_MS) {
    hits.set(ip, { count: 1, windowStart: now });
    return;
  }
  rec.count += 1;
  hits.set(ip, rec);
}
