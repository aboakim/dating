import { getDict, normalizeLocale } from "@/lib/i18n";

export function amd(n) {
  return `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ֏`;
}

export function isoLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDateISO(iso, locale = "hy") {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || "";
  const [, m, d] = iso.split("-").map(Number);
  const months = getDict(locale).months;
  const month = months[m - 1] || "";
  if (normalizeLocale(locale) === "en") return `${month} ${d}`;
  if (normalizeLocale(locale) === "ru") return `${d} ${month}`;
  return `${month} ${d}`;
}

export function formatWhen(ts, locale = "hy") {
  if (!ts) return "";
  const date = new Date(ts);
  const months = getDict(locale).months;
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  if (normalizeLocale(locale) === "en") return `${month} ${day}, ${year}, ${time}`;
  if (normalizeLocale(locale) === "ru") return `${day} ${month} ${year}, ${time}`;
  return `${month} ${day} ${year}, ${time}`;
}

export function upcomingDays(count = 21, locale = "hy") {
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  const weekdays = getDict(locale).weekdays;
  const days = [];
  for (let i = 0; i < count; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const iso = isoLocal(date);
    days.push({
      iso,
      weekday: weekdays[date.getDay()],
      num: date.getDate(),
      label: formatDateISO(iso, locale)
    });
  }
  return days;
}

export function fillTemplate(template, { date, time, place, name, locale = "hy" }) {
  return String(template || "")
    .replaceAll("{date}", date ? formatDateISO(date, locale) : "")
    .replaceAll("{time}", time || "")
    .replaceAll("{place}", place || "")
    .replaceAll("{name}", name || "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s([.,!?])/g, "$1")
    .trim();
}

export function clip(value, max) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}
