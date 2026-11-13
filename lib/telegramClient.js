export function botUsername() {
  return String(process.env.NEXT_PUBLIC_BOT_USERNAME || "").replace(/^@/, "");
}

export function botDeepLink(token) {
  const user = botUsername();
  if (!user || !token) return "";
  return `https://t.me/${user}?start=${encodeURIComponent(token)}`;
}
