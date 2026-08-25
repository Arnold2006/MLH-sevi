"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { addGalleryItemFromMedia, type GalleryState } from "@/app/admin/actions";
import { MAX_GALLERY_IMAGES } from "@/lib/constants";
import { UploadIcon } from "@/components/icons";
import MediaPicker from "./MediaPicker";

const initial: GalleryState = {};

export default function GalleryUploadForm({
  categories,
  mediaFiles,
}: {
  categories: readonly string[];
  mediaFiles: { path: string; filename: string; used?: boolean }[];
}) {
  const [state, action, pending] = useActionState(addGalleryItemFromMedia, initial);
  const [selected, setSelected] = useState<string[]>([]);
  const [resetKey, setResetKey] = useState(0);
  const lastOk = useRef(false);

  useEffect(() => {
    if (state.ok && !lastOk.current) {
      setSelected([]);
      setResetKey((k) => k + 1);
    }
    lastOk.current = !!state.ok;
  }, [state]);

  const toggle = (p: string) => {
    setSelected((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : prev.length < MAX_GALLERY_IMAGES ? [...prev, p] : prev));
  };

  return (
    <div className="card mb-8 border-dashed p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <UploadIcon className="h-5 w-5 text-amber-600" /> Nyt projekt
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Vælg billeder fra <Link href="/admin/media" className="font-medium text-amber-600 underline">Mediebiblioteket</Link> — upload først der hvis billedet mangler. Op til {MAX_GALLERY_IMAGES} billeder pr. projekt.
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
          <label className="label">Billeder fra Mediebiblioteket * ({selected.length}/{MAX_GALLERY_IMAGES})</label>
          {selected.map((p) => (
            <input key={p} type="hidden" name="mediaPaths" value={p} />
          ))}
          <MediaPicker files={mediaFiles} max={MAX_GALLERY_IMAGES} selected={selected} onToggle={toggle} />
          <p className="mt-2 text-xs text-slate-400">Mangler et billede? <Link href="/admin/media" className="text-amber-600 underline">Upload i Mediebiblioteket</Link> først.</p>
        </div>
        <button type="submit" disabled={pending || selected.length === 0} className="btn btn-primary btn-sm disabled:opacity-50">
          {pending ? "Tilføjer…" : "Føj til galleriet"}
        </button>
      </form>
    </div>
  );
}
