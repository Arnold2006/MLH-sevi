"use client";

import { useActionState, useState } from "react";
import { deleteMedia, deleteOrphanMedia, uploadMedia, type MediaState } from "@/app/admin/actions";
import { TrashIcon, UploadIcon } from "@/components/icons";
import ConfirmButton from "./ConfirmButton";

const initial: MediaState = {};

function fmtSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaManagerClient({
  files,
}: {
  files: { filename: string; path: string; size: number; mtime: string; used: boolean }[];
}) {
  const [state, action, pending] = useActionState(uploadMedia, initial);
  const [filter, setFilter] = useState<"alle" | "brugt" | "forældreløs">("alle");
  const [copied, setCopied] = useState<string | null>(null);

  const orphans = files.filter((f) => !f.used);
  const visible = files.filter((f) => {
    if (filter === "brugt") return f.used;
    if (filter === "forældreløs") return !f.used;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <p className="text-2xl font-extrabold text-slate-900">{files.length}</p>
          <p className="text-xs text-slate-500">Filer i alt</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-extrabold text-green-700">{files.length - orphans.length}</p>
          <p className="text-xs text-slate-500">I brug</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-extrabold text-amber-600">{orphans.length}</p>
          <p className="text-xs text-slate-500">Forældreløse</p>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <UploadIcon className="h-4 w-4 text-amber-600" /> Upload flere billeder
        </h2>
        <p className="mt-1 text-xs text-slate-500">Vælg op til 20 ad gangen — gemmes direkte i Mediebiblioteket. Billederne kan herefter vælges i Galleri og Indstillinger.</p>
        <form action={action} className="mt-4 flex flex-wrap items-end gap-3">
          <input
            name="files"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            required
            className="block w-full cursor-pointer rounded-lg border border-slate-300 text-sm file:mr-3 file:cursor-pointer file:rounded-l-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2.5 file:text-sm file:font-semibold hover:file:bg-slate-200 sm:w-auto sm:min-w-[22rem]"
          />
          <button type="submit" disabled={pending} className="btn btn-primary btn-sm">
            {pending ? "Uploader…" : "Upload til Medier"}
          </button>
        </form>
        {state.error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200 ring-inset">{state.error}</p> : null}
        {state.ok ? <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 ring-1 ring-green-200 ring-inset">{state.uploaded} billede{state.uploaded === 1 ? "" : "r"} uploadet.</p> : null}
        {orphans.length > 0 ? (
          <form action={deleteOrphanMedia} className="mt-4 border-t border-slate-100 pt-4">
            <ConfirmButton
              message={`Slette alle ${orphans.length} forældreløse filer? Dette kan ikke fortrydes.`}
              className="btn btn-danger btn-sm inline-flex items-center gap-1.5"
            >
              <TrashIcon className="h-3.5 w-3.5" /> Slet alle forældreløse ({orphans.length})
            </ConfirmButton>
          </form>
        ) : null}
      </div>

      <div className="flex gap-2">
        {(["alle", "brugt", "forældreløs"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium ${filter === f ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}
          >
            {f === "alle" ? `Alle (${files.length})` : f === "brugt" ? `I brug (${files.length - orphans.length})` : `Forældreløse (${orphans.length})`}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="card p-10 text-center text-sm text-slate-500">
          {filter === "forældreløs" ? "Ingen forældreløse filer — godt klaret." : "Ingen filer i denne visning."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((f) => (
            <div key={f.path} className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.path} alt={f.filename} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <div className="space-y-1 p-3">
                <p className="truncate text-xs font-medium text-slate-900" title={f.filename}>{f.filename}</p>
                <p className="text-[11px] text-slate-400">{fmtSize(f.size)} · {new Date(f.mtime).toLocaleDateString("da-DK")} · <span className={f.used ? "text-green-600" : "text-amber-600"}>{f.used ? "I brug" : "Forældreløs"}</span></p>
                <p className="truncate text-[11px] text-slate-400" title={f.path}>{f.path}</p>
                <div className="flex gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(f.path);
                      setCopied(f.path);
                      setTimeout(() => setCopied(null), 1500);
                    }}
                    className="btn btn-outline btn-sm flex-1 justify-center"
                  >
                    {copied === f.path ? "Kopieret!" : "Kopiér sti"}
                  </button>
                  <form action={deleteMedia}>
                    <input type="hidden" name="path" value={f.path} />
                    {f.used ? (
                      <button type="button" disabled className="btn btn-danger btn-sm px-2 opacity-40" title="Kan ikke slette — filen er i brug">
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <ConfirmButton message={`Slette "${f.filename}"?`} className="btn btn-danger btn-sm px-2">
                        <TrashIcon className="h-3.5 w-3.5" />
                      </ConfirmButton>
                    )}
                  </form>
                </div>
                {f.used ? <p className="text-[11px] text-slate-400">Fjern brugen i galleri/indstillinger før sletning.</p> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
