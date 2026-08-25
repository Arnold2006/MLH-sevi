"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  checkPassword,
  endSession,
  requireAdmin,
  startSession,
} from "@/lib/auth";
import { isLockedOut, registerFailure, resetAttempts } from "@/lib/login-throttle";
import {
  loadGallery,
  loadMessages,
  loadServices,
  loadSite,
  saveGallery,
  saveMessages,
  saveServices,
  saveSite,
  uid,
} from "@/lib/db";
import { deleteStoredImage, saveUpload } from "@/lib/storage";
import { MAX_GALLERY_IMAGES } from "@/lib/constants";
import type { GalleryItem } from "@/lib/types";

export interface LoginState {
  error?: string;
}

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokal";
  const waitSeconds = isLockedOut(ip);
  if (waitSeconds > 0) {
    const minutes = Math.ceil(waitSeconds / 60);
    return {
      error: `For mange forsøg. Prøv igen om ${minutes} min.`,
    };
  }
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    registerFailure(ip);
    return { error: "Forkert adgangskode. Prøv igen." };
  }
  resetAttempts(ip);
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

function str(formData: FormData, key: string, max = 500): string {
  return String(formData.get(key) ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, max);
}

function parsePosition(raw: string): string | null {
  const m = raw.trim().match(/^(\d{1,3})%?\s+(\d{1,3})%?$/);
  if (!m) return null;
  const x = Math.max(0, Math.min(100, Number(m[1])));
  const y = Math.max(0, Math.min(100, Number(m[2])));
  return `${x}% ${y}%`;
}

export interface SaveState {
  ok?: boolean;
  error?: string;
}

export async function saveSettings(
  _prev: SaveState,
  formData: FormData
): Promise<SaveState> {
  await requireAdmin();
  const current = await loadSite();
  await saveSite({
    businessName: str(formData, "businessName", 120) || current.businessName,
    tagline: str(formData, "tagline", 200),
    phone: str(formData, "phone", 40),
    email: str(formData, "email", 200),
    serviceArea: str(formData, "serviceArea", 400),
    hours: str(formData, "hours", 1000),
    heroBadge: str(formData, "heroBadge", 120),
    heroHeadline: str(formData, "heroHeadline", 200) || current.heroHeadline,
    heroSubtext: str(formData, "heroSubtext", 600),
    heroImage: str(formData, "heroImage", 300) || current.heroImage,
    heroImagePosition: parsePosition(str(formData, "heroImagePosition", 20)) || current.heroImagePosition || "50% 50%",
    aboutHeadline: str(formData, "aboutHeadline", 200),
    aboutText: str(formData, "aboutText", 8000),
    aboutImage: str(formData, "aboutImage", 300) || current.aboutImage,
    aboutImagePosition: parsePosition(str(formData, "aboutImagePosition", 20)) || current.aboutImagePosition || "50% 50%",
    homeWhyTitle: str(formData, "homeWhyTitle", 200) || current.homeWhyTitle || "Professionelt håndværk. Personlig service.",
    homeWhyBullets: str(formData, "homeWhyBullets", 2000) || current.homeWhyBullets || "",
    statYears: str(formData, "statYears", 20),
    statJobs: str(formData, "statJobs", 20),
    ctaHeadline: str(formData, "ctaHeadline", 200),
    ctaText: str(formData, "ctaText", 600),
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function uploadImage(
  formData: FormData
): Promise<{ path?: string; error?: string }> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Ingen fil valgt." };
  }
  try {
    const path = await saveUpload(file, String(formData.get("name") ?? "image"));
    return { path };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload mislykkedes." };
  }
}

export async function upsertService(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id", 80);
  const title = str(formData, "title", 120);
  if (!title) return;
  const services = await loadServices();
  const description = str(formData, "description", 1000);
  const rate = str(formData, "rate", 60);
  if (id) {
    const idx = services.findIndex((s) => s.id === id);
    if (idx >= 0)
      services[idx] = { ...services[idx], title, description, rate };
  } else {
    services.push({
      id: uid(),
      order: services.length + 1,
      title,
      description,
      rate,
    });
  }
  await saveServices(services);
  revalidatePath("/", "layout");
}

export async function deleteService(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id", 80);
  const services = await loadServices();
  await saveServices(services.filter((s) => s.id !== id));
  revalidatePath("/", "layout");
}

export async function moveService(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id", 80);
  const dir = str(formData, "dir", 5);
  const services = await loadServices();
  const idx = services.findIndex((s) => s.id === id);
  if (idx < 0) return;
  const swapWith = dir === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= services.length) return;
  [services[idx], services[swapWith]] = [services[swapWith], services[idx]];
  await saveServices(services);
  revalidatePath("/", "layout");
}

