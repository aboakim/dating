"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

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
  if (quiet(path)) return null;
  return (
    <header className="nav">
      <Link href="/" className="logo" aria-label="Ջերմ, գլխավոր էջ">
        <span className="logo-heart" aria-hidden="true">♥</span>
        Ջերմ
      </Link>
      <nav>
        <Link href="/ideas">Գաղափարներ</Link>
        <Link href="/partners">Գործընկերներ</Link>
        <Link href="/create" className="nav-cta">Ստեղծել</Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  const path = usePathname();
  if (quiet(path)) return null;
  return (
    <footer className="footer">
      <div>
        <strong>Ջերմ</strong>
        <p>Առցանց հրավեր հանդիպման՝ Հայաստանի համար։</p>
      </div>
      <div className="footer-links">
        <Link href="/privacy">Գաղտնիություն</Link>
        <Link href="/offer">Օֆերտա</Link>
        <Link href="/ideas">Գաղափարներ</Link>
        <Link href="/partners">Գործընկերային ծրագիր</Link>
      </div>
    </footer>
  );
}
