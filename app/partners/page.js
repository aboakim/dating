"use client";

import { useEffect, useState } from "react";

export default function PartnersPage() {
  const [code, setCode] = useState("");
  const [stats, setStats] = useState(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    let current = localStorage.getItem("jerm_partner");
    if (!current) {
      current = `jerm-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem("jerm_partner", current);
    }
    setCode(current);
    setOrigin(window.location.origin);
    fetch(`/api/partners/${current}`).then((response) => response.json()).then(setStats).catch(() => {});
  }, []);

  const link = code && origin ? `${origin}/create?ref=${code}` : "";

  return (
    <main className="wrap prose">
      <h1>Գործընկերային ծրագիր</h1>
      <p>Կիսվիր քո հղումով։ Երբ այդ հղումով հրավեր ստեղծեն, այն կհաշվի այս էջում։ Սա տեղական հաշվարկ է, առանց վճարի։</p>
      {link ? (
        <>
          <label className="field">Քո հղումը<input readOnly value={link} /></label>
          <button className="btn btn-solid" type="button" onClick={() => navigator.clipboard.writeText(link)}>Պատճենել</button>
          <p className="help">Ստեղծված հրավերներ՝ {stats?.count ?? "…"}։ Այո ասածները՝ {stats?.answered ?? "…"}։</p>
        </>
      ) : <p>Բեռնում…</p>}
    </main>
  );
}
