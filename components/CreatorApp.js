"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import FallingHearts from "@/components/FallingHearts";
import { EDIT_PRICE, EXTEND_PLANS } from "@/lib/catalog";
import { amd, formatWhen } from "@/lib/format";
import { botDeepLink } from "@/lib/telegramClient";

export default function CreatorApp({ token }) {
  const { dict, locale } = useLanguage();
  const T = dict.creator;
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [qr, setQr] = useState("");
  const [note, setNote] = useState("");
  const [origin, setOrigin] = useState("");

  async function load() {
    const response = await fetch(`/api/creator/${token}`, { cache: "no-store" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Failed");
    setData(body);
  }

  useEffect(() => {
    setOrigin(window.location.origin);
    load().catch((err) => setError(err.message));
    const timer = setInterval(() => load().catch(() => {}), 4000);
    return () => clearInterval(timer);
  }, [token]);

  useEffect(() => {
    if (!data || !origin) return;
    const url = `${origin}/i/${data.id}`;
    import("qrcode").then((QR) => QR.toDataURL(url, { margin: 1, width: 280 }).then(setQr));
  }, [data, origin]);

  async function act(body) {
    setNote("");
    const response = await fetch(`/api/creator/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const payload = await response.json();
    if (!response.ok) {
      setNote(payload.error || "Failed");
      return;
    }
    setData(payload);
    setNote(T.paymentSoon);
  }

  if (error) {
    return (
      <main className="center-page">
        <FallingHearts />
        <h1>{error}</h1>
      </main>
    );
  }
  if (!data) return <main className="center-page">{dict.common.loading}</main>;

  const guest = `${origin}/i/${data.id}`;
  const shareText = `${data.recipientName}, ${T.shareText}`;
  const botUrl = botDeepLink(data.creatorToken);

  return (
    <main className="wrap dash">
      <FallingHearts compact />
      <p className="eyebrow">{T.eyebrow}</p>
      <h1>{data.recipientName}{T.title}</h1>
      <p className="lead">{T.lead}</p>
      <div className="stats">
        <article><b>{data.response.openedCount}</b><span>{T.opens}</span></article>
        <article><b>{data.response.noAttempts}</b><span>{T.noTries}</span></article>
        <article><b>{data.response.answer === "yes" ? T.yes : T.notYet}</b><span>{T.answer}</span></article>
      </div>
      {data.response.answer === "yes" ? (
        <section className="panel enter-up">
          <h2>{T.picked}</h2>
          <p className="help">{T.privateNote}</p>
          {data.response.answeredAt ? <p className="help">{T.answeredAt} {formatWhen(data.response.answeredAt, data.locale || locale)}</p> : null}
        </section>
      ) : null}
      <section className="panel">
        <h2>{T.sendViaBot}</h2>
        <div className="share-row">
          {botUrl ? <a className="btn btn-solid" href={botUrl} target="_blank" rel="noreferrer">{T.bindBot}</a> : null}
        </div>
        <div className={`tg-bind ${data.telegramChatId ? "on" : ""}`}>
          {data.telegramChatId ? (
            <p>✓ Բոտը կապված է։ Գրիր ստացողի @username-ը բոտում — կուղարկի ինքը։</p>
          ) : (
            <p>⚠ Նախ սեղմիր բոտը և Start, հետո բոտում գրիր @username</p>
          )}
        </div>
        {data.deliveryStatus === "sent" ? <p className="help">{T.deliverySent}</p> : null}
        {data.deliveryStatus === "pending" ? <p className="help">{T.deliveryPending}</p> : null}
        <p className="help">{T.worksUntil} {formatWhen(data.expiresAt, data.locale || locale)}. {T.editsLeft} {data.editsLeft}.</p>
        <details className="help">
          <summary>{T.guestLink}</summary>
          <div className="copy-row" style={{ marginTop: 8 }}>
            <input readOnly value={guest} />
            <button className="btn btn-ghost" type="button" onClick={() => navigator.clipboard.writeText(guest)}>{dict.common.copy}</button>
          </div>
        </details>
        {qr ? <img className="qr" src={qr} alt="QR" /> : null}
      </section>
      <section className="panel">
        <h2>{T.editExtend}</h2>
        <p className="help">{T.paymentSoon}</p>
        <div className="share-row">
          <Link className="btn btn-solid" href={`/create?edit=${token}`}>{T.edit}</Link>
          <button className="btn btn-ghost" type="button" onClick={() => act({ action: "edit" })}>{T.addEdit} · {amd(EDIT_PRICE)} <small className="soon-tag">{dict.common.comingSoon}</small></button>
        </div>
        <div className="plan-grid">
          {EXTEND_PLANS.map((plan) => (
            <button key={plan.days} className="plan" type="button" onClick={() => act({ action: "extend", days: plan.days })}>
              <strong>{plan.days}d</strong>
              <span>{amd(plan.price)}</span>
              <small>+{plan.edits} · {dict.common.comingSoon}</small>
            </button>
          ))}
        </div>
        {note ? <p className="help">{note}</p> : null}
      </section>
    </main>
  );
}
