"use client";

import { useRef, useState, useTransition } from "react";
import { uploadImage } from "@/app/admin/actions";
import { ImageIcon, UploadIcon } from "@/components/icons";

export default function ImageField({
  name,
  label,
  value,
}: {
  name: string;
  label: string;
  value: string;
}) {
  const [path, setPath] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={path} />
      {path ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={path}
          alt="Forhåndsvisning"
          className="mb-3 h-36 w-auto max-w-full rounded-lg border border-slate-200 object-cover"
        />
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
        {path ? (
          <span className="truncate text-xs text-slate-400" title={path}>
            {path}
          </span>
        ) : null}
      </div>
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
            if (res.path) setPath(res.path);
            if (res.error) setError(res.error);
            if (fileRef.current) fileRef.current.value = "";
          });
        }}
      />
      <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
        <ImageIcon className="h-3 w-3" /> JPG, PNG, WebP eller GIF · op til 6 MB
      </p>
    </div>
  );
}
