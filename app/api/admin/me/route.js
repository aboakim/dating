import { adminConfigured, isAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  return Response.json(
    {
      ok: isAdminRequest(request),
      configured: adminConfigured()
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
