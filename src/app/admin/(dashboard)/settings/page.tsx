import { loadSite } from "@/lib/db";
import PageHeader from "@/components/admin/PageHeader";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const site = await loadSite();
  return (
    <>
      <PageHeader
        title="Indstillinger"
        description="Opdatér virksomhedsoplysninger, forsidetekster, billeder og kontaktoplysninger."
      />
      <SettingsForm site={site} />
    </>
  );
}
