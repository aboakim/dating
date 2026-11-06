import { EXTEND_PLANS } from "@/lib/catalog";
import { cleanContent } from "@/lib/validate";
import { creatorView, getByToken, updateInvite } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const invite = await getByToken(params.token);
  if (!invite) return Response.json({ error: "Էջը չի գտնվել" }, { status: 404 });
  return Response.json(creatorView(invite), { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request, { params }) {
  const invite = await getByToken(params.token);
  if (!invite) return Response.json({ error: "Էջը չի գտնվել" }, { status: 404 });
  if (invite.editsLeft < 1) {
    return Response.json({ error: "Խմբագրումները վերջացել են" }, { status: 402 });
  }
  try {
    const body = await request.json();
    const content = cleanContent(body.draft || body);
    const next = await updateInvite(invite.id, async (current) => ({
      ...current,
      ...content,
      id: current.id,
      creatorToken: current.creatorToken,
      createdAt: current.createdAt,
      expiresAt: current.expiresAt,
      editsLeft: current.editsLeft - 1,
      price: current.price,
      method: current.method,
      ref: current.ref,
      response: current.response
    }));
    return Response.json(creatorView(next));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Չհաջողվեց պահել";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function POST(request, { params }) {
  const invite = await getByToken(params.token);
  if (!invite) return Response.json({ error: "Էջը չի գտնվել" }, { status: 404 });
  const body = await request.json().catch(() => ({}));

  if (body.action === "edit") {
    const next = await updateInvite(invite.id, async (current) => ({
      ...current,
      editsLeft: current.editsLeft + 1
    }));
    return Response.json(creatorView(next));
  }

  if (body.action === "extend") {
    const plan = EXTEND_PLANS.find((item) => item.days === Number(body.days));
    if (!plan) return Response.json({ error: "Ընտրիր ժամկետը" }, { status: 400 });
    const next = await updateInvite(invite.id, async (current) => {
      const base = Math.max(current.expiresAt, Date.now());
      return {
        ...current,
        expiresAt: Math.min(base + plan.days * 86400000, Date.now() + 3 * 365 * 86400000),
        editsLeft: current.editsLeft + plan.edits
      };
    });
    return Response.json(creatorView(next));
  }

  return Response.json({ error: "Անհայտ գործողություն" }, { status: 400 });
}
