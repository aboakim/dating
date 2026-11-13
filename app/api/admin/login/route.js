import { adminConfigured, checkPassword, makeAdminCookie } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  if (!adminConfigured()) {
    return Response.json({ error: "Set ADMIN_PASSWORD in .env" }, { status: 503 });
  }
  const body = await request.json().catch(() => ({}));
  if (!checkPassword(body.password || "")) {
    return Response.json({ error: "Wrong password" }, { status: 401 });
  }
  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": makeAdminCookie(), "Cache-Control": "no-store" } }
  );
}
