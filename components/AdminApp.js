"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { amd } from "@/lib/format";
import { EDIT_PRICE, EXTEND_PLANS, PRICE } from "@/lib/catalog";

const PACKS = [
  { id: "food", label: "Ուտելիք" },
  { id: "cinema", label: "Կինո" },
  { id: "activities", label: "Զբաղմունք" },
  { id: "drinks", label: "Խմիչք" },
  { id: "places", label: "Վայրեր" }
];

async function api(url, options) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

export default function AdminApp() {
  const [auth, setAuth] = useState({ checked: false, ok: false, configured: true });
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState("overview");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState(null);
  const [invites, setInvites] = useState([]);
  const [site, setSite] = useState(null);
  const [telegram, setTelegram] = useState(null);
  const [faqText, setFaqText] = useState("");

  async function refreshAuth() {
    const me = await api("/api/admin/me");
    setAuth({ checked: true, ok: me.ok, configured: me.configured });
    return me.ok;
  }

  async function loadAll() {
    const [inviteData, siteData, tgData] = await Promise.all([
      api("/api/admin/invites"),
      api("/api/admin/site"),
      api("/api/admin/telegram").catch((err) => ({ ok: false, error: err.message }))
    ]);
    setStats(inviteData.stats);
    setInvites(inviteData.invites || []);
    setSite(siteData);
    setTelegram(tgData);
    const faq = siteData.landing?.faq;
    setFaqText(
      Array.isArray(faq)
        ? faq.map((row) => `${row[0]} || ${row[1]}`).join("\n")
        : ""
    );
  }

  useEffect(() => {
    refreshAuth()
      .then((ok) => (ok ? loadAll() : null))
      .catch((err) => setError(err.message));
  }, []);

  async function login(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) });
      setPassword("");
      await refreshAuth();
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await api("/api/admin/logout", { method: "POST", body: "{}" });
    setAuth({ checked: true, ok: false, configured: auth.configured });
    setInvites([]);
    setStats(null);
    setSite(null);
  }

  async function saveSite(partial) {
    setBusy(true);
    setError("");
    try {
      const next = await api("/api/admin/site", { method: "PATCH", body: JSON.stringify(partial) });
      setSite(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeInvite(id) {
    if (!window.confirm("Ջնջե՞լ այս հրավերը")) return;
    setBusy(true);
    try {
      await api("/api/admin/invites", { method: "DELETE", body: JSON.stringify({ id }) });
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function setWebhook(action) {
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/telegram", { method: "POST", body: JSON.stringify({ action }) });
      const tgData = await api("/api/admin/telegram");
      setTelegram(tgData);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!auth.checked) return <main className="wrap narrow admin-page">Բեռնում…</main>;

  if (!auth.ok) {
    return (
      <main className="wrap narrow admin-page">
        <h1>Admin</h1>
        {!auth.configured ? (
          <p className="help">`.env`-ում ավելացրու `ADMIN_PASSWORD=...` և վերագործարկիր սերվերը։</p>
        ) : (
          <form className="admin-login" onSubmit={login}>
            <label className="field">
              Գաղտնաբառ
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            <button className="btn btn-solid" type="submit" disabled={busy}>{busy ? "…" : "Մտնել"}</button>
          </form>
        )}
      </main>
    );
  }

  return (
    <main className="wrap admin-page">
      <div className="admin-top">
        <div>
          <p className="eyebrow">DateMe</p>
          <h1>Admin panel</h1>
        </div>
        <div className="share-row">
          <Link className="btn btn-ghost" href="/">Կայք</Link>
          <button className="btn btn-ghost" type="button" onClick={logout}>Դուրս գալ</button>
        </div>
      </div>

      <div className="seg admin-tabs">
        {[
          ["overview", "Ակնարկ"],
          ["invites", "Հրավերներ"],
          ["sections", "Բաժիններ"],
          ["catalog", "Կատալոգ"],
          ["telegram", "Telegram"],
          ["pricing", "Գին"]
        ].map(([id, label]) => (
          <button key={id} type="button" className={tab === id ? "on" : ""} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {tab === "overview" && stats ? (
        <section className="admin-grid">
          <article className="admin-card"><b>{stats.total}</b><span>Հրավեր</span></article>
          <article className="admin-card"><b>{stats.answered}</b><span>Պատասխանած</span></article>
          <article className="admin-card"><b>{stats.opened}</b><span>Բացված</span></article>
          <article className="admin-card"><b>{stats.telegramBound}</b><span>Telegram կապ</span></article>
        </section>
      ) : null}

      {tab === "invites" ? (
        <section className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Անուն</th>
                <th>Կարգավիճակ</th>
                <th>Telegram</th>
                <th>Հղումներ</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => (
                <tr key={invite.id}>
                  <td>
                    <strong>{invite.recipientName}</strong>
                    <div className="help">{invite.senderName || "—"} · {invite.locale}</div>
                  </td>
                  <td>
                    {invite.answered ? "Այո" : "Սպասում"}
                    <div className="help">{invite.date}{invite.time ? ` ${invite.time}` : ""}</div>
                  </td>
                  <td>
                    {invite.telegramChatId ? "Կապված" : "Ոչ"}
                    <div className="help">@{invite.telegram || "—"}</div>
                  </td>
                  <td className="admin-links">
                    <a href={`/i/${invite.id}`} target="_blank" rel="noreferrer">Հյուր</a>
                    <a href={`/c/${invite.creatorToken}`} target="_blank" rel="noreferrer">Ստեղծող</a>
                  </td>
                  <td>
                    <button className="text-btn" type="button" onClick={() => removeInvite(invite.id)}>Ջնջել</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!invites.length ? <p className="help">Դեռ հրավեր չկա։</p> : null}
        </section>
      ) : null}

      {tab === "sections" && site ? (
        <section className="admin-card-stack">
          <p className="help">Միացրու/անջատիր գլխավոր էջի բաժինները։</p>
          {Object.entries(site.sections || {}).map(([key, value]) => (
            <label key={key} className="admin-toggle">
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(event) => saveSite({ sections: { [key]: event.target.checked } })}
              />
              <span>{key}</span>
            </label>
          ))}
          <label className="field">
            FAQ (յուրաքանչյուր տող՝ հարց || պատասխան)
            <textarea
              rows={8}
              value={faqText}
              onChange={(event) => setFaqText(event.target.value)}
              placeholder={"Հարց || Պատասխան"}
            />
          </label>
          <button
            className="btn btn-solid"
            type="button"
            disabled={busy}
            onClick={() => {
              const faq = faqText
                .split("\n")
                .map((line) => line.split("||").map((part) => part.trim()))
                .filter((row) => row[0] && row[1]);
              saveSite({ landing: { faq: faq.length ? faq : null } });
            }}
          >
            Պահել FAQ
          </button>
        </section>
      ) : null}

      {tab === "catalog" && site ? (
        <section className="admin-card-stack">
          <p className="help">Որ կատալոգի փաթեթները լինեն ստեղծման մեջ։</p>
          {PACKS.map((pack) => {
            const enabled = (site.catalog?.enabledPacks || []).includes(pack.id);
            return (
              <label key={pack.id} className="admin-toggle">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(event) => {
                    const current = site.catalog?.enabledPacks || [];
                    const next = event.target.checked
                      ? [...new Set([...current, pack.id])]
                      : current.filter((id) => id !== pack.id);
                    saveSite({ catalog: { enabledPacks: next } });
                  }}
                />
                <span>{pack.label}</span>
              </label>
            );
          })}
        </section>
      ) : null}

      {tab === "telegram" ? (
        <section className="admin-card-stack">
          <p>Bot: <strong>@{telegram?.botUsername || "—"}</strong></p>
          <p className="help">Webhook URL: {telegram?.webhookUrl || `${typeof window !== "undefined" ? window.location.origin : ""}/api/telegram/webhook`}</p>
          {telegram?.error ? <p className="form-error">{telegram.error}</p> : null}
          {telegram?.webhook ? (
            <p className="help">Կարգավիճակ՝ {telegram.webhook.url ? "միացված" : "անջատված"} · pending: {telegram.webhook.pending_update_count ?? 0}</p>
          ) : null}
          <div className="share-row">
            <button className="btn btn-solid" type="button" disabled={busy} onClick={() => setWebhook("setWebhook")}>Միացնել webhook</button>
            <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => setWebhook("deleteWebhook")}>Անջատել</button>
            <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => loadAll()}>Թարմացնել</button>
          </div>
          <p className="help">Ստեղծողը հղումը ստանալուց հետո պետք է բոտում սեղմի Start, որ պատասխանները գան Telegram։</p>
        </section>
      ) : null}

      {tab === "pricing" && site ? (
        <section className="admin-card-stack">
          <div className="pay-card">
            <div className="pay-price">{amd(PRICE)}</div>
            <p>{site.landing?.priceLead || "Մեկ հրավեր, 30 օր"}</p>
            <ul className="pay-list">
              <li>Խմբագրում: {amd(EDIT_PRICE)}</li>
              {EXTEND_PLANS.map((plan) => (
                <li key={plan.days}>Երկարացում {plan.days}: {amd(plan.price)}</li>
              ))}
            </ul>
          </div>
          <label className="field">
            Գնի նկարագրություն
            <textarea
              rows={3}
              value={site.landing?.priceLead || ""}
              onChange={(event) => setSite({ ...site, landing: { ...site.landing, priceLead: event.target.value } })}
            />
          </label>
          <label className="field">
            Վճարման նշում
            <textarea
              rows={3}
              value={site.landing?.priceNote || ""}
              onChange={(event) => setSite({ ...site, landing: { ...site.landing, priceNote: event.target.value } })}
            />
          </label>
          <button className="btn btn-solid" type="button" disabled={busy} onClick={() => saveSite({ landing: site.landing })}>Պահել</button>
        </section>
      ) : null}
    </main>
  );
}
