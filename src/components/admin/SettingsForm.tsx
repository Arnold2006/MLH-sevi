"use client";

import { useActionState } from "react";
import { saveSettings, type SaveState } from "@/app/admin/actions";
import ImageField from "./ImageField";

const initial: SaveState = {};

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-6">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export default function SettingsForm({
  site,
}: {
  site: import("@/lib/types").SiteSettings;
}) {
  const [state, action, pending] = useActionState(saveSettings, initial);

  return (
    <form action={action} className="space-y-6">
      {state.ok ? (
        <p className="sticky top-4 z-10 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700 ring-1 ring-green-200 ring-inset">
          Ændringerne er gemt – de er nu live på siden.
        </p>
      ) : null}
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 ring-inset">
          {state.error}
        </p>
      ) : null}

      <Section
        title="Virksomhedsoplysninger"
        hint="Vises i headeren, sidefoden og på kontaktsiden."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="businessName" className="label">Virksomhedsnavn</label>
            <input id="businessName" name="businessName" defaultValue={site.businessName} className="input" />
          </div>
          <div>
            <label htmlFor="tagline" className="label">Slagord</label>
            <input id="tagline" name="tagline" defaultValue={site.tagline} className="input" />
          </div>
          <div>
            <label htmlFor="phone" className="label">Telefonnummer</label>
            <input id="phone" name="phone" defaultValue={site.phone} className="input" />
          </div>
          <div>
            <label htmlFor="email" className="label">E-mailadresse</label>
            <input id="email" name="email" type="email" defaultValue={site.email} className="input" />
          </div>
        </div>
        <div>
          <label htmlFor="serviceArea" className="label">Serviceret område</label>
          <textarea id="serviceArea" name="serviceArea" rows={2} defaultValue={site.serviceArea} className="input resize-y" />
        </div>
        <div>
          <label htmlFor="hours" className="label">Åbningstider (én linje pr. dag)</label>
          <textarea id="hours" name="hours" rows={3} defaultValue={site.hours} className="input resize-y" />
        </div>
      </Section>

      <Section
        title="Forside-hero"
        hint="Det første, besøgende læser. Hold det kort og imødekommende."
      >
        <div>
          <label htmlFor="heroBadge" className="label">Lille badge over overskriften</label>
          <input id="heroBadge" name="heroBadge" defaultValue={site.heroBadge} className="input" placeholder="Autoriseret · Forsikret · Lokal" />
        </div>
        <div>
          <label htmlFor="heroHeadline" className="label">Overskrift</label>
          <input id="heroHeadline" name="heroHeadline" defaultValue={site.heroHeadline} className="input" />
        </div>
        <div>
          <label htmlFor="heroSubtext" className="label">Underoverskrift</label>
          <textarea id="heroSubtext" name="heroSubtext" rows={3} defaultValue={site.heroSubtext} className="input resize-y" />
        </div>
        <ImageField name="heroImage" label="Hero-billede" value={site.heroImage} positionValue={site.heroImagePosition} />
      </Section>

      <Section
        title="Om mig-sektionen"
        hint="Din historie – vises på Om-siden og i udsnittet på forsiden. Adskil afsnit med en tom linje."
      >
        <div>
          <label htmlFor="aboutHeadline" className="label">Overskrift</label>
          <input id="aboutHeadline" name="aboutHeadline" defaultValue={site.aboutHeadline} className="input" />
        </div>
        <div>
          <label htmlFor="aboutText" className="label">Historien</label>
          <textarea id="aboutText" name="aboutText" rows={8} defaultValue={site.aboutText} className="input resize-y" />
        </div>
        <ImageField name="aboutImage" label="Foto til Om-sektionen" value={site.aboutImage} positionValue={site.aboutImagePosition} />
      </Section>

      <Section title="Statistik & call-to-action">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="statYears" className="label">Badge: års erfaring</label>
            <input id="statYears" name="statYears" defaultValue={site.statYears} className="input" placeholder="15+" />
          </div>
          <div>
            <label htmlFor="statJobs" className="label">Statistik: udførte opgaver</label>
            <input id="statJobs" name="statJobs" defaultValue={site.statJobs} className="input" placeholder="2.400+" />
          </div>
        </div>
        <div>
          <label htmlFor="ctaHeadline" className="label">CTA-overskrift nederst på siden</label>
          <input id="ctaHeadline" name="ctaHeadline" defaultValue={site.ctaHeadline} className="input" />
        </div>
        <div>
          <label htmlFor="ctaText" className="label">CTA-tekst nederst på siden</label>
          <textarea id="ctaText" name="ctaText" rows={2} defaultValue={site.ctaText} className="input resize-y" />
        </div>
      </Section>

      <div className="flex justify-end pb-8">
        <button type="submit" disabled={pending} className="btn btn-primary px-8">
          {pending ? "Gemmer…" : "Gem alle ændringer"}
        </button>
      </div>
    </form>
  );
}
