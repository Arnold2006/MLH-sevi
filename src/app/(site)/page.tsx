import Link from "next/link";
import { loadGallery, loadServices, loadSite } from "@/lib/db";
import { SectionHeading } from "@/components/ui";
import ProjectCard from "@/components/site/ProjectCard";
import CtaBanner from "@/components/site/CtaBanner";
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  DollarIcon,
  ShieldCheckIcon,
  StarIcon,
} from "@/components/icons";

export default async function HomePage() {
  const [site, services, gallery] = await Promise.all([
    loadSite(),
    loadServices(),
    loadGallery(),
  ]);

  const featured = services.slice(0, 6);
  const recent = gallery.slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl"
        />
        <div className="container-x relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            {site.heroBadge ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-amber-300">
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                {site.heroBadge}
              </span>
            ) : null}
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {site.heroHeadline}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
              {site.heroSubtext}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="btn btn-primary">
                Få et uforpligtende tilbud
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <a
                href={`tel:${site.phone.replace(/[^0-9+]/g, "")}`}
                className="btn border border-white/25 text-white hover:bg-white/10"
              >
                Ring {site.phone}
              </a>
            </div>
          </div>

          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.heroImage}
              alt={`${site.businessName} på opgave`}
              width={1200}
              height={900}
              className="aspect-[4/3] w-full rounded-2xl object-cover shadow-2xl ring-1 ring-white/10"
              style={{ objectPosition: site.heroImagePosition || "50% 50%" }}
            />
            <div className="absolute -bottom-6 left-4 flex items-center gap-3 rounded-xl bg-white p-4 shadow-xl sm:left-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <StarIcon className="h-5 w-5 fill-current" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {site.statJobs} opgaver udført
                </p>
                <p className="text-xs text-slate-500">5-stjernet service</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-slate-100 bg-white">
        <div className="container-x grid grid-cols-2 gap-6 py-10 lg:grid-cols-4">
          {[
            {
              icon: ShieldCheckIcon,
              title: "Professionel og omhyggelig",
              sub: "Fuld tryghed ved alle opgaver",
            },
            {
              icon: DollarIcon,
              title: "Pris på forhånd",
              sub: "Ingen overraskelser – pris før vi går i gang",
            },
            {
              icon: ClockIcon,
              title: "Altid til tiden",
              sub: "Din kalender bliver respekteret",
            },
            {
              icon: StarIcon,
              title: "Tilfredshedsgaranti",
              sub: "Ikke tilfreds? Så retter jeg det",
            },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{title}</p>
                <p className="truncate text-xs text-slate-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services preview */}
      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="container-x">
          <SectionHeading
            eyebrow="Mine ydelser"
            title="Håndværkeropgaver uden hovedpine"
            description="Ét opkald rydder listen af ting, der har ligget og ventet. De fleste projekter er færdige i ét besøg."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((service) => (
              <article
                key={service.id}
                className="card group p-6 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600">
                  {service.title}
                </h3>
                <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {service.description}
                </p>
                <p className="mt-4 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200 ring-inset">
                  {service.rate}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/services" className="btn btn-outline">
              Se alle ydelser
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-white py-20 sm:py-24">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.aboutImage}
              alt={`Om ${site.businessName}`}
              loading="lazy"
              width={1000}
              height={1150}
              className="aspect-[4/3] w-full rounded-2xl object-cover shadow-lg"
              style={{ objectPosition: site.aboutImagePosition || "50% 50%" }}
            />
            <div className="absolute -right-3 -bottom-6 rounded-xl bg-amber-500 px-5 py-4 text-white shadow-lg sm:right-6">
              <p className="text-2xl font-extrabold">{site.statYears}</p>
              <p className="text-xs font-medium tracking-wide uppercase">
                års erfaring
              </p>
            </div>
          </div>
          <div>
            <p className="eyebrow">Hvorfor vælge {site.businessName}</p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {site.homeWhyTitle || "Professionelt håndværk. Personlig service."}
            </h2>
            <div className="mt-5 space-y-4 leading-7 text-slate-600">
              {site.aboutText
                .split(/\n\s*\n/)
                .slice(0, 2)
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
            </div>
            <ul className="mt-6 space-y-3">
              {(site.homeWhyBullets
                ? site.homeWhyBullets.split("\n").map((s) => s.trim()).filter(Boolean)
                : [
                    "Gratis og uforpligtende tilbud",
                    "Gulve beskyttes og roden ryddes op – ved hver eneste opgave",
                    "De fleste projekter færdige i ét besøg",
                    "Mødestabil, autoriseret og fuldt forsikret",
                  ]
              ).map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <Link href="/about" className="btn btn-dark mt-8">
              Læs mere om mig
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Recent work */}
      {recent.length > 0 ? (
        <section className="bg-slate-50 py-20 sm:py-24">
          <div className="container-x">
            <SectionHeading
              eyebrow="Tidligere arbejde"
              title="Stolt af hvert resultat"
              description="Et udvalg af de nyeste projekter fra kvarteret."
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {recent.map((item) => (
                <ProjectCard key={item.id} item={item} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/gallery" className="btn btn-outline">
                Se hele galleriet
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <div className="pt-20 sm:pt-24">
        <CtaBanner site={site} />
      </div>
    </>
  );
}
