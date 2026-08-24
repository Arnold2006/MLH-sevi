import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { PhoneIcon } from "@/components/icons";

export default function CtaBanner({ site }: { site: SiteSettings }) {
  return (
    <section className="container-x pb-20 sm:pb-24">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-16 text-center sm:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl"
        />
        <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {site.ctaHeadline}
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-lg leading-8 whitespace-pre-line text-slate-300">
          {site.ctaText}
        </p>
        <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={`tel:${site.phone.replace(/[^0-9+]/g, "")}`}
            className="btn btn-primary"
          >
            <PhoneIcon className="h-4 w-4" /> Ring {site.phone}
          </a>
          <Link href="/contact" className="btn btn-light">
            Få et gratis tilbud
          </Link>
        </div>
      </div>
    </section>
  );
}
