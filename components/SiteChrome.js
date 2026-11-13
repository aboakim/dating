"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import { LOCALES } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

function quiet(path) {
  return path === "/preview" || path.startsWith("/i/");
}

export function RefCapture() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref && /^[a-z0-9-]{4,24}$/i.test(ref)) localStorage.setItem("jerm_ref", ref.toLowerCase());
  }, []);
  return null;
}

export function SiteHeader() {
  const path = usePathname();
  const { dict, locale, setLocale } = useLanguage();
  if (quiet(path)) return null;
  return (
    <header className="nav">
      <BrandLogo href="/" size="nav" />
      <nav>
        <div className="lang-switch" role="group" aria-label="Language">
          {LOCALES.map((code) => (
            <button key={code} type="button" className={locale === code ? "on" : ""} onClick={() => setLocale(code)}>
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  const path = usePathname();
  const { dict } = useLanguage();
  if (quiet(path)) return null;
  return (
    <footer className="footer">
      <div>
        <BrandLogo href="/" size="footer" />
        <p>{dict.footer.tagline}</p>
      </div>
      <div className="footer-links">
        <Link href="/privacy">{dict.footer.privacy}</Link>
        <Link href="/offer">{dict.footer.offer}</Link>
      </div>
    </footer>
  );
}
