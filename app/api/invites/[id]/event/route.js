import { getById, updateInvite, publicInvite } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  const existing = await getById(params.id);
  if (!existing) return Response.json({ error: "Հրավերը չի գտնվել" }, { status: 404 });
  if (existing.expiresAt < Date.now()) {
    return Response.json({ error: "Հրավերի ժամկետն անցել է" }, { status: 410 });
  }
  const body = await request.json().catch(() => ({}));

  if (body.type === "unlock") {
    const ok = existing.open.mode === "pin" && String(body.pin || "") === existing.open.pin;
    return Response.json({ ok }, { status: ok ? 200 : 400 });
  }

  const invite = await updateInvite(existing.id, async (current) => {
    const response = { ...current.response };
    if (body.type === "open") {
      response.openedCount += 1;
      if (!response.openedAt) response.openedAt = Date.now();
    }
    if (body.type === "no") {
      const count = Number(body.count) || 0;
      if (count > response.noAttempts && count < 500) response.noAttempts = count;
    }
    if (body.type === "answer" && !response.answer) {
      response.answer = "yes";
      response.answeredAt = Date.now();
      response.date = current.when.mode === "creator" ? current.when.date : String(body.date || "");
      response.time = current.when.mode === "creator" ? current.when.time : String(body.time || "");
      const picks = {};
      if (body.picks && typeof body.picks === "object") {
        for (const choice of current.choices) {
          const value = String(body.picks[choice.id] || "");
          if (choice.items.some((item) => item.label === value)) picks[choice.id] = value;
        }
      }
      response.picks = picks;
    }
    return { ...current, response };
  });

  return Response.json(publicInvite(invite), { headers: { "Cache-Control": "no-store" } });
}
