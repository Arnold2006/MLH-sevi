import { deleteMessage, setMessageRead } from "../../actions";
import { loadMessages } from "@/lib/db";
import PageHeader from "@/components/admin/PageHeader";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { MailIcon, PhoneIcon, TrashIcon } from "@/components/icons";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminMessagesPage() {
  const messages = await loadMessages();
  const unread = messages.filter((m) => !m.read).length;

  return (
    <>
      <PageHeader
        title="Beskeder"
        description={
          unread > 0
            ? unread === 1
              ? "1 ulæst besked fra kontaktformularen."
              : `${unread} ulæste beskeder fra kontaktformularen.`
            : "Beskeder fra kontaktformularen lander her."
        }
      />

      {messages.length === 0 ? (
        <div className="card flex flex-col items-center p-12 text-center">
          <MailIcon className="h-10 w-10 text-slate-300" />
          <p className="mt-4 text-sm text-slate-500">
            Ingen beskeder endnu. Når nogen udfylder kontaktformularen, vises
            beskeden her.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`card p-5 ${m.read ? "" : "ring-1 ring-amber-300"}`}
            >
              <details>
                <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    {!m.read ? (
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500" />
                    ) : (
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-200" />
                    )}
                    <span className={`text-base ${m.read ? "font-semibold text-slate-700" : "font-bold text-slate-900"}`}>
                      {m.name}
                    </span>
                    <span className="truncate text-sm text-slate-500">
                      {m.email}
                    </span>
                    <span className="ml-auto shrink-0 text-xs text-slate-400">
                      {formatDate(m.createdAt)}
                    </span>
                  </div>
                  <p className={`mt-1.5 pl-[18px] text-sm ${m.read ? "text-slate-500" : "text-slate-600"}`}>
                    {m.message.length > 140 ? m.message.slice(0, 140) + "…" : m.message}
                  </p>
                </summary>

                <div className="mt-4 space-y-4 border-t border-slate-100 pt-4 pl-[18px]">
                  <p className="text-sm leading-7 whitespace-pre-wrap text-slate-700">
                    {m.message}
                  </p>
                  {m.phone ? (
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <PhoneIcon className="h-4 w-4 text-slate-400" />
                      <a href={`tel:${m.phone.replace(/[^0-9+]/g, "")}`} className="hover:text-amber-600">
                        {m.phone}
                      </a>
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <form action={setMessageRead}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="read" value={(!m.read).toString()} />
                      <button type="submit" className="btn btn-outline btn-sm">
                        Markér som {m.read ? "ulæst" : "læst"}
                      </button>
                    </form>
                    <a href={`mailto:${m.email}`} className="btn btn-outline btn-sm">
                      Svar på e-mail
                    </a>
                    <form action={deleteMessage} className="ml-auto">
                      <input type="hidden" name="id" value={m.id} />
                      <ConfirmButton
                        message={`Slette denne besked fra ${m.name}?`}
                        className="btn btn-danger btn-sm inline-flex items-center gap-1.5"
                      >
                        <TrashIcon className="h-3.5 w-3.5" /> Slet
                      </ConfirmButton>
                    </form>
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
