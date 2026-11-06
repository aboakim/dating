import { countRef } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const code = String(params.code || "").toLowerCase();
  if (!/^[a-z0-9-]{4,24}$/.test(code)) {
    return Response.json({ error: "Կոդը վավեր չէ" }, { status: 400 });
  }
  const stats = await countRef(code);
  return Response.json(stats, { headers: { "Cache-Control": "no-store" } });
}
