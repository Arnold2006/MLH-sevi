import Link from "next/link";
import { loadGallery, loadMessages, loadServices } from "@/lib/db";
import PageHeader from "@/components/admin/PageHeader";
import {
  ArrowRightIcon,
  ImageIcon,
  InboxIcon,
  WrenchIcon,
} from "@/components/icons";

export default async function AdminOverviewPage() {
  const [services, gallery, messages] = await Promise.all([
    loadServices(),
    loadGallery(),
    loadMessages(),
  ]);
  const unread = messages.filter((m) => !m.read).length;

  const stats = [
    {
      label: "Ydelser på siden",
      value: services.length,
      href: "/admin/services",
      icon: WrenchIcon,
    },
    {
      label: "Billeder i galleriet",
      value: gallery.length,
      href: "/admin/gallery",
      icon: ImageIcon,
    },
    {
      label: "Ulæste beskeder",
      value: unread,
      href: "/admin/messages",
      icon: InboxIcon,
    },
  ];

  return (
    <>
      <PageHeader
        title="Oversigt"
        description="Alt, som besøgende ser, kan redigeres herfra."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="card group flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-extrabold text-slate-900">{value}</p>
              <p className="truncate text-xs text-slate-500">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-bold text-slate-900">Genveje</h2>
          <ul className="mt-4 space-y-1 text-sm">
            {[
              { href: "/admin/gallery", label: "Upload et nyt projektbillede" },
              { href: "/admin/services", label: "Tilføj eller redigér en ydelse" },
              {
                href: "/admin/settings",
                label: "Opdatér telefonnummer, åbningstider eller teksten om mig",
              },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-50"
                >
                  {item.label}
                  <ArrowRightIcon className="h-4 w-4 text-slate-400" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Seneste beskeder</h2>
            <Link
              href="/admin/messages"
              className="text-xs font-semibold text-amber-600 hover:text-amber-700"
            >
              Se alle →
            </Link>
          </div>
          {messages.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Ingen beskeder endnu.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {messages.slice(0, 4).map((m) => (
                <li
                  key={m.id}
                  className="rounded-lg border border-slate-100 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    {!m.read ? (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-amber-500"
                        aria-label="Ulæst"
                      />
                    ) : null}
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {m.name}
                    </p>
                    <p className="ml-auto shrink-0 text-xs text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString("da-DK", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <p className="mt-1 truncate pl-4 text-xs text-slate-500">
                    {m.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
