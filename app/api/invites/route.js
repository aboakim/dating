import { PRICE } from "@/lib/catalog";
import { cleanContent } from "@/lib/validate";
import { createInvite } from "@/lib/store";
import { botDeepLink } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const content = cleanContent(body.draft || body);
    const ref = /^[a-z0-9-]{4,24}$/i.test(body.ref || "") ? String(body.ref).toLowerCase() : "";
    const invite = await createInvite(content, { price: PRICE, method: "free", ref });
    return Response.json({
      id: invite.id,
      creatorToken: invite.creatorToken,
      expiresAt: invite.expiresAt,
      locale: invite.locale,
      botUrl: botDeepLink(invite.creatorToken)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Create failed";
    return Response.json({ error: message }, { status: 400 });
  }
}
