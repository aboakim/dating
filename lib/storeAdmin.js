import fs from "fs/promises";
import path from "path";

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

export async function listInvites() {
  const db = await readDb();
  return Object.values(db.invites)
    .map((invite) => ({
      id: invite.id,
      creatorToken: invite.creatorToken,
      recipientName: invite.recipientName,
      senderName: invite.senderName,
      locale: invite.locale,
      telegram: invite.telegram,
      telegramChatId: invite.telegramChatId || null,
      createdAt: invite.createdAt,
      expiresAt: invite.expiresAt,
      answered: Boolean(invite.response?.answer),
      openedCount: invite.response?.openedCount || 0,
      answer: invite.response?.answer || null,
      date: invite.response?.date || invite.when?.date || "",
      time: invite.response?.time || invite.when?.time || "",
      picks: invite.response?.picks || {},
      ref: invite.ref || ""
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteInvite(id) {
  return withLock(async () => {
    const db = await readDb();
    if (!db.invites[id]) return false;
    delete db.invites[id];
    await writeDb(db);
    return true;
  });
}

export async function adminStats() {
  const invites = await listInvites();
  return {
    total: invites.length,
    answered: invites.filter((item) => item.answered).length,
    telegramBound: invites.filter((item) => item.telegramChatId).length,
    opened: invites.filter((item) => item.openedCount > 0).length
  };
}
