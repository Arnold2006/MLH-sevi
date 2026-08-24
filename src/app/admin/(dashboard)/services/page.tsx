import {
  deleteService,
  moveService,
  upsertService,
} from "../../actions";
import { loadServices } from "@/lib/db";
import PageHeader from "@/components/admin/PageHeader";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { PlusIcon, TrashIcon } from "@/components/icons";

export default async function AdminServicesPage() {
  const services = await loadServices();

  return (
    <>
      <PageHeader
        title="Ydelser"
        description="Det, du tilbyder – i samme rækkefølge, som besøgende ser det. Brug pilene til at ændre rækkefølgen."
      />

      <div className="space-y-4">
        {services.map((service, idx) => (
          <div key={service.id} className="card p-5">
            <form id={`edit-${service.id}`} action={upsertService} className="space-y-4">
              <input type="hidden" name="id" value={service.id} />
              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <div>
                  <label className="label">Ydelsens navn</label>
                  <input
                    name="title"
                    defaultValue={service.title}
                    className="input"
                    required
                  />
                </div>
                <div className="sm:w-40">
                  <label className="label">Prisangivelse</label>
                  <input
                    name="rate"
                    defaultValue={service.rate}
                    className="input"
                    placeholder="fra 399 kr."
                  />
                </div>
              </div>
              <div>
                <label className="label">Beskrivelse</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={service.description}
                  className="input resize-y"
                />
              </div>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
              <button
                type="submit"
                form={`edit-${service.id}`}
                className="btn btn-primary btn-sm"
              >
                Gem ændringer
              </button>

              <form action={moveService}>
                <input type="hidden" name="id" value={service.id} />
                <input type="hidden" name="dir" value="up" />
                <button
                  type="submit"
                  disabled={idx === 0}
                  aria-label="Flyt op"
                  className="btn btn-outline btn-sm disabled:opacity-40"
                >
                  ↑
                </button>
              </form>
              <form action={moveService}>
                <input type="hidden" name="id" value={service.id} />
                <input type="hidden" name="dir" value="down" />
                <button
                  type="submit"
                  disabled={idx === services.length - 1}
                  aria-label="Flyt ned"
                  className="btn btn-outline btn-sm disabled:opacity-40"
                >
                  ↓
                </button>
              </form>

              <form action={deleteService} className="ml-auto">
                <input type="hidden" name="id" value={service.id} />
                <ConfirmButton
                  message={`Slette "${service.title}"? Dette kan ikke fortrydes.`}
                  className="btn btn-danger btn-sm inline-flex items-center gap-1.5"
                >
                  <TrashIcon className="h-3.5 w-3.5" /> Slet
                </ConfirmButton>
              </form>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-6 border-dashed p-5">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <PlusIcon className="h-5 w-5 text-amber-600" /> Tilføj en ny ydelse
        </h2>
        <form action={upsertService} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <label className="label">Ydelsens navn *</label>
              <input name="title" required className="input" placeholder="fx Rengøring af tagsrender" />
            </div>
            <div className="sm:w-40">
              <label className="label">Prisangivelse</label>
              <input name="rate" className="input" placeholder="fra 399 kr." />
            </div>
          </div>
          <div>
            <label className="label">Beskrivelse</label>
            <textarea
              name="description"
              rows={2}
              className="input resize-y"
              placeholder="En eller to korte sætninger, der beskriver opgaven."
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            Tilføj ydelse
          </button>
        </form>
      </div>
    </>
  );
}
