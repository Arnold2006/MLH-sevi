import type { Metadata } from "next";
import { loadSite } from "@/lib/db";
import CtaBanner from "@/components/site/CtaBanner";
import {
  CheckIcon,
  ShieldCheckIcon,
  StarIcon,
} from "@/components/icons";

export const metadata: Metadata = { title: "Om mig" };

export default async function AboutPage() {
  const site = await loadSite();
  const paragraphs = site.aboutText.split(/\n\s*\n/).filter(Boolean);

  return (
    <>
      <section className="bg-white py-20 sm:py-24">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <div className="relative order-2 lg:order-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.aboutImage}
              alt={`Ejeren bag ${site.businessName}`}
              width={1000}
              height={1150}
              className="aspect-[4/5] w-full rounded-2xl object-cover shadow-lg sm:aspect-[4/3] lg:aspect-[4/5]"
              style={{ objectPosition: site.aboutImagePosition || "50% 50%" }}
            />
            <div className="absolute -right-3 -bottom-6 rounded-xl bg-amber-500 px-5 py-4 text-white shadow-lg sm:right-6">
              <p className="text-2xl font-extrabold">{site.statYears}</p>
              <p className="text-xs font-medium tracking-wide uppercase">
                års erfaring
              </p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="eyebrow">Om mig</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {site.aboutHeadline}
            </h1>
            <div className="mt-6 space-y-4 leading-7 text-slate-600">
              {paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50 py-14">
        <div className="container-x grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
          {[
            {
              icon: ShieldCheckIcon,
              value: "Professionel og omhyggelig",
              label: "Alle opgaver er fuldt dækket",
            },
            {
              icon: StarIcon,
              value: site.statJobs,
              label: "Udførte opgaver – og flere på vej",
            },
            {
              icon: CheckIcon,
              value: "100%",
              label: "Tilfredshedsgaranti",
            },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Icon className="h-6 w-6" />
              </span>
              <p className="text-2xl font-extrabold text-slate-900">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="py-20 sm:py-24">
        <CtaBanner site={site} />
      </div>
    </>
  );
}
