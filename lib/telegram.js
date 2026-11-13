import { getDict, normalizeLocale } from "@/lib/i18n";
import { formatDateISO } from "@/lib/format";

const API = "https://api.telegram.org";

export function botUsername() {
  return String(process.env.NEXT_PUBLIC_BOT_USERNAME || process.env.TELEGRAM_BOT_USERNAME || "").replace(/^@/, "");
}

export function botDeepLink(token) {
  const user = botUsername();
  if (!user || !token) return "";
  return `https://t.me/${user}?start=${encodeURIComponent(token)}`;
}

export async function sendTelegram(chatId, text, buttons = []) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return { ok: false, skipped: true };
  const body = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true
  };
  if (buttons.length) {
    body.reply_markup = {
      inline_keyboard: buttons.map((row) => row)
    };
  }
  const response = await fetch(`${API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok && data.ok, data };
}

export function answerMessage(invite) {
  const dict = getDict(invite.locale);
  const picks = Object.values(invite.response?.picks || {}).filter(Boolean).join(" · ");
  const when = invite.response?.date
    ? `${formatDateISO(invite.response.date, invite.locale)}${invite.response.time ? `, ${invite.response.time}` : ""}`
    : "";
  return [
    `<b>${dict.bot.answered}</b>`,
    `${invite.recipientName}`,
    when,
    picks
  ]
    .filter(Boolean)
    .join("\n");
}

export function openedMessage(invite) {
  const dict = getDict(invite.locale);
  return `<b>${dict.bot.opened}</b>\n${invite.recipientName}`;
}

export function siteOrigin() {
  return String(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function creatorButtons(invite) {
  const dict = getDict(invite.locale);
  const url = `${siteOrigin()}/c/${invite.creatorToken}`;
  return [[{ text: dict.bot.openPage, url }]];
}

export { normalizeLocale };
