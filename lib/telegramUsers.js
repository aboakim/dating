import fs from "fs/promises";
import path from "path";

const file = path.join(process.cwd(), "data", "telegram-users.json");
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
    if (!parsed || typeof parsed.byUsername !== "object") return { byUsername: {}, byChatId: {} };
    return parsed;
  } catch (error) {
    if (error.code === "ENOENT") return { byUsername: {}, byChatId: {} };
    throw error;
  }
}

async function writeDb(db) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(db, null, 2), "utf8");
}

export function normUser(username) {
  return String(username || "")
    .trim()
    .replace(/^@/, "")
    .toLowerCase();
}

export async function rememberTelegramUser(from, chatId) {
  const username = normUser(from?.username);
  if (!chatId) return;
  return withLock(async () => {
    const db = await readDb();
    db.byChatId[String(chatId)] = {
      chatId: Number(chatId),
      username: username || null,
      firstName: from?.first_name || "",
      updatedAt: Date.now()
    };
    if (username) {
      db.byUsername[username] = {
        chatId: Number(chatId),
        username,
        firstName: from?.first_name || "",
        updatedAt: Date.now()
      };
    }
    await writeDb(db);
  });
}

export async function chatIdByUsername(username) {
  const key = normUser(username);
  if (!key) return null;
  const db = await readDb();
  return db.byUsername[key]?.chatId || null;
}

export async function knownChatId(userId) {
  const id = Number(userId);
  if (!id) return null;
  const db = await readDb();
  return db.byChatId[String(id)]?.chatId || null;
}
