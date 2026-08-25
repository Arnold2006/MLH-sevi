import { loadMessages } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const messages = await loadMessages();
    const count = messages.filter((m) => !m.read).length;
    return Response.json({ count }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ count: 0 }, { headers: { "Cache-Control": "no-store" } });
  }
}
