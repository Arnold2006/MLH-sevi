"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DownloadIcon,
  HomeIcon,
  ImageIcon,
  InboxIcon,
  KeyIcon,
  SlidersIcon,
  WrenchIcon,
} from "@/components/icons";

const NAV = [
  { href: "/admin", label: "Oversigt", icon: HomeIcon },
  { href: "/admin/services", label: "Ydelser", icon: WrenchIcon },
  { href: "/admin/gallery", label: "Galleri", icon: ImageIcon },
  { href: "/admin/media", label: "Medier", icon: ImageIcon },
  { href: "/admin/settings", label: "Indstillinger", icon: SlidersIcon },
  { href: "/admin/messages", label: "Beskeder", icon: InboxIcon },
  { href: "/admin/password", label: "Adgangskode", icon: KeyIcon },
  { href: "/admin/backup", label: "Backup", icon: DownloadIcon },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export default function AdminNav({ orientation }: { orientation: "vertical" | "horizontal" }) {
  const pathname = usePathname();
  if (orientation === "vertical") {
    return (
      <nav className="flex flex-col gap-1 p-4">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive(pathname, href)
                ? "bg-amber-50 text-amber-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    );
  }
  return (
    <nav className="flex gap-1 overflow-x-auto p-3">
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
            isActive(pathname, href)
              ? "bg-amber-50 text-amber-700"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
