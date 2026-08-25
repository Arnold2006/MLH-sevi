import PageHeader from "@/components/admin/PageHeader";
import PasswordForm from "@/components/admin/PasswordForm";
import { isUsingStoredPassword } from "@/lib/auth";

export default async function AdminPasswordPage() {
  const usingStored = await isUsingStoredPassword();
  return (
    <>
      <PageHeader
        title="Adgangskode"
        description="Skift ejer-koden til /admin/login. Server-admin koden fra .env.local virker altid — du kan logge ind med begge."
      />
      {usingStored ? (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200 ring-inset">
          Ejer-kode gemt i <code>data/password.json</code> — login accepterer både ejer-koden og server-koden (<code>ADMIN_PASSWORD</code> fra <code>.env.local</code>).
        </p>
      ) : (
        <p className="mb-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200 ring-inset">
          Ingen ejer-kode gemt endnu — login bruger kun server-koden <code>ADMIN_PASSWORD</code> fra <code>.env.local</code>.
        </p>
      )}
      <PasswordForm />
    </>
  );
}
