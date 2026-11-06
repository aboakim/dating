import { getById, publicInvite } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const invite = await getById(params.id);
  if (!invite) return Response.json({ error: "Հրավերը չի գտնվել" }, { status: 404 });
  if (invite.expiresAt < Date.now()) {
    return Response.json({ error: "Հրավերի ժամկետն անցել է" }, { status: 410 });
  }
  return Response.json(publicInvite(invite), { headers: { "Cache-Control": "no-store" } });
}
