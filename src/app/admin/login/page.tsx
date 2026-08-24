import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import { isLoggedIn } from "@/lib/auth";
import { WrenchIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Ejer-login", robots: "noindex" };

export default async function LoginPage() {
  if (await isLoggedIn()) redirect("/admin");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4">
      <div className="card w-full max-w-sm p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="rounded-xl bg-amber-500 p-3 text-white">
            <WrenchIcon className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Ejer-login</h1>
          <p className="mt-1 text-sm text-slate-500">
            Indtast din adgangskode for at administrere siden.
          </p>
        </div>
        <LoginForm />
      </div>
      <Link
        href="/"
        className="mt-6 text-sm text-slate-500 transition-colors hover:text-slate-800"
      >
        ← Tilbage til hjemmesiden
      </Link>
    </div>
  );
}
