import Link from "next/link";
import { logout } from "../actions";
import { requireAdmin } from "@/lib/auth";
import { loadSite } from "@/lib/db";
import AdminNav from "@/components/admin/AdminNav";
import { ExternalLinkIcon, LogOutIcon, WrenchIcon } from "@/components/icons";

export const metadata = { robots: "noindex" };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const site = await loadSite();

  return (
    <div className="min-h-screen bg-slate-100">
      <a
        href="#admin-indhold"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Spring til indhold
      </a>
      <div className="mx-auto flex w-full max-w-[90rem]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
          <div className="flex items-center gap-2.5 border-b border-slate-200 p-5">
            <span className="rounded-lg bg-amber-500 p-2 text-white">
              <WrenchIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {site.businessName}
              </p>
              <p className="text-xs text-slate-400">Administration</p>
            </div>
          </div>
          <AdminNav orientation="vertical" />
          <div className="mt-auto space-y-1 border-t border-slate-200 p-4">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <ExternalLinkIcon className="h-4 w-4" /> Se hjemmesiden
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
              >
                <LogOutIcon className="h-4 w-4" /> Log ud
              </button>
            </form>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-slate-200 bg-white md:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-bold text-slate-900">
                {site.businessName} · Administration
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  aria-label="Log ud"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600"
                >
                  <LogOutIcon className="h-5 w-5" />
                </button>
              </form>
            </div>
            <AdminNav orientation="horizontal" />
          </div>
          <main id="admin-indhold" className="flex-1 p-4 sm:p-6 lg:p-10">
            <div className="mx-auto max-w-5xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
