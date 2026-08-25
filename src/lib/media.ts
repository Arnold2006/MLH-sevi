import { promises as fsp } from "fs";
import path from "path";
import { loadGallery, loadSite } from "./db";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export interface MediaFile {
  filename: string;
  path: string; // /uploads/...
  size: number;
  mtime: string; // ISO
}

export async function listMediaFiles(): Promise<MediaFile[]> {
  try {
    const names = await fsp.readdir(UPLOADS_DIR);
    const files: MediaFile[] = [];
    for (const name of names) {
      if (name === ".gitkeep") continue;
      if (!/^[\w.-]+\.(jpg|jpeg|png|webp|gif)$/i.test(name)) continue;
      const full = path.join(UPLOADS_DIR, name);
      try {
        const st = await fsp.stat(full);
        if (!st.isFile()) continue;
        files.push({
          filename: name,
          path: `/uploads/${name}`,
          size: st.size,
          mtime: st.mtime.toISOString(),
        });
      } catch {}
    }
    files.sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime());
    return files;
  } catch {
    return [];
  }
}

export async function getUsedPaths(): Promise<Set<string>> {
  const used = new Set<string>();
  try {
    const site = await loadSite();
    for (const p of [site.heroImage, site.aboutImage]) {
      if (typeof p === "string" && p.startsWith("/uploads/")) used.add(p);
    }
  } catch {}
  try {
    const gallery = await loadGallery();
    for (const item of gallery) {
      for (const p of item.images || []) {
        if (typeof p === "string" && p.startsWith("/uploads/")) used.add(p);
      }
    }
  } catch {}
  return used;
}

export async function listMediaWithStatus(): Promise<(MediaFile & { used: boolean })[]> {
  const [files, used] = await Promise.all([listMediaFiles(), getUsedPaths()]);
  return files.map((f) => ({ ...f, used: used.has(f.path) }));
}
