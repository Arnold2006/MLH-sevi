"use client";

import { useState } from "react";

export default function MediaPicker({
  files,
  max,
  selected,
  onToggle,
  emptyLabel = "Ingen billeder i Mediebiblioteket — upload først i Medier.",
}: {
  files: { path: string; filename: string; used?: boolean }[];
  max: number;
  selected: string[];
  onToggle: (path: string) => void;
  emptyLabel?: string;
}) {
  const [filter, setFilter] = useState<"alle" | "ledig" | "valgt">("alle");
  const visible = files.filter((f) => {
    if (filter === "valgt") return selected.includes(f.path);
    if (filter === "ledig") return !selected.includes(f.path);
    return true;
  });
  if (files.length === 0) return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  return (
    <div>
      <div className="mb-2 flex gap-1.5">
        {(["alle", "ledig", "valgt"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setFilter(v)}
            className={`rounded-full px-3 py-1 text-xs ${filter === v ? "bg-slate-900 text-white" : "bg-white ring-1 ring-slate-200"}`}
          >
            {v === "alle" ? `Alle (${files.length})` : v === "valgt" ? `Valgt (${selected.length})` : `Ledige (${files.length - selected.length})`}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">{selected.length}/{max} valgt</span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {visible.map((f) => {
          const active = selected.includes(f.path);
          const disabled = !active && selected.length >= max;
          return (
            <button
              key={f.path}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(f.path)}
              className={`relative overflow-hidden rounded-lg border-2 ${active ? "border-amber-500 ring-2 ring-amber-500/20" : "border-slate-200"} ${disabled ? "opacity-40" : ""}`}
              title={f.filename}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.path} alt={f.filename} loading="lazy" className="aspect-square w-full object-cover" />
              {active ? <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">{selected.indexOf(f.path) + 1}</span> : null}
              {f.used ? <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[9px] text-white">I brug</span> : null}
            </button>
          );
        })}
      </div>
      {visible.length === 0 ? <p className="py-4 text-center text-xs text-slate-500">Ingen billeder i denne visning.</p> : null}
    </div>
  );
}
