import { loadGallery } from "@/lib/db";
import { GALLERY_CATEGORIES } from "@/lib/constants";
import PageHeader from "@/components/admin/PageHeader";
import GalleryUploadForm from "@/components/admin/GalleryUploadForm";
import GalleryEditCard from "@/components/admin/GalleryEditCard";

export default async function AdminGalleryPage() {
  const gallery = await loadGallery();

  return (
    <>
      <PageHeader
        title="Galleri"
        description="Hvert projekt er et udført job med tekst og op til 5 billeder. Klik på et billede under projektet for at se det."
      />

      <GalleryUploadForm categories={GALLERY_CATEGORIES} />

      {gallery.length === 0 ? (
        <p className="card p-10 text-center text-sm text-slate-500">
          Ingen billeder endnu – upload dit første projekt ovenfor.
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {gallery.map((item) => (
            <GalleryEditCard key={item.id} item={item} categories={GALLERY_CATEGORIES} />
          ))}
        </div>
      )}
    </>
  );
}
