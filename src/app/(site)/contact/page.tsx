import type { Metadata } from "next";
import { loadSite } from "@/lib/db";
import { PageBand } from "@/components/ui";
import ContactForm from "@/components/site/ContactForm";
import {
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/icons";

export const metadata: Metadata = { title: "Kontakt" };

export default async function ContactPage() {
  const site = await loadSite();
  return (
    <>
      <PageBand
        eyebrow="Kontakt"
        title="Lad os tale om din opgave"
        description="Send en besked eller ring direkte – hvad der passer dig bedst. Tilbuddet er altid gratis."
      />

      <section className="bg-white py-16 sm:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-5">
          <div className="card p-6 sm:p-8 lg:col-span-3">
            <h2 className="text-xl font-bold text-slate-900">
              Anmod om et gratis tilbud
            </h2>
            <p className="mt-1 mb-6 text-sm text-slate-500">
              Felter markeret med * skal udfyldes.
            </p>
            <ContactForm />
          </div>

          <div className="space-y-4 lg:col-span-2">
            <div className="card divide-y divide-slate-100">
              <a
                href={`tel:${site.phone.replace(/[^0-9+]/g, "")}`}
                className="flex items-center gap-4 p-5 transition-colors hover:bg-slate-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <PhoneIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Ring eller skriv
                  </p>
                  <p className="font-semibold text-slate-900">{site.phone}</p>
                </div>
              </a>
              <a
                href={`mailto:${site.email}`}
                className="flex items-center gap-4 p-5 transition-colors hover:bg-slate-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <MailIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    E-mail
                  </p>
                  <p className="truncate font-semibold break-all text-slate-900">
                    {site.email}
                  </p>
                </div>
              </a>
              <div className="flex items-start gap-4 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <ClockIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Åbningstider
                  </p>
                  <p className="text-sm whitespace-pre-line text-slate-700">
                    {site.hours}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <MapPinIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Serviceret område
                  </p>
                  <p className="text-sm leading-6 text-slate-700">
                    {site.serviceArea}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm leading-6 text-amber-900">
                <strong>Akut behov for hjælp?</strong> Beskeder besvares inden
                for én hverdag. Ved akutte skader – fx en aktiv lækage – er det
                hurtigst at ringe.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
