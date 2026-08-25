"use client";

import { useActionState, useState } from "react";
import {
  addGalleryImagesFromMedia,
  deleteGalleryItem,
  removeGalleryImage,
  updateGalleryItem,
  type GalleryState,
} from "@/app/admin/actions";
import { MAX_GALLERY_IMAGES } from "@/lib/constants";
import ConfirmButton from "./ConfirmButton";
import MediaPicker from "./MediaPicker";
import { PlusIcon, TrashIcon, XIcon } from "@/components/icons";
import type { GalleryItem } from "@/lib/types";

const initial: GalleryState = {};

export default function GalleryEditCard({
  item,
  categories,
  mediaFiles,
}: {
  item: GalleryItem;
  categories: readonly string[];
  mediaFiles: { path: string; filename: string; used?: boolean }[];
}) {
  const [editState, editAction, editPending] = useActionState(updateGalleryItem, initial);
  const [addState, addAction, addPending] = useActionState(addGalleryImagesFromMedia, initial);
  const [selected, setSelected] = useState<string[]>([]);

  const slots = MAX_GALLERY_IMAGES - item.images.length;
  const toggle = (p: string) => {
    if (selected.includes(p)) setSelected((s) => s.filter((x) => x !== p));
    else if (selected.length < slots) setSelected((s) => [...s, p]);
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap gap-2 p-4 pb-0">
        {item.images.map((src, i) => {
          const isLast = item.images.length === 1;
          const message = isLast
            ? `Dette er projektets sidste billede. Slettes hele projektet "${item.title}"?`
            : `Fjerne billede ${i + 1} af ${item.images.length} fra "${item.title}"?`;
          return (
            <form key={src + i} action={removeGalleryImage} className="relative">
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="index" value={i} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${item.title} – billede ${i + 1}`} loading="lazy" className="h-20 w-28 rounded-md object-cover" />
              <ConfirmButton
                message={message}
                className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-sm hover:bg-red-700"
              >
                <XIcon className="h-3.5 w-3.5" />
                <span className="sr-only">Slet billede {i + 1}</span>
              </ConfirmButton>
            </form>
          );
        })}
      </div>

      <form action={editAction} className="space-y-3 p-4">
        <input type="hidden" name="id" value={item.id} />
        {editState.error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200 ring-inset">{editState.error}</p> : null}
        {editState.ok ? <p className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 ring-1 ring-green-200 ring-inset">Ændringerne er gemt.</p> : null}
        <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
          <input name="title" defaultValue={item.title} aria-label={`Titel for ${item.title}`} className="input" required />
          <select name="category" defaultValue={item.category} aria-label={`Kategori for ${item.title}`} className="input">
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <textarea name="description" rows={3} defaultValue={item.description} aria-label={`Beskrivelse for ${item.title}`} className="input resize-y" />
        <button type="submit" disabled={editPending} className="btn btn-primary btn-sm">
          {editPending ? "Gemmer…" : "Gem ændringer"}
        </button>
      </form>

      <form action={addAction} className="space-y-3 border-t border-slate-100 px-4 py-3">
        <input type="hidden" name="id" value={item.id} />
        {addState.error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200 ring-inset">{addState.error}</p> : null}
        {addState.ok ? <p className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 ring-1 ring-green-200 ring-inset">Billederne er tilføjet.</p> : null}
        <p className="text-xs font-medium text-slate-500">Tilføj fra Mediebiblioteket ({slots} pladser ledige — {selected.length} valgt)</p>
        {selected.map((p) => (
          <input key={p} type="hidden" name="mediaPaths" value={p} />
        ))}
        {slots > 0 ? (
          <>
            <MediaPicker files={mediaFiles.filter((f) => !item.images.includes(f.path))} max={slots} selected={selected} onToggle={toggle} emptyLabel="Alle Mediebibliotek-billeder er allerede i dette projekt. Upload nye i Medier." />
            <div className="flex gap-2">
              <button type="button" onClick={() => setSelected([])} className="text-xs text-slate-500 underline">Ryd valg</button>
              <span className="text-xs text-slate-300">·</span>
              <a href="/admin/media" className="text-xs text-amber-600 underline">Åbn Mediebibliotek</a>
            </div>
            <button type="submit" disabled={addPending || selected.length === 0} className="btn btn-outline btn-sm inline-flex items-center gap-1.5 disabled:opacity-50">
              <PlusIcon className="h-3.5 w-3.5" /> {addPending ? "Tilføjer…" : "Tilføj valgte billeder"}
            </button>
          </>
        ) : (
          <p className="text-xs text-slate-400">Projektet har allerede {MAX_GALLERY_IMAGES} billeder — fjern ét før du tilføjer flere.</p>
        )}
      </form>

      <form action={deleteGalleryItem} className="px-4 pb-4">
        <input type="hidden" name="id" value={item.id} />
        <ConfirmButton message={`Slette hele projektet "${item.title}" med ${item.images.length} billede${item.images.length === 1 ? "" : "r"}?`} className="btn btn-danger btn-sm inline-flex items-center gap-1.5">
          <TrashIcon className="h-3.5 w-3.5" /> Slet projekt
        </ConfirmButton>
      </form>
    </div>
  );
}
