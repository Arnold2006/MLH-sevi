import type { Metadata } from "next";
import { loadGallery } from "@/lib/db";
import { PageBand } from "@/components/ui";
import GalleryClient from "@/components/site/GalleryClient";

export const metadata: Metadata = { title: "Galleri" };

export default async function GalleryPage() {
  const gallery = await loadGallery();
  return (
    <>
      <PageBand
        eyebrow="Portfolio"
        title="Tidligere arbejde i kvarteret"
        description="Ægte projekter og blanke resultater. Klik på et billede for at se detaljerne."
      />
      <section className="bg-white py-16 sm:py-20">
        <div className="container-x">
          <GalleryClient items={gallery} />
        </div>
      </section>
    </>
  );
}
