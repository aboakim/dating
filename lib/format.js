const MONTHS = [
  "հունվարի",
  "փետրվարի",
  "մարտի",
  "ապրիլի",
  "մայիսի",
  "հունիսի",
  "հուլիսի",
  "օգոստոսի",
  "սեպտեմբերի",
  "հոկտեմբերի",
  "նոյեմբերի",
  "դեկտեմբերի"
];

const WEEKDAYS = ["կիր", "երկ", "երք", "չրք", "հնգ", "ուրբ", "շբթ"];

export function amd(n) {
  return `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ֏`;
}

export function isoLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDateISO(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || "";
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1] || ""} ${d}`.trim();
}

export function formatWhen(ts) {
  if (!ts) return "";
  const date = new Date(ts);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function upcomingDays(count = 21) {
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  const days = [];
  for (let i = 0; i < count; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const iso = isoLocal(date);
    days.push({
      iso,
      weekday: WEEKDAYS[date.getDay()],
      num: date.getDate(),
      label: formatDateISO(iso)
    });
  }
  return days;
}

export function fillTemplate(template, { date, time, place, name }) {
  return String(template || "")
    .replaceAll("{date}", date ? formatDateISO(date) : "շուտով")
    .replaceAll("{time}", time || "")
    .replaceAll("{place}", place || "")
    .replaceAll("{name}", name || "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function clip(value, max) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}
