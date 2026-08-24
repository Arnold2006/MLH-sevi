import { promises as fsp } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { SiteSettings, Service, GalleryItem, ContactMessage } from "./types";
import {
  DEFAULT_SETTINGS,
  DEFAULT_SERVICES,
  DEFAULT_GALLERY,
  defaultMessages,
} from "./seed";

const DATA_DIR = path.join(process.cwd(), "data");

async function ensureDataDir() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
}

async function load<T>(name: string, fallback: T): Promise<T> {
  await ensureDataDir();
  const target = path.join(DATA_DIR, name);
  try {
    const raw = await fsp.readFile(target, "utf8");
    return JSON.parse(raw) as T;
  } catch (err) {
    const isMissing = (err as NodeJS.ErrnoException).code === "ENOENT";
    if (!isMissing) {
      try {
        await fsp.rename(target, target + ".corrupt");
      } catch {}
    }
    try {
      await fsp.writeFile(target, JSON.stringify(fallback, null, 2), "utf8");
    } catch {}
    return structuredClone(fallback);
  }
}

async function save<T>(name: string, value: T): Promise<void> {
  await ensureDataDir();
  const target = path.join(DATA_DIR, name);
  const tmp = target + ".tmp";
  await fsp.writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await fsp.rename(tmp, target);
}

export function uid(): string {
  return randomUUID();
}

export async function loadSite(): Promise<SiteSettings> {
  const stored = await load<Partial<SiteSettings>>("site.json", {});
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSite(settings: SiteSettings) {
  await save("site.json", settings);
}

export async function loadServices(): Promise<Service[]> {
  const list = await load<Service[]>("services.json", DEFAULT_SERVICES);
  return [...list].sort((a, b) => a.order - b.order);
}

export async function saveServices(list: Service[]) {
  await save("services.json", list.map((s, i) => ({ ...s, order: i + 1 })));
}

type StoredGalleryItem = Omit<GalleryItem, "images"> & {
  images?: string[];
  image?: string;
};

export async function loadGallery(): Promise<GalleryItem[]> {
  const list = await load<StoredGalleryItem[]>("gallery.json", DEFAULT_GALLERY);
  const normalized = (Array.isArray(list) ? list : [])
    .map((it) => {
      const images =
        Array.isArray(it.images) && it.images.length > 0
          ? it.images.filter((p): p is string => typeof p === "string")
          : typeof it.image === "string" && it.image
            ? [it.image]
            : [];
      return { ...it, images } as GalleryItem;
    })
    .filter((it) => it.images.length > 0);
  return normalized.sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  );
}

export async function saveGallery(list: GalleryItem[]) {
  await save("gallery.json", list);
}

export async function loadMessages(): Promise<ContactMessage[]> {
  const list = await load<ContactMessage[]>("messages.json", defaultMessages());
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function saveMessages(list: ContactMessage[]) {
  await save("messages.json", list);
}
