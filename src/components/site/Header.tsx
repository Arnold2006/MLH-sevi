"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MenuIcon, PhoneIcon, WrenchIcon, XIcon } from "@/components/icons";

const LINKS = [
  { href: "/", label: "Forside" },
  { href: "/services", label: "Ydelser" },
  { href: "/gallery", label: "Galleri" },
  { href: "/about", label: "Om mig" },
  { href: "/contact", label: "Kontakt" },
];

export default function Header({
  businessName,
  phone,
}: {
  businessName: string;
  phone: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="rounded-lg bg-amber-500 p-2 text-white">
            <WrenchIcon className="h-4 w-4" />
          </span>
          <span className="truncate text-base font-bold text-slate-900 sm:text-lg">
            {businessName}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="btn btn-primary btn-sm hidden sm:inline-flex">
            <PhoneIcon className="h-3.5 w-3.5" />
            {phone}
          </a>
          <button
            type="button"
            aria-label="Åbn eller luk menuen"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          >
            {open ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-slate-200 bg-white md:hidden">
          <div className="container-x flex flex-col py-3">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  pathname === link.href
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
              className="btn btn-primary mt-2 sm:hidden"
            >
              <PhoneIcon className="h-4 w-4" /> Ring {phone}
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
