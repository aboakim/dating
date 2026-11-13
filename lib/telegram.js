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

export function guestBotDeepLink(inviteId) {
  const user = botUsername();
  if (!user || !inviteId) return "";
  return `https://t.me/${user}?start=${encodeURIComponent(`g_${inviteId}`)}`;
}

export async function sendTelegram(chatId, text, buttons = [], replyMarkup = null) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return { ok: false, skipped: true };
  const body = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true
  };
  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  } else if (buttons.length) {
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

export async function getTelegramChat(chatId) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return null;
  const response = await fetch(`${API}/bot${token}/getChat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId })
  });
  const data = await response.json().catch(() => ({}));
  return data.ok ? data.result : null;
}

export function whoReplyKeyboard(locale) {
  const dict = getDict(locale);
  return {
    keyboard: [
      [
        {
          text: dict.bot.pickContact,
          request_users: {
            request_id: 1,
            user_is_bot: false,
            max_quantity: 1
          }
        }
      ]
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
    selective: true
  };
}

export function removeReplyKeyboard() {
  return { remove_keyboard: true };
}

export function answerMessage(invite) {
  const dict = getDict(invite.locale);
  const picks = Object.values(invite.response?.picks || {}).filter(Boolean).join(" · ");
  const when = invite.response?.date
    ? `${formatDateISO(invite.response.date, invite.locale)}${invite.response.time ? `, ${invite.response.time}` : ""}`
    : "";
  return [
    `<b>${dict.bot.answered}</b>`,
    invite.recipientName ? `${invite.recipientName}` : "",
    invite.recipientTelegram ? `@${invite.recipientTelegram}` : "",
    when,
    picks
  ]
    .filter(Boolean)
    .join("\n");
}

export function openedMessage(invite) {
  const dict = getDict(invite.locale);
  const who = invite.recipientTelegram
    ? `\n@${invite.recipientTelegram}`
    : invite.recipientTelegramUserId
      ? `\nID ${invite.recipientTelegramUserId}`
      : "";
  return `<b>${dict.bot.opened}</b>\n${invite.recipientName || ""}${who}`;
}

export function siteOrigin() {
  return String(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function guestWebLink(inviteId) {
  return `${siteOrigin()}/i/${inviteId}`;
}

export function creatorButtons(invite) {
  const dict = getDict(invite.locale);
  return [
    [{ text: dict.bot.askWho, callback_data: `askwho:${invite.id}` }],
    [{ text: dict.bot.openPage, url: `${siteOrigin()}/c/${invite.creatorToken}` }]
  ];
}

export function guestInviteButtons(invite) {
  const dict = getDict(invite.locale);
  return [[{ text: dict.bot.openInvite, url: guestWebLink(invite.id) }]];
}

export function askWhoText(locale) {
  return getDict(locale).bot.askWhoText;
}

export function guestInviteText(invite) {
  const dict = getDict(invite.locale);
  return [
    `<b>${dict.bot.guestHello}</b>`,
    invite.senderName ? `${dict.bot.from}: ${invite.senderName}` : "",
    dict.bot.guestTap
  ]
    .filter(Boolean)
    .join("\n");
}

export function deliveryLabel(invite) {
  if (invite.recipientTelegram) return `@${invite.recipientTelegram}`;
  if (invite.recipientName) return invite.recipientName;
  if (invite.recipientTelegramUserId) return `ID ${invite.recipientTelegramUserId}`;
  return "";
}

export function deliverySentText(invite, auto) {
  const dict = getDict(invite.locale);
  const who = deliveryLabel(invite) || "…";
  if (auto) return dict.bot.sentAuto.replace("{user}", who);
  return [
    dict.bot.sentPending.replace("{user}", who),
    guestBotDeepLink(invite.id)
  ].join("\n");
}

export { normalizeLocale };
