import { promises as fsp } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  // Only allow single filename, no subdirs, no traversal
  if (!segments || segments.length !== 1) return new Response("Not found", { status: 404 });
  const filename = segments[0];
  if (!/^[\w-]+\.(jpg|jpeg|png|webp|gif)$/i.test(filename)) {
    return new Response("Not found", { status: 404 });
  }
  const filePath = path.join(UPLOADS_DIR, filename);
  // Ensure still inside UPLOADS_DIR
  if (!filePath.startsWith(UPLOADS_DIR)) return new Response("Not found", { status: 404 });
  try {
    const data = await fsp.readFile(filePath);
    const ext = path.extname(filename).slice(1).toLowerCase();
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": MIME_BY_EXT[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
