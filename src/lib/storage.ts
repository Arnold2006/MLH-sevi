import { promises as fsp } from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_BYTES = 6 * 1024 * 1024;

function detectImageType(bytes: Buffer): string | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return "image/jpeg";
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  )
    return "image/png";
  if (
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  )
    return "image/webp";
  const gif = bytes.toString("ascii", 0, 6);
  if (gif === "GIF87a" || gif === "GIF89a") return "image/gif";
  return null;
}

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "image"
  );
}

export async function saveUpload(file: File, baseName: string): Promise<string> {
  if (file.size > MAX_BYTES) throw new Error("Billedet må maksimalt fylde 6 MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const type = detectImageType(bytes);
  if (!type)
    throw new Error(
      "Ugyldigt eller usupporteret billede. Brug JPG, PNG, WebP eller GIF."
    );
  const ext = EXT_BY_TYPE[type];
  await fsp.mkdir(UPLOADS_DIR, { recursive: true });
  const filename = `${Date.now().toString(36)}-${slugify(baseName)}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;
  await fsp.writeFile(path.join(UPLOADS_DIR, filename), bytes);
  return `/uploads/${filename}`;
}

const PUBLIC_IMAGES_DIR = path.join(process.cwd(), "public");

export async function deleteStoredImage(imagePath: string): Promise<void> {
  if (!imagePath.startsWith("/uploads/")) return;
  const resolved = path.join(PUBLIC_IMAGES_DIR, imagePath.replace(/^\//, ""));
  if (!resolved.startsWith(UPLOADS_DIR)) return;
  try {
    await fsp.unlink(resolved);
  } catch {}
}
