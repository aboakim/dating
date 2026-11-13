import { clearAdminCookie } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST() {
  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": clearAdminCookie(), "Cache-Control": "no-store" } }
  );
}
