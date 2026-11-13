import { isAdminRequest } from "@/lib/adminAuth";
import { adminStats, deleteInvite, listInvites } from "@/lib/storeAdmin";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!isAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const invites = await listInvites();
  const stats = await adminStats();
  return Response.json({ invites, stats }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request) {
  if (!isAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  const ok = await deleteInvite(id);
  if (!ok) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ok: true });
}
