import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import {
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  WrenchIcon,
} from "@/components/icons";
import EjerLoginBadge from "./EjerLoginBadge";

export default function Footer({ site, unreadCount = 0 }: { site: SiteSettings; unreadCount?: number }) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="rounded-lg bg-amber-500 p-2 text-white">
              <WrenchIcon className="h-4 w-4" />
            </span>
            <span className="text-base font-bold text-white">
              {site.businessName}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">{site.tagline}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wider text-white uppercase">
            Genveje
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { href: "/", label: "Forside" },
              { href: "/services", label: "Ydelser" },
              { href: "/gallery", label: "Tidligere arbejde" },
              { href: "/about", label: "Om mig" },
              { href: "/contact", label: "Kontakt" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-amber-400">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wider text-white uppercase">
            Kontakt
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li className="flex items-center gap-2.5">
              <PhoneIcon className="h-4 w-4 shrink-0 text-amber-400" />
              <a href={`tel:${site.phone.replace(/[^0-9+]/g, "")}`} className="hover:text-amber-400">
                Ring eller skriv: {site.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <MailIcon className="h-4 w-4 shrink-0 text-amber-400" />
              <a href={`mailto:${site.email}`} className="break-all hover:text-amber-400">
                {site.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <span>{site.serviceArea}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wider text-white uppercase">
            Åbningstider
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm whitespace-pre-line">
            <li className="flex items-start gap-2.5">
              <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <span className="whitespace-pre-line">{site.hours}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row">
          <p>
            © {year} {site.businessName}. Alle rettigheder forbeholdes.
          </p>
          <EjerLoginBadge initialCount={unreadCount} />
        </div>
      </div>
    </footer>
  );
}
