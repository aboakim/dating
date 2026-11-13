import {
  getByCreatorChatId,
  getById,
  getByRecipientUserId,
  getByRecipientUsername,
  getByToken,
  updateInvite
} from "@/lib/store";
import { getDict } from "@/lib/i18n";
import {
  askWhoText,
  creatorButtons,
  deliverySentText,
  getTelegramChat,
  guestBotDeepLink,
  guestInviteButtons,
  guestInviteText,
  removeReplyKeyboard,
  sendTelegram,
  siteOrigin,
  whoReplyKeyboard
} from "@/lib/telegram";
import { chatIdByUsername, knownChatId, normUser, rememberTelegramUser } from "@/lib/telegramUsers";

export const dynamic = "force-dynamic";

function secretOk(request) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) return true;
  return request.headers.get("x-telegram-bot-api-secret-token") === expected;
}

async function askWho(chatId, locale) {
  await sendTelegram(chatId, askWhoText(locale), [], whoReplyKeyboard(locale));
}

async function deliverToGuest(invite, guestChatId) {
  const dict = getDict(invite.locale);
  await sendTelegram(guestChatId, guestInviteText(invite), guestInviteButtons(invite));
  const updated = await updateInvite(invite.id, async (current) => ({
    ...current,
    guestTelegramChatId: guestChatId,
    deliveryStatus: "sent",
    deliveredAt: Date.now()
  }));
  if (updated?.telegramChatId) {
    const label = updated.recipientTelegram
      ? `@${updated.recipientTelegram}`
      : updated.recipientName || "";
    await sendTelegram(
      updated.telegramChatId,
      dict.bot.guestGotIt.replace("{user}", label),
      [],
      removeReplyKeyboard()
    );
  }
  return updated;
}

async function setRecipientAndSend(invite, { username, userId, firstName }, creatorChatId) {
  const dict = getDict(invite.locale);
  const user = username ? normUser(username) : "";
  if (!userId && (!user || user.length < 4)) {
    await sendTelegram(creatorChatId, dict.bot.badUsername);
    return;
  }

  let resolvedUser = user;
  let resolvedName = firstName || "";
  if (userId && !resolvedUser) {
    const chat = await getTelegramChat(userId);
    if (chat?.username) resolvedUser = normUser(chat.username);
    if (chat?.first_name) resolvedName = chat.first_name;
  }

  const updated = await updateInvite(invite.id, async (current) => ({
    ...current,
    recipientTelegram: resolvedUser || current.recipientTelegram || "",
    recipientTelegramUserId: userId || current.recipientTelegramUserId || null,
    recipientName: current.recipientName || resolvedName || current.recipientName,
    deliveryStatus: "pending"
  }));

  const guestChat =
    (userId ? Number(userId) : null) ||
    (resolvedUser ? await chatIdByUsername(resolvedUser) : null) ||
    (userId ? await knownChatId(userId) : null);

  if (guestChat && Number(guestChat) !== Number(creatorChatId)) {
    const trySend = await sendTelegram(guestChat, guestInviteText(updated), guestInviteButtons(updated));
    if (trySend.ok) {
      const delivered = await updateInvite(updated.id, async (current) => ({
        ...current,
        guestTelegramChatId: guestChat,
        deliveryStatus: "sent",
        deliveredAt: Date.now()
      }));
      await sendTelegram(
        creatorChatId,
        deliverySentText(delivered, true),
        creatorButtons(delivered),
        removeReplyKeyboard()
      );
      return;
    }
  }

  const share = guestBotDeepLink(updated.id);
  await sendTelegram(
    creatorChatId,
    `${deliverySentText(updated, false)}\n\n${dict.bot.orShare}`,
    [
      [{ text: dict.bot.shareInvite, url: share }],
      [{ text: dict.bot.askWho, callback_data: `askwho:${updated.id}` }]
    ],
    removeReplyKeyboard()
  );
}

function sharedUserFromMessage(message) {
  if (message.users_shared?.users?.length) {
    const row = message.users_shared.users[0];
    return {
      userId: Number(row.user_id || row.id),
      username: row.username || "",
      firstName: row.first_name || ""
    };
  }
  if (message.users_shared?.user_ids?.length) {
    return { userId: Number(message.users_shared.user_ids[0]), username: "", firstName: "" };
  }
  if (message.user_shared?.user_id) {
    return {
      userId: Number(message.user_shared.user_id),
      username: message.user_shared.username || "",
      firstName: ""
    };
  }
  return null;
}

