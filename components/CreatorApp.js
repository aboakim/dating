"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EDIT_PRICE, EXTEND_PLANS } from "@/lib/catalog";
import { amd, formatDateISO, formatWhen } from "@/lib/format";

export default function CreatorApp({ token }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [qr, setQr] = useState("");
  const [note, setNote] = useState("");
  const [origin, setOrigin] = useState("");

  async function load() {
    const response = await fetch(`/api/creator/${token}`, { cache: "no-store" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Չհաջողվեց բացել");
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
      setNote(payload.error || "Չհաջողվեց");
      return;
    }
    setData(payload);
    setNote("Պահվեց։ Գանձում չի եղել. վճարումը այս տարբերակում ցուցադրական է։");
  }

  if (error) return <main className="center-page"><h1>{error}</h1></main>;
  if (!data) return <main className="center-page">Բեռնում…</main>;

  const guest = `${origin}/i/${data.id}`;
  const shareText = `${data.recipientName}, քեզ համար մի հրավեր ունեմ`;
  const picks = Object.values(data.response?.picks || {});

  return (
    <main className="wrap dash">
      <p className="eyebrow">Քո էջը</p>
      <h1>{data.recipientName}ի հրավերը</h1>
      <p className="lead">Այս հղումը միայն քոնն է։ Այստեղ երևում է՝ բացե՞լ են, քանի անգամ են փորձել «ոչ»-ը, և ինչ են ընտրել։</p>
      <div className="stats">
        <article><b>{data.response.openedCount}</b><span>բացում</span></article>
        <article><b>{data.response.noAttempts}</b><span>«ոչ»-ի փորձ</span></article>
        <article><b>{data.response.answer === "yes" ? "Այո" : "Դեռ ոչ"}</b><span>պատասխան</span></article>
      </div>
      {data.response.answer === "yes" ? (
        <section className="panel">
          <h2>Ընտրել են</h2>
          <p>{data.response.date ? `${formatDateISO(data.response.date)}, ${data.response.time}` : "Օրը դու ես նշել"}</p>
          {picks.length ? <p>{picks.join(" · ")}</p> : null}
          <p className="help">Պատասխանել են {formatWhen(data.response.answeredAt)}</p>
        </section>
      ) : null}
      <section className="panel">
        <h2>Հղում հյուրի համար</h2>
        <div className="copy-row">
          <input readOnly value={guest} />
          <button className="btn btn-solid" type="button" onClick={() => navigator.clipboard.writeText(guest)}>Պատճենել</button>
        </div>
        <div className="share-row">
          <a className="btn btn-ghost" href={`https://t.me/share/url?url=${encodeURIComponent(guest)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer">Telegram</a>
          <a className="btn btn-ghost" href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${guest}`)}`} target="_blank" rel="noreferrer">WhatsApp</a>
          <a className="btn btn-ghost" href={`viber://forward?text=${encodeURIComponent(`${shareText} ${guest}`)}`}>Viber</a>
        </div>
        {qr ? <img className="qr" src={qr} alt="QR կոդ հրավերի համար" /> : null}
        <p className="help">Գործում է մինչև {formatWhen(data.expiresAt)}։ Խմբագրում է մնացել՝ {data.editsLeft}։</p>
      </section>
      <section className="panel">
        <h2>Խմբագրել և երկարացնել</h2>
        <div className="share-row">
          <Link className="btn btn-solid" href={`/create?edit=${token}`}>Խմբագրել</Link>
          <button className="btn btn-ghost" type="button" onClick={() => act({ action: "edit" })}>+1 խմբագրում · {amd(EDIT_PRICE)}</button>
        </div>
        <div className="plan-grid">
          {EXTEND_PLANS.map((plan) => (
            <button key={plan.days} className="plan" type="button" onClick={() => act({ action: "extend", days: plan.days })}>
              <strong>{plan.label}</strong>
              <span>{amd(plan.price)}</span>
              <small>+{plan.edits} խմբագրում</small>
            </button>
          ))}
        </div>
        {note ? <p className="help">{note}</p> : null}
      </section>
    </main>
  );
}
