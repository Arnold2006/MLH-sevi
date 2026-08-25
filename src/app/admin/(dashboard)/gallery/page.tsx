import { loadGallery } from "@/lib/db";
import { listMediaFiles } from "@/lib/media";
import { GALLERY_CATEGORIES } from "@/lib/constants";
import PageHeader from "@/components/admin/PageHeader";
import GalleryUploadForm from "@/components/admin/GalleryUploadForm";
import GalleryEditCard from "@/components/admin/GalleryEditCard";

export default async function AdminGalleryPage() {
  const [gallery, mediaFiles] = await Promise.all([loadGallery(), listMediaFiles()]);

  return (
    <>
      <PageHeader
        title="Galleri"
        description="Hvert projekt henter billeder fra Mediebiblioteket. Upload først i Medier, vælg derefter op til 5 billeder pr. projekt."
      />

      <GalleryUploadForm categories={GALLERY_CATEGORIES} mediaFiles={mediaFiles} />

      {gallery.length === 0 ? (
        <p className="card p-10 text-center text-sm text-slate-500">
          Ingen projekter endnu – vælg billeder fra Mediebiblioteket ovenfor.
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {gallery.map((item) => (
            <GalleryEditCard key={item.id} item={item} categories={GALLERY_CATEGORIES} mediaFiles={mediaFiles} />
          ))}
        </div>
      )}
    </>
  );
}
