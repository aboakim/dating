import crypto from "crypto";

const COOKIE = "dateme_admin";

function secret() {
  return process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET || "";
}

function tokenFor(password) {
  return crypto.createHmac("sha256", "dateme-admin").update(password).digest("hex");
}

export function adminConfigured() {
  return Boolean(secret());
}

export function makeAdminCookie(password = secret()) {
  if (!password) return "";
  return `${COOKIE}=${tokenFor(password)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
}

export function clearAdminCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function isAdminRequest(request) {
  const expected = secret();
  if (!expected) return false;
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(new RegExp(`${COOKIE}=([^;]+)`));
  if (!match) return false;
  const got = match[1];
  const want = tokenFor(expected);
  try {
    return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(want));
  } catch {
    return false;
  }
}

export function checkPassword(password) {
  const expected = secret();
  if (!expected || !password) return false;
  const a = Buffer.from(String(password));
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
