"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addGalleryItem, type GalleryState } from "@/app/admin/actions";
import { MAX_GALLERY_IMAGES } from "@/lib/constants";
import { UploadIcon } from "@/components/icons";

const initial: GalleryState = {};

export default function GalleryUploadForm({
  categories,
}: {
  categories: readonly string[];
}) {
  const [state, action, pending] = useActionState(addGalleryItem, initial);
  const [resetKey, setResetKey] = useState(0);
  const lastOk = useRef(false);

  useEffect(() => {
    if (state.ok && !lastOk.current) setResetKey((k) => k + 1);
    lastOk.current = !!state.ok;
  }, [state]);

  return (
    <div className="card mb-8 border-dashed p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <UploadIcon className="h-5 w-5 text-amber-600" /> Nyt projekt
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Et projekt er et udført job med tekst og op til {MAX_GALLERY_IMAGES} billeder.
      </p>
      <form key={resetKey} action={action} className="mt-4 space-y-4">
        {state.error ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 ring-inset">
            {state.error}
          </p>
        ) : null}
        {state.ok ? (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700 ring-1 ring-green-200 ring-inset">
            Projektet er tilføjet galleriet.
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
          <div>
            <label htmlFor="g-title" className="label">Projektets titel *</label>
            <input id="g-title" name="title" required className="input" placeholder="fx Flisearbejde i køkken" />
          </div>
          <div>
            <label htmlFor="g-category" className="label">Kategori</label>
            <select id="g-category" name="category" className="input">
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="g-desc" className="label">Beskrivelse</label>
          <textarea id="g-desc" name="description" rows={2} className="input resize-y" placeholder="Beskriv opgaven – vises, når besøgende åbner projektet i galleriet." />
        </div>
        <div>
          <label htmlFor="g-files" className="label">Billeder * (1–{MAX_GALLERY_IMAGES})</label>
          <input
            id="g-files"
            name="files"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            required
            className="block w-full cursor-pointer rounded-lg border border-slate-300 text-sm file:mr-3 file:cursor-pointer file:rounded-l-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2.5 file:text-sm file:font-semibold hover:file:bg-slate-200"
          />
          <p className="mt-1.5 text-xs text-slate-400">JPG, PNG, WebP eller GIF · op til {MAX_GALLERY_IMAGES} billeder · maks 6 MB pr. billede</p>
        </div>
        <button type="submit" disabled={pending} className="btn btn-primary btn-sm">
          {pending ? "Uploader…" : "Føj til galleriet"}
        </button>
      </form>
    </div>
  );
}
