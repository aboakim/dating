import hy from "./hy";
import ru from "./ru";
import en from "./en";

export const LOCALES = ["hy", "ru", "en"];
export const DEFAULT_LOCALE = "hy";
export const dictionaries = { hy, ru, en };

export function normalizeLocale(value) {
  const raw = String(value || "").toLowerCase().slice(0, 2);
  return LOCALES.includes(raw) ? raw : DEFAULT_LOCALE;
}

export function getDict(locale) {
  return dictionaries[normalizeLocale(locale)] || hy;
}

export function t(dict, path) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] != null ? acc[key] : null), dict) ?? path;
}
