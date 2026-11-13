import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { normalizeLocale } from "@/lib/i18n";

const file = path.join(process.cwd(), "data", "invites.json");
let chain = Promise.resolve();

function withLock(task) {
  const run = chain.then(task, task);
  chain = run.then(
    () => {},
    () => {}
  );
  return run;
}

function makeId(size) {
  return crypto.randomBytes(size).toString("base64url").replace(/[^a-zA-Z0-9]/g, "").slice(0, size);
}

async function readDb() {
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.invites !== "object") return { invites: {} };
    return parsed;
  } catch (error) {
    if (error.code === "ENOENT") return { invites: {} };
    throw error;
  }
}

async function writeDb(db) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(db, null, 2), "utf8");
}

export function publicInvite(invite) {
  const answered = Boolean(invite.response?.answer);
  return {
    id: invite.id,
    audience: invite.audience,
    occasion: invite.occasion,
    locale: normalizeLocale(invite.locale),
    recipientName: invite.recipientName,
    senderName: invite.senderName,
    theme: invite.theme,
    open: {
      mode: invite.open.mode,
      openAt: invite.open.openAt,
      scratchColor: invite.open.scratchColor,
      scratchText: invite.open.scratchText,
      envelopeHint: invite.open.envelopeHint,
      pinQuestion: invite.open.pinQuestion,
      beforeText: invite.open.beforeText,
      readyText: invite.open.readyText || "",
      gateEmoji: invite.open.gateEmoji || "",
      pinRequired: invite.open.mode === "pin"
    },
    question: invite.question,
    confirm: invite.confirm || null,
    when: invite.when,
    choices: invite.choices,
    finale: invite.finale,
    media: invite.media,
    expiresAt: invite.expiresAt,
    // Website never exposes answer details — only Telegram does.
    state: { answered, answer: answered ? "yes" : null }
  };
}

export function creatorView(invite) {
  const view = publicInvite(invite);
  return {
    ...view,
    open: { ...view.open, pin: invite.open.pin || "" },
    creatorToken: invite.creatorToken,
    createdAt: invite.createdAt,
    editsLeft: invite.editsLeft,
    telegramChatId: invite.telegramChatId || null,
    telegramBoundAt: invite.telegramBoundAt || null,
    recipientTelegram: invite.recipientTelegram || "",
    recipientTelegramUserId: invite.recipientTelegramUserId || null,
    deliveryStatus: invite.deliveryStatus || "none",
    method: invite.method,
    ref: invite.ref,
    response: {
      openedAt: invite.response?.openedAt || null,
      openedCount: invite.response?.openedCount || 0,
      noAttempts: invite.response?.noAttempts || 0,
      answer: invite.response?.answer || null,
      answeredAt: invite.response?.answeredAt || null
      // date/time/picks hidden on website
    }
  };
}

export async function createInvite(content, extra) {
  return withLock(async () => {
    const db = await readDb();
    const now = Date.now();
    const openAt = content.open.openAt || 0;
    const expiresAt = Math.min(
      Math.max(now + 30 * 86400000, openAt ? openAt + 2 * 86400000 : 0),
      now + 365 * 86400000
    );
    const invite = {
      ...content,
      id: makeId(10),
      creatorToken: makeId(24),
      createdAt: now,
      expiresAt,
      editsLeft: 1,
      price: extra.price,
      method: extra.method || "free",
      ref: extra.ref || "",
      telegramChatId: null,
      telegramBoundAt: null,
      recipientTelegram: "",
      recipientTelegramUserId: null,
      guestTelegramChatId: null,
      deliveryStatus: "none",
      response: {
        openedAt: null,
        openedCount: 0,
        noAttempts: 0,
        answer: null,
        date: null,
        time: null,
        picks: {},
        answeredAt: null
      }
    };
    db.invites[invite.id] = invite;
    await writeDb(db);
    return invite;
  });
}

export async function getById(id) {
  const db = await readDb();
  return db.invites[id] || null;
}

export async function getByToken(token) {
  const db = await readDb();
  return Object.values(db.invites).find((invite) => invite.creatorToken === token) || null;
}

export async function getByCreatorChatId(chatId) {
  const db = await readDb();
  const id = Number(chatId);
  return Object.values(db.invites)
    .filter((invite) => Number(invite.telegramChatId) === id)
    .sort((a, b) => b.createdAt - a.createdAt)[0] || null;
}

export async function getByRecipientUsername(username) {
  const key = String(username || "")
    .trim()
    .replace(/^@/, "")
    .toLowerCase();
  if (!key) return null;
  const db = await readDb();
  return Object.values(db.invites)
    .filter((invite) => String(invite.recipientTelegram || "").toLowerCase() === key && invite.deliveryStatus !== "sent")
    .sort((a, b) => b.createdAt - a.createdAt)[0] || null;
}

export async function getByRecipientUserId(userId) {
  const id = Number(userId);
  if (!id) return null;
  const db = await readDb();
  return Object.values(db.invites)
    .filter(
      (invite) =>
        Number(invite.recipientTelegramUserId) === id && invite.deliveryStatus !== "sent"
    )
    .sort((a, b) => b.createdAt - a.createdAt)[0] || null;
}

export async function updateInvite(id, mutator) {
  return withLock(async () => {
    const db = await readDb();
    const invite = db.invites[id];
    if (!invite) return null;
    const next = await mutator(invite);
    db.invites[id] = next;
    await writeDb(db);
    return db.invites[id];
  });
}

export async function countRef(code) {
  const db = await readDb();
  const invites = Object.values(db.invites).filter((invite) => invite.ref === code);
  return {
    count: invites.length,
    answered: invites.filter((invite) => invite.response?.answer === "yes").length
  };
}
