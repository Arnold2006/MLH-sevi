import { loadSite } from "@/lib/db";
import { listMediaFiles } from "@/lib/media";
import PageHeader from "@/components/admin/PageHeader";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const [site, mediaFiles] = await Promise.all([loadSite(), listMediaFiles()]);
  return (
    <>
      <PageHeader
        title="Indstillinger"
        description="Opdatér virksomhedsoplysninger, forsidetekster, billeder og kontaktoplysninger."
      />
      <SettingsForm site={site} mediaFiles={mediaFiles} />
    </>
  );
}
