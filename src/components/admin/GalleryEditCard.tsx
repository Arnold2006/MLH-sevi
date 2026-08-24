"use client";

import { useActionState } from "react";
import {
  addGalleryImages,
  deleteGalleryItem,
  removeGalleryImage,
  updateGalleryItem,
  type GalleryState,
} from "@/app/admin/actions";
import { MAX_GALLERY_IMAGES } from "@/lib/constants";
import ConfirmButton from "./ConfirmButton";
import { PlusIcon, TrashIcon, XIcon } from "@/components/icons";
import type { GalleryItem } from "@/lib/types";

const initial: GalleryState = {};

export default function GalleryEditCard({
  item,
  categories,
}: {
  item: GalleryItem;
  categories: readonly string[];
}) {
  const [editState, editAction, editPending] = useActionState(
    updateGalleryItem,
    initial
  );
  const [addState, addAction, addPending] = useActionState(
    addGalleryImages,
    initial
  );

  const slots = MAX_GALLERY_IMAGES - item.images.length;

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
              <img
                src={src}
                alt={`${item.title} – billede ${i + 1}`}
                loading="lazy"
                className="h-20 w-28 rounded-md object-cover"
              />
              <ConfirmButton
                message={message}
                className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-sm transition-colors hover:bg-red-700"
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
        {editState.error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200 ring-inset">
            {editState.error}
          </p>
        ) : null}
        {editState.ok ? (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 ring-1 ring-green-200 ring-inset">
            Ændringerne er gemt.
          </p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
          <input
            name="title"
            defaultValue={item.title}
            aria-label={`Titel for ${item.title}`}
            className="input"
            required
          />
          <select
            name="category"
            defaultValue={item.category}
            aria-label={`Kategori for ${item.title}`}
            className="input"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <textarea
          name="description"
          rows={3}
          defaultValue={item.description}
          aria-label={`Beskrivelse for ${item.title}`}
          className="input resize-y"
        />
        <button type="submit" disabled={editPending} className="btn btn-primary btn-sm">
          {editPending ? "Gemmer…" : "Gem ændringer"}
        </button>
      </form>

      <form action={addAction} className="space-y-2 border-t border-slate-100 px-4 py-3">
        <input type="hidden" name="id" value={item.id} />
        {addState.error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200 ring-inset">
            {addState.error}
          </p>
        ) : null}
        {addState.ok ? (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 ring-1 ring-green-200 ring-inset">
            Billederne er tilføjet.
          </p>
        ) : null}
        <label className="text-xs font-medium text-slate-500">
          Tilføj billeder ({slots} af {MAX_GALLERY_IMAGES} pladser ledige)
        </label>
        <input
          type="file"
          name="files"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          disabled={slots === 0}
          className="block w-full cursor-pointer rounded-lg border border-slate-300 text-xs file:mr-3 file:cursor-pointer file:rounded-l-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold hover:file:bg-slate-200 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={addPending || slots === 0}
          className="btn btn-outline btn-sm inline-flex items-center gap-1.5"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          {addPending ? "Uploader…" : "Tilføj billeder"}
        </button>
      </form>

      <form action={deleteGalleryItem} className="px-4 pb-4">
        <input type="hidden" name="id" value={item.id} />
        <ConfirmButton
          message={`Slette hele projektet "${item.title}" med ${item.images.length} billede${item.images.length === 1 ? "" : "r"}?`}
          className="btn btn-danger btn-sm inline-flex items-center gap-1.5"
        >
          <TrashIcon className="h-3.5 w-3.5" /> Slet projekt
        </ConfirmButton>
      </form>
    </div>
  );
}
