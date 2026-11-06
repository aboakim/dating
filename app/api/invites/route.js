import { PRICE, PAY_METHODS } from "@/lib/catalog";
import { cleanContent } from "@/lib/validate";
import { createInvite } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const content = cleanContent(body.draft || body);
    const method = PAY_METHODS.some((item) => item.id === body.method) ? body.method : "idram";
    const ref = /^[a-z0-9-]{4,24}$/i.test(body.ref || "") ? String(body.ref).toLowerCase() : "";
    const invite = await createInvite(content, { price: PRICE, method, ref });
    return Response.json({
      id: invite.id,
      creatorToken: invite.creatorToken,
      expiresAt: invite.expiresAt
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Չհաջողվեց ստեղծել";
    return Response.json({ error: message }, { status: 400 });
  }
}
