import { promises as fsp } from "fs";
import path from "path";
import PageHeader from "@/components/admin/PageHeader";
import { DownloadIcon } from "@/components/icons";
import { listMediaFiles } from "@/lib/media";
import { loadGallery, loadSite } from "@/lib/db";

export default async function AdminBackupPage() {
  const dataDir = path.join(process.cwd(), "data");
  let dataCount = 0;
  try {
    const names = await fsp.readdir(dataDir);
    dataCount = names.filter((n) => n.endsWith(".json")).length;
  } catch {}
  const media = await listMediaFiles().catch(() => []);
  let galleryCount = 0;
  try {
    const g = await loadGallery();
    galleryCount = g.length;
  } catch {}
  let siteName = "";
  try {
    const s = await loadSite();
    siteName = s.businessName;
  } catch {}

  return (
    <>
      <PageHeader
        title="Backup"
        description="Download alle data og billeder som én zip-fil direkte fra serveren. Gem den et sikkert sted."
      />
      <div className="card p-6">
        <h2 className="text-lg font-bold text-slate-900">Indhold i backuppen</h2>
        <p className="mt-1 text-sm text-slate-500">
          Zippen indeholder <code>data/</code> (indstillinger, ydelser, galleri, beskeder, adgangskode) og <code>uploads/</code> (alle billeder). For {siteName || "siden"} er det pt. {dataCount} JSON-filer, {media.length} billeder i Mediebiblioteket og {galleryCount} galleri-projekter.
        </p>
        <ul className="mt-4 list-disc pl-5 text-sm text-slate-600">
          <li>
            <code>data/site.json</code> — virksomhedsoplysninger, forsider, positioner, bullets
          </li>
          <li>
            <code>data/*.json</code> — ydelser, galleri, beskeder, password-hash
          </li>
          <li>
            <code>uploads/*</code> — alle uploadede billeder
          </li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/api/backup" className="btn btn-primary inline-flex items-center gap-2">
            <DownloadIcon className="h-4 w-4" /> Download backup.zip
          </a>
          <span className="self-center text-xs text-slate-400">Kræver ejer-login (samme køn som admin). Pak ud og læg mapperne tilbage for at gendanne.</span>
        </div>
      </div>
      <div className="card mt-4 bg-amber-50 p-4 ring-1 ring-amber-200 ring-inset">
        <p className="text-sm text-amber-800">
          Tip: Tag backup før større ændringer. Zippen indeholder også <code>data/password.json</code> — gem den sikkert og del den aldrig.
        </p>
      </div>
    </>
  );
}
