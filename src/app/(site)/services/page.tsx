import Link from "next/link";
import type { Metadata } from "next";
import { loadServices, loadSite } from "@/lib/db";
import { PageBand } from "@/components/ui";
import CtaBanner from "@/components/site/CtaBanner";
import {
  DropletIcon,
  HammerIcon,
  PaintRollerIcon,
  RulerIcon,
  WrenchIcon,
  ZapIcon,
} from "@/components/icons";

const ICONS = [
  WrenchIcon,
  DropletIcon,
  ZapIcon,
  HammerIcon,
  PaintRollerIcon,
  RulerIcon,
];

export const metadata: Metadata = { title: "Ydelser" };

export default async function ServicesPage() {
  const [site, services] = await Promise.all([loadSite(), loadServices()]);
  return (
    <>
      <PageBand
        eyebrow="Ydelser"
        title="Er det gået i stykker, sætter fast eller drypper – så står det på listen."
        description={`Enkle priser, ærlig rådgivning og håndværk med tilfredshedsgaranti. Betjener ${site.serviceArea
          .split(/[—–]/)[0]
          .trim()} og omegn.`}
      />

      <section className="bg-white py-16 sm:py-20">
        <div className="container-x">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <article
                  key={service.id}
                  className="card group p-6 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    {service.title}
                  </h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {service.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200 ring-inset">
                      {service.rate}
                    </span>
                    <Link
                      href="/contact"
                      className="text-xs font-semibold text-slate-500 transition-colors group-hover:text-amber-600"
                    >
                      Få et tilbud →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="mx-auto mt-14 max-w-xl text-center text-sm leading-6 text-slate-500">
            Kan du ikke finde din opgave på listen? Spørg endelig – involverer
            den værktøj og sund fornuft, er der gode chancer for, at jeg kan
            løse den.
          </p>
        </div>
      </section>

      <CtaBanner site={site} />
    </>
  );
}
