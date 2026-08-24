"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GalleryItem } from "@/lib/types";
import ProjectCard from "./ProjectCard";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
} from "@/components/icons";

interface OpenJob {
  job: number;
  img: number;
}

export default function GalleryClient({ items }: { items: GalleryItem[] }) {
  const categories = useMemo(
    () => ["Alle", ...Array.from(new Set(items.map((i) => i.category)))],
    [items]
  );
  const [filter, setFilter] = useState("Alle");
  const [open, setOpen] = useState<OpenJob | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const visible = useMemo(
    () => (filter === "Alle" ? items : items.filter((i) => i.category === filter)),
    [items, filter]
  );

  const job = open !== null ? visible[open.job] : null;
  const image = open !== null && job ? job.images[open.img] : undefined;

  const isOpen = open !== null && !!job && !!image;

  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (open === null || !job) return;
    const count = job.images.length;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (count < 2) return;
      if (e.key === "ArrowRight")
        setOpen((o) => (o ? { ...o, img: (o.img + 1) % count } : o));
      if (e.key === "ArrowLeft")
        setOpen((o) =>
          o ? { ...o, img: (o.img - 1 + count) % count } : o
        );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, job]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === cat
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-slate-500">
          Ingen projekter i denne kategori endnu – kig igen senere.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item, idx) => (
            <ProjectCard
              key={item.id}
              item={item}
              onClick={() => setOpen({ job: idx, img: 0 })}
            />
          ))}
        </div>
      )}

      {open !== null && job && image ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Billedvisning"
          onClick={() => setOpen(null)}
        >
          <button
            type="button"
            ref={closeRef}
            aria-label="Luk"
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20"
            onClick={() => setOpen(null)}
          >
            <XIcon className="h-6 w-6" />
          </button>
          {job.images.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Forrige billede"
                className="absolute left-4 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((o) =>
                    o
                      ? {
                          ...o,
                          img: (o.img - 1 + job.images.length) % job.images.length,
                        }
                      : o
                  );
                }}
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Næste billede"
                className="absolute right-4 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((o) =>
                    o ? { ...o, img: (o.img + 1) % job.images.length } : o
                  );
                }}
              >
                <ChevronRightIcon className="h-6 w-6" />
              </button>
            </>
          ) : null}

          <figure
            className="my-auto flex w-full max-w-4xl flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={`${job.title} – billede ${open.img + 1} af ${job.images.length}`}
              className="max-h-[62vh] w-auto max-w-full self-center rounded-xl shadow-2xl"
            />
            <figcaption className="mt-4">
              <p className="text-center font-semibold text-white">
                {job.title}
                {job.images.length > 1 ? (
                  <span className="ml-2 text-sm font-normal text-slate-400">
                    {open.img + 1} / {job.images.length}
                  </span>
                ) : null}
              </p>
              <div className="mx-auto mt-1 max-h-28 max-w-xl overflow-y-auto rounded-lg px-1">
                <p className="text-center text-sm leading-6 whitespace-pre-line text-slate-300">
                  {job.description}
                </p>
              </div>

              {job.images.length > 1 ? (
                <div
                  className="mt-4 flex items-center justify-center gap-2"
                  role="group"
                  aria-label="Skift mellem projektets billeder"
                >
                  {job.images.map((src, i) => {
                    const active = i === open.img;
                    return (
                      <button
                        key={src}
                        type="button"
                        aria-label={`Billede ${i + 1} af ${job.images.length}`}
                        aria-current={active}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen((o) => (o ? { job: o.job, img: i } : o));
                        }}
                        className={`overflow-hidden rounded-md ring-2 transition ${
                          active
                            ? "ring-amber-400"
                            : "opacity-60 ring-transparent hover:opacity-100"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt=""
                          loading="lazy"
                          className="h-14 w-20 object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </figcaption>
          </figure>
        </div>
      ) : null}
    </div>
  );
}
