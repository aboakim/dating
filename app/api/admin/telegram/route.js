import { isAdminRequest } from "@/lib/adminAuth";
import { getSiteConfig, saveSiteConfig } from "@/lib/siteConfig";
import { botUsername, siteOrigin } from "@/lib/telegram";

export const dynamic = "force-dynamic";

async function telegramApi(method, payload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN missing");
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {})
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.description || "Telegram API failed");
  return data.result;
}

export async function GET(request) {
  if (!isAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const config = await getSiteConfig();
  let me = null;
  let webhook = null;
  try {
    me = await telegramApi("getMe");
    webhook = await telegramApi("getWebhookInfo");
  } catch (error) {
    return Response.json({
      ok: false,
      error: error.message,
      botUsername: botUsername(),
      site: siteOrigin(),
      webhookSetAt: config.telegram.webhookSetAt
    });
  }
  return Response.json({
    ok: true,
    botUsername: botUsername() || me?.username || "",
    me,
    webhook,
    site: siteOrigin(),
    webhookUrl: `${siteOrigin()}/api/telegram/webhook`,
    webhookSetAt: config.telegram.webhookSetAt
  });
}

export async function POST(request) {
  if (!isAdminRequest(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const action = body.action || "setWebhook";
  if (action === "setWebhook") {
    const url = `${siteOrigin()}/api/telegram/webhook`;
    const payload = { url, drop_pending_updates: true };
    if (process.env.TELEGRAM_WEBHOOK_SECRET) {
      payload.secret_token = process.env.TELEGRAM_WEBHOOK_SECRET;
    }
    const result = await telegramApi("setWebhook", payload);
    await saveSiteConfig({ telegram: { webhookSetAt: Date.now() } });
    return Response.json({ ok: true, result, url });
  }
  if (action === "deleteWebhook") {
    const result = await telegramApi("deleteWebhook", { drop_pending_updates: true });
    await saveSiteConfig({ telegram: { webhookSetAt: null } });
    return Response.json({ ok: true, result });
  }
  return Response.json({ error: "Unknown action" }, { status: 400 });
}
