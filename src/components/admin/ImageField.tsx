"use client";

import { useRef, useState, useTransition, useCallback } from "react";
import { uploadImage } from "@/app/admin/actions";
import { ImageIcon, UploadIcon } from "@/components/icons";
import MediaPicker from "./MediaPicker";

function parsePos(raw: string | undefined): [number, number] {
  const m = (raw || "").trim().match(/^(\d{1,3})%?\s+(\d{1,3})%?$/);
  if (!m) return [50, 50];
  const x = Math.max(0, Math.min(100, Number(m[1])));
  const y = Math.max(0, Math.min(100, Number(m[2])));
  return [x, y];
}

export default function ImageField({
  name,
  label,
  value,
  positionName,
  positionValue,
  mediaFiles,
}: {
  name: string;
  label: string;
  value: string;
  positionName?: string;
  positionValue?: string;
  mediaFiles?: { path: string; filename: string }[];
}) {
  const posName = positionName || `${name}Position`;
  const [path, setPath] = useState(value);
  const initialPos = parsePos(positionValue);
  const [pos, setPos] = useState<[number, number]>(initialPos);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [dragging, setDragging] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const posString = `${pos[0]}% ${pos[1]}%`;

  const updateFromPointer = useCallback((e: React.PointerEvent | PointerEvent) => {
    const box = boxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setPos([Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y))]);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    setDragging(true);
    updateFromPointer(e);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    updateFromPointer(e);
  };
  const onPointerUp = () => setDragging(false);

  return (
    <div>
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={path} />
      <input type="hidden" name={posName} value={posString} />

      {path ? (
        <div
          ref={boxRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={() => setDragging(false)}
          className="relative mb-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 select-none touch-none"
          style={{ aspectRatio: name === "heroImage" ? "4 / 3" : "4 / 5", maxHeight: 360 }}
          title="Træk i billedet for at placere motivet"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={path}
            alt="Forhåndsvisning"
            className="absolute inset-0 h-full w-full object-cover pointer-events-none"
            style={{ objectPosition: posString }}
            draggable={false}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-black/45 px-2 py-1 text-[10px] font-medium text-white opacity-0 group-hover:opacity-100">
              Træk for at flytte
            </span>
          </div>
          {/* kryds */}
          <div
            className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-amber-500 shadow"
            style={{ left: `${pos[0]}%`, top: `${pos[1]}%` }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
            <p className="text-[11px] font-medium text-white">Træk i billedet — motivet placeres ved krydset</p>
          </div>
        </div>
      ) : null}

      {path ? (
        <div className="mb-3 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <label className="flex items-center gap-3 text-xs">
            <span className="w-14 shrink-0 font-medium text-slate-600">Vandret</span>
            <input
              type="range"
              min={0}
              max={100}
              value={pos[0]}
              onChange={(e) => setPos([Number(e.target.value), pos[1]])}
              className="h-1 w-full accent-amber-500"
            />
            <span className="w-10 text-right tabular-nums text-slate-500">{pos[0]}%</span>
          </label>
          <label className="flex items-center gap-3 text-xs">
            <span className="w-14 shrink-0 font-medium text-slate-600">Lodret</span>
            <input
              type="range"
              min={0}
              max={100}
              value={pos[1]}
              onChange={(e) => setPos([pos[0], Number(e.target.value)])}
              className="h-1 w-full accent-amber-500"
            />
            <span className="w-10 text-right tabular-nums text-slate-500">{pos[1]}%</span>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPos([50, 50])}
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Nulstil til midten
            </button>
            <span className="text-xs text-slate-300">·</span>
            <span className="text-xs text-slate-400">{posString}</span>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => fileRef.current?.click()}
          className="btn btn-outline btn-sm inline-flex"
        >
          <UploadIcon className="h-3.5 w-3.5" />
          {pending ? "Uploader…" : path ? "Udskift billede" : "Upload billede"}
        </button>
        {mediaFiles && mediaFiles.length > 0 ? (
          <button type="button" onClick={() => setShowPicker((v) => !v)} className="btn btn-outline btn-sm">
            {showPicker ? "Luk bibliotek" : "Vælg fra Mediebibliotek"}
          </button>
        ) : null}
        {path ? (
          <span className="truncate text-xs text-slate-400" title={path}>
            {path}
          </span>
        ) : null}
      </div>
      {showPicker && mediaFiles ? (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
          <p className="mb-2 text-xs font-medium text-slate-600">Vælg fra Mediebiblioteket — tidligere uploads</p>
          <MediaPicker
            files={mediaFiles}
            max={1}
            selected={path ? [path] : []}
            onToggle={(p) => {
              setPath(p);
              setPos([50, 50]);
              setShowPicker(false);
            }}
          />
          <a href="/admin/media" target="_blank" className="mt-2 inline-block text-xs text-amber-600 underline">Åbn Mediebibliotek i ny fane</a>
        </div>
      ) : null}
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setError(null);
          const fd = new FormData();
          fd.append("file", file);
          fd.append("name", label);
          startTransition(async () => {
            const res = await uploadImage(fd);
            if (res.path) {
              setPath(res.path);
              setPos([50, 50]);
            }
            if (res.error) setError(res.error);
            if (fileRef.current) fileRef.current.value = "";
          });
        }}
      />
      <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
        <ImageIcon className="h-3 w-3" /> JPG, PNG, WebP eller GIF · op til 6 MB — træk i billedet inden du gemmer
      </p>
    </div>
  );
}
