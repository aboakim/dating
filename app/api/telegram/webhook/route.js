import { getByToken, updateInvite } from "@/lib/store";
import { getDict } from "@/lib/i18n";
import { botDeepLink, creatorButtons, sendTelegram, siteOrigin } from "@/lib/telegram";

export const dynamic = "force-dynamic";

function secretOk(request) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) return true;
  return request.headers.get("x-telegram-bot-api-secret-token") === expected;
}

export async function POST(request) {
  if (!secretOk(request)) return Response.json({ ok: false }, { status: 401 });
  const update = await request.json().catch(() => ({}));
  const message = update.message;
  if (!message?.chat?.id) return Response.json({ ok: true });

  const text = String(message.text || "");
  const chatId = message.chat.id;
  const startMatch = text.match(/^\/start(?:\s+(.+))?$/i);

  if (startMatch) {
    const token = (startMatch[1] || "").trim();
    if (!token) {
      await sendTelegram(chatId, getDict("hy").bot.help);
      return Response.json({ ok: true });
    }
    const invite = await getByToken(token);
    if (!invite) {
      await sendTelegram(chatId, getDict("hy").bot.badToken);
      return Response.json({ ok: true });
    }
    const dict = getDict(invite.locale);
    if (invite.telegramChatId && invite.telegramChatId !== chatId) {
      await sendTelegram(chatId, dict.bot.already);
      return Response.json({ ok: true });
    }
    await updateInvite(invite.id, async (current) => ({
      ...current,
      telegramChatId: chatId,
      telegramBoundAt: Date.now(),
      telegram: message.from?.username || current.telegram
    }));
    const fresh = { ...invite, telegramChatId: chatId, creatorToken: invite.creatorToken };
    await sendTelegram(chatId, dict.bot.welcome, creatorButtons(fresh));
    return Response.json({ ok: true });
  }

  if (/^\/page/i.test(text)) {
    await sendTelegram(chatId, `${siteOrigin()}`);
  }

  return Response.json({ ok: true });
}

export async function GET() {
  return Response.json({
    ok: true,
    bot: botDeepLink("TOKEN_PLACEHOLDER").replace("TOKEN_PLACEHOLDER", ""),
    site: siteOrigin()
  });
}