export interface GalleryState {
  ok?: boolean;
  error?: string;
}

function filesFrom(formData: FormData, key: string): File[] {
  return formData
    .getAll(key)
    .filter((f): f is File => f instanceof File && f.size > 0);
}

export async function addGalleryItem(
  _prev: GalleryState,
  formData: FormData
): Promise<GalleryState> {
  await requireAdmin();
  const title = str(formData, "title", 120);
  if (!title) return { error: "Angiv en titel til projektet." };
  const files = filesFrom(formData, "files");
  if (files.length === 0)
    return { error: "Vælg mindst ét billede (op til 5)." };
  if (files.length > MAX_GALLERY_IMAGES)
    return { error: `Maks ${MAX_GALLERY_IMAGES} billeder pr. projekt.` };

  const saved: string[] = [];
  try {
    for (const file of files) saved.push(await saveUpload(file, title));
  } catch (err) {
    await Promise.all(saved.map((p) => deleteStoredImage(p)));
    return {
      error: err instanceof Error ? err.message : "Upload mislykkedes. Prøv igen.",
    };
  }

  const items = await loadGallery();
  const item: GalleryItem = {
    id: uid(),
    images: saved,
    title,
    description: str(formData, "description", 1000),
    category: str(formData, "category", 40) || "Andet",
    addedAt: new Date().toISOString(),
  };
  items.unshift(item);
  await saveGallery(items);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function addGalleryImages(
  _prev: GalleryState,
  formData: FormData
): Promise<GalleryState> {
  await requireAdmin();
  const id = str(formData, "id", 80);
  const items = await loadGallery();
  const item = items.find((i) => i.id === id);
  if (!item) return { error: "Projektet blev ikke fundet." };

  const files = filesFrom(formData, "files");
  if (files.length === 0) return { error: "Vælg mindst ét billede." };

  const slots = MAX_GALLERY_IMAGES - item.images.length;
  if (slots <= 0)
    return { error: `Projektet har allerede ${MAX_GALLERY_IMAGES} billeder.` };
  if (files.length > slots)
    return {
      error: `Der er kun plads til ${slots} flere billede${slots === 1 ? "" : "r"}.`,
    };

  const saved: string[] = [];
  try {
    for (const file of files) saved.push(await saveUpload(file, item.title));
  } catch (err) {
    await Promise.all(saved.map((p) => deleteStoredImage(p)));
    return {
      error: err instanceof Error ? err.message : "Upload mislykkedes. Prøv igen.",
    };
  }

  item.images.push(...saved);
  await saveGallery(items);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function removeGalleryImage(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id", 80);
  const idx = Number(str(formData, "index", 4));
  const items = await loadGallery();
  const item = items.find((i) => i.id === id);
  if (!item || !Number.isInteger(idx) || idx < 0 || idx >= item.images.length)
    return;

  const [removed] = item.images.splice(idx, 1);
  await deleteStoredImage(removed);
  const updated =
    item.images.length > 0
      ? items
      : items.filter((i) => i.id !== id);
  await saveGallery(updated);
  revalidatePath("/", "layout");
}

export async function updateGalleryItem(
  _prev: GalleryState,
  formData: FormData
): Promise<GalleryState> {
  await requireAdmin();
  const id = str(formData, "id", 80);
  const items = await loadGallery();
  const item = items.find((i) => i.id === id);
  if (!item) return { error: "Projektet blev ikke fundet." };
  item.title = str(formData, "title", 120) || item.title;
  item.category = str(formData, "category", 40) || item.category;
  item.description = str(formData, "description", 1000);
  await saveGallery(items);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteGalleryItem(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id", 80);
  const items = await loadGallery();
  const item = items.find((i) => i.id === id);
  if (!item) return;
  for (const image of item.images) await deleteStoredImage(image);
  await saveGallery(items.filter((i) => i.id !== id));
  revalidatePath("/", "layout");
}

export async function setMessageRead(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id", 80);
  const read = str(formData, "read", 10) === "true";
  const messages = await loadMessages();
  const msg = messages.find((m) => m.id === id);
  if (!msg) return;
  msg.read = read;
  await saveMessages(messages);
  revalidatePath("/admin", "layout");
}

export async function addGalleryItemFromMedia(
  _prev: GalleryState,
  formData: FormData
): Promise<GalleryState> {
  await requireAdmin();
  const title = str(formData, "title", 120);
  if (!title) return { error: "Angiv en titel til projektet." };
  const paths = formData.getAll("mediaPaths").map((v) => String(v).trim()).filter((p) => p.startsWith("/uploads/"));
  if (paths.length === 0) return { error: "Vælg mindst ét billede fra Mediebiblioteket." };
  if (paths.length > MAX_GALLERY_IMAGES) return { error: `Maks ${MAX_GALLERY_IMAGES} billeder pr. projekt.` };
  const { promises: fsp2 } = await import("fs");
  const { default: path2 } = await import("path");
  const uploads = path2.join(process.cwd(), "public", "uploads");
  for (const p of paths) {
    const full = path2.join(process.cwd(), "public", p.replace(/^\//, ""));
    if (!full.startsWith(uploads)) return { error: "Ugyldig filsti." };
    try {
      await fsp2.stat(full);
    } catch {
      return { error: `Filen findes ikke: ${p}` };
    }
  }
  const items = await loadGallery();
  items.unshift({ id: uid(), images: [...new Set(paths)], title, description: str(formData, "description", 1000), category: str(formData, "category", 40) || "Andet", addedAt: new Date().toISOString() });
  await saveGallery(items);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function addGalleryImagesFromMedia(
  _prev: GalleryState,
  formData: FormData
): Promise<GalleryState> {
  await requireAdmin();
  const id = str(formData, "id", 80);
  const items = await loadGallery();
  const item = items.find((i) => i.id === id);
  if (!item) return { error: "Projektet blev ikke fundet." };
  const paths = formData.getAll("mediaPaths").map((v) => String(v).trim()).filter((p) => p.startsWith("/uploads/"));
  if (paths.length === 0) return { error: "Vælg mindst ét billede fra Mediebiblioteket." };
  const slots = MAX_GALLERY_IMAGES - item.images.length;
  if (slots <= 0) return { error: `Projektet har allerede ${MAX_GALLERY_IMAGES} billeder.` };
  if (paths.length > slots) return { error: `Der er kun plads til ${slots} flere billede${slots === 1 ? "" : "r"}.` };
  const unique = [...new Set(paths)].filter((p) => !item.images.includes(p));
  if (unique.length === 0) return { error: "Billederne er allerede i projektet." };
  const { promises: fsp2 } = await import("fs");
  const { default: path2 } = await import("path");
  const uploads = path2.join(process.cwd(), "public", "uploads");
  for (const p of unique.slice(0, slots)) {
    const full = path2.join(process.cwd(), "public", p.replace(/^\//, ""));
    if (!full.startsWith(uploads)) return { error: "Ugyldig filsti." };
    try { await fsp2.stat(full); } catch { return { error: `Filen findes ikke: ${p}` }; }
  }
  item.images.push(...unique.slice(0, slots));
  await saveGallery(items);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteMessage(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id", 80);
  const messages = await loadMessages();
  await saveMessages(messages.filter((m) => m.id !== id));
  revalidatePath("/admin", "layout");
}

export interface MediaState {
  ok?: boolean;
  error?: string;
  uploaded?: number;
}

export async function uploadMedia(
  _prev: MediaState,
  formData: FormData
): Promise<MediaState> {
  await requireAdmin();
  const files = filesFrom(formData, "files");
  if (files.length === 0) return { error: "Vælg mindst ét billede." };
  if (files.length > 20) return { error: "Maks 20 billeder ad gangen." };
  let count = 0;
  for (const file of files) {
    try {
      await saveUpload(file, "medier");
      count++;
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Upload mislykkedes." };
    }
  }
  revalidatePath("/admin/media", "page");
  return { ok: true, uploaded: count };
}

export async function deleteMedia(formData: FormData) {
  await requireAdmin();
  const p = str(formData, "path", 300);
  if (!p.startsWith("/uploads/")) return;
  const { getUsedPaths } = await import("@/lib/media");
  const used = await getUsedPaths();
  if (used.has(p)) return;
  await deleteStoredImage(p);
  revalidatePath("/admin/media", "page");
}

export async function deleteOrphanMedia() {
  await requireAdmin();
  const { listMediaWithStatus } = await import("@/lib/media");
  const items = await listMediaWithStatus();
  for (const f of items.filter((x) => !x.used)) {
    await deleteStoredImage(f.path);
  }
  revalidatePath("/admin/media", "page");
}
