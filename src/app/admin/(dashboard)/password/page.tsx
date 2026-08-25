import PageHeader from "@/components/admin/PageHeader";
import PasswordForm from "@/components/admin/PasswordForm";
import { isUsingStoredPassword } from "@/lib/auth";

export default async function AdminPasswordPage() {
  const usingStored = await isUsingStoredPassword();
  return (
    <>
      <PageHeader
        title="Adgangskode"
        description="Skift koden du bruger på /admin/login. Kræver at du kender den nuværende kode."
      />
      {usingStored ? (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200 ring-inset">
          Der ligger allerede en kode gemt i <code>data/password.json</code> på serveren — den overstyrer <code>.env.local</code>.
        </p>
      ) : (
        <p className="mb-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200 ring-inset">
          Ingen kode gemt endnu — login bruger <code>ADMIN_PASSWORD</code> fra <code>.env.local</code> (pt. “changeme” hvis ikke ændret).
        </p>
      )}
      <PasswordForm />
    </>
  );
}
