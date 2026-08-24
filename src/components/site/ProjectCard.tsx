import type { GalleryItem } from "@/lib/types";

export default function ProjectCard({
  item,
  onClick,
}: {
  item: GalleryItem;
  onClick?: () => void;
}) {
  return (
    <figure
      className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl bg-slate-100 shadow-sm"
      onClick={onClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.images[0]}
        alt={item.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent"
      />
      <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
        <span className="text-sm font-semibold text-white drop-shadow">
          {item.title}
        </span>
        <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
          {item.images.length > 1
            ? `${item.images.length} billeder`
            : item.category}
        </span>
      </figcaption>
    </figure>
  );
}
