import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { loadSite } from "@/lib/db";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await loadSite();
  return (
    <>
      <a
        href="#indhold"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Spring til indhold
      </a>
      <Header businessName={site.businessName} phone={site.phone} />
      <main id="indhold" className="flex-1">
        {children}
      </main>
      <Footer site={site} />
    </>
  );
}
