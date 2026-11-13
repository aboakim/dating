import { isAdminRequest } from "@/lib/adminAuth";
import { getSiteConfig, publicSiteConfig, saveSiteConfig } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const config = await getSiteConfig();
  if (!isAdminRequest(request)) {
    return Response.json(publicSiteConfig(config), { headers: { "Cache-Control": "no-store" } });
  }
  return Response.json(config, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request) {
  if (!isAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const saved = await saveSiteConfig(body || {});
  return Response.json(saved);
}
