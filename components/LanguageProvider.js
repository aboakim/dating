"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, getDict, normalizeLocale } from "@/lib/i18n";

const LanguageContext = createContext({
  locale: DEFAULT_LOCALE,
  dict: getDict(DEFAULT_LOCALE),
  setLocale: () => {}
});

export function LanguageProvider({ children, initialLocale }) {
  const [locale, setLocaleState] = useState(() => normalizeLocale(initialLocale || DEFAULT_LOCALE));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("lang");
    const saved = localStorage.getItem("jerm_lang");
    const next = normalizeLocale(fromQuery || saved || initialLocale || DEFAULT_LOCALE);
    setLocaleState(next);
  }, [initialLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem("jerm_lang", locale);
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      dict: getDict(locale),
      setLocale: (next) => setLocaleState(normalizeLocale(next))
    }),
    [locale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
