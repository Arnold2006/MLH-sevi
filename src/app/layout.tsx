import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { loadSite } from "@/lib/db";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const site = await loadSite();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${site.businessName} | ${site.tagline}`,
      template: `%s | ${site.businessName}`,
    },
    description: site.heroSubtext,
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="da" className={inter.variable}>
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
