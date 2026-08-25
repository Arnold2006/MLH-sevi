import { listMediaWithStatus } from "@/lib/media";
import PageHeader from "@/components/admin/PageHeader";
import MediaManagerClient from "@/components/admin/MediaManagerClient";

export default async function AdminMediaPage() {
  const files = await listMediaWithStatus();
  return (
    <>
      <PageHeader
        title="Mediebibliotek"
        description="Upload én gang, brug overalt. Forældreløse filer er billeder i public/uploads som ikke bruges i galleri eller indstillinger — dem kan du slette med ét klik."
      />
      <MediaManagerClient files={files} />
    </>
  );
}
