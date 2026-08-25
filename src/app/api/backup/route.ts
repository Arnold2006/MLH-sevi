import { promises as fsp } from "fs";
import path from "path";
import JSZip from "jszip";
import { isLoggedIn } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isLoggedIn())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const zip = new JSZip();
  const dataDir = path.join(process.cwd(), "data");
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  // data/*.json
  try {
    const names = await fsp.readdir(dataDir);
    for (const name of names) {
      if (!name.endsWith(".json")) continue;
      const full = path.join(dataDir, name);
      try {
        const st = await fsp.stat(full);
        if (!st.isFile()) continue;
        const buf = await fsp.readFile(full);
        zip.file(`data/${name}`, buf);
      } catch {}
    }
  } catch {}

  // public/uploads
  try {
    const names = await fsp.readdir(uploadsDir);
    for (const name of names) {
      if (name === ".gitkeep") continue;
      const full = path.join(uploadsDir, name);
      try {
        const st = await fsp.stat(full);
        if (!st.isFile()) continue;
        const buf = await fsp.readFile(full);
        zip.file(`uploads/${name}`, buf);
      } catch {}
    }
  } catch {}

  // lille readme i zippen
  zip.file("README.txt", `Backup fra MLH-sevi - ${new Date().toISOString()}\nIndeholder data/ (*.json) og uploads/ (billeder).\nPak ud og laeg filerne tilbage i samme mapper for at gendanne.\n`);

  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 6 } });
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="mlh-sevi-backup-${stamp}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