export async function POST(request) {
  if (!secretOk(request)) return Response.json({ ok: false }, { status: 401 });
  const update = await request.json().catch(() => ({}));

  if (update.callback_query?.id) {
    const cb = update.callback_query;
    const chatId = cb.message?.chat?.id;
    const data = String(cb.data || "");
    await rememberTelegramUser(cb.from, chatId);
    if (data.startsWith("askwho:") && chatId) {
      const inviteId = data.slice(7);
      const invite = await getById(inviteId);
      if (invite && Number(invite.telegramChatId) === Number(chatId)) {
        await askWho(chatId, invite.locale);
      }
    }
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token) {
      await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: cb.id })
      }).catch(() => {});
    }
    return Response.json({ ok: true });
  }

  const message = update.message;
  if (!message?.chat?.id) return Response.json({ ok: true });

  const text = String(message.text || "");
  const chatId = message.chat.id;
  await rememberTelegramUser(message.from, chatId);

  const shared = sharedUserFromMessage(message);
  if (shared?.userId) {
    const invite = await getByCreatorChatId(chatId);
    if (invite) {
      await setRecipientAndSend(invite, shared, chatId);
      return Response.json({ ok: true });
    }
  }

  const startMatch = text.match(/^\/start(?:\s+(.+))?$/i);

  async function bindCreator(token) {
    const invite = await getByToken(token);
    if (!invite) {
      await sendTelegram(chatId, getDict("hy").bot.badToken);
      return true;
    }
    const dict = getDict(invite.locale);
    if (invite.telegramChatId && invite.telegramChatId !== chatId) {
      await sendTelegram(chatId, dict.bot.already);
      return true;
    }
    const fresh = await updateInvite(invite.id, async (current) => ({
      ...current,
      telegramChatId: chatId,
      telegramBoundAt: Date.now(),
      telegram: message.from?.username || current.telegram
    }));
    await sendTelegram(chatId, dict.bot.welcome, creatorButtons(fresh), removeReplyKeyboard());
    await askWho(chatId, fresh.locale);
    return true;
  }

  if (startMatch?.[1]?.startsWith("g_")) {
    const inviteId = startMatch[1].slice(2);
    const invite = await getById(inviteId);
    if (!invite) {
      await sendTelegram(chatId, getDict("hy").bot.badToken);
      return Response.json({ ok: true });
    }
    await deliverToGuest(invite, chatId);
    return Response.json({ ok: true });
  }

  if (startMatch) {
    const token = (startMatch[1] || "").trim();
    if (!token) {
      const pendingByUser = message.from?.username
        ? await getByRecipientUsername(message.from.username)
        : null;
      const pendingById = pendingByUser || (await getByRecipientUserId(chatId));
      if (pendingById) {
        await deliverToGuest(pendingById, chatId);
        return Response.json({ ok: true });
      }
      await sendTelegram(chatId, getDict("hy").bot.help);
      return Response.json({ ok: true });
    }
    await bindCreator(token);
    return Response.json({ ok: true });
  }

  if (message.from?.username) {
    const pending = await getByRecipientUsername(message.from.username);
    if (pending && Number(pending.telegramChatId) !== Number(chatId)) {
      await deliverToGuest(pending, chatId);
      return Response.json({ ok: true });
    }
  }
  {
    const pendingId = await getByRecipientUserId(chatId);
    if (pendingId && Number(pendingId.telegramChatId) !== Number(chatId)) {
      await deliverToGuest(pendingId, chatId);
      return Response.json({ ok: true });
    }
  }

  const maybeToken = text.trim();
  if (/^[a-zA-Z0-9_-]{16,40}$/.test(maybeToken) && !maybeToken.startsWith("g_")) {
    await bindCreator(maybeToken);
    return Response.json({ ok: true });
  }

  const userMatch = text.trim().match(/^@?([a-zA-Z0-9_]{4,32})$/);
  if (userMatch) {
    const invite = await getByCreatorChatId(chatId);
    if (invite) {
      await setRecipientAndSend(invite, { username: userMatch[1] }, chatId);
      return Response.json({ ok: true });
    }
  }

  if (/^\/send/i.test(text)) {
    const invite = await getByCreatorChatId(chatId);
    if (!invite) {
      await sendTelegram(chatId, getDict("hy").bot.needCreate);
      return Response.json({ ok: true });
    }
    const who = text.replace(/^\/send\s*/i, "").trim();
    if (who) await setRecipientAndSend(invite, { username: who }, chatId);
    else await askWho(chatId, invite.locale);
    return Response.json({ ok: true });
  }

  if (/^\/who/i.test(text)) {
    const invite = await getByCreatorChatId(chatId);
    if (invite) await askWho(chatId, invite.locale);
    else await sendTelegram(chatId, getDict("hy").bot.needCreate);
    return Response.json({ ok: true });
  }

  if (/^\/page/i.test(text)) {
    await sendTelegram(chatId, `${siteOrigin()}`);
  } else if (/^\/help/i.test(text)) {
    await sendTelegram(chatId, getDict("hy").bot.help);
  }

  return Response.json({ ok: true });
}

export async function GET() {
  return Response.json({
    ok: true,
    site: siteOrigin()
  });
}
