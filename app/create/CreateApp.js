"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import InviteExperience from "@/components/InviteExperience";
import {
  DELAYS,
  EDIT_PRICE,
  NO_MODES,
  OCCASIONS,
  OPEN_MODES,
  PAY_METHODS,
  PRICE,
  THEMES,
  applyOccasion,
  blankDraft
} from "@/lib/catalog";
import { amd } from "@/lib/format";
import { validateStep } from "@/lib/validate";

const STEPS = ["Առիթ", "Բացում", "Հարց", "Երբ", "Ընտրություն", "Եզրափակ", "Հղում"];

function previewInvite(draft) {
  const open = { ...draft.open };
  if (open.mode === "timer") {
    open.openAt = open.schedule === "in"
      ? Date.now() + (Number(open.delayMinutes) || 1) * 60000
      : (open.openAt ? new Date(open.openAt).getTime() : Date.now() + 60000);
  }
  return {
    id: "preview",
    audience: draft.audience,
    recipientName: draft.recipientName || "սիրելիս",
    senderName: draft.senderName,
    theme: draft.theme,
    open,
    question: draft.question,
    when: draft.when,
    choices: (draft.choices || [])
      .filter((choice) => choice.enabled)
      .map((choice) => ({ ...choice, items: choice.items.filter((item) => item.label.trim()) }))
      .filter((choice) => choice.items.length > 0),
    finale: draft.finale,
    media: draft.media,
    state: { answered: false }
  };
}

function toDatetimeLocal(ts) {
  const date = new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function inviteToDraft(invite) {
  const draft = blankDraft(invite.audience, invite.occasion);
  return {
    ...draft,
    recipientName: invite.recipientName,
    senderName: invite.senderName || "",
    theme: invite.theme,
    open: {
      ...draft.open,
      ...invite.open,
      schedule: "at",
      openAt: invite.open.openAt ? toDatetimeLocal(invite.open.openAt) : "",
      pin: invite.open.pin || draft.open.pin
    },
    question: invite.question,
    when: invite.when,
    choices: invite.choices.map((choice) => ({ ...choice, enabled: true })),
    finale: invite.finale,
    media: invite.media,
    telegram: invite.telegram || "",
    email: invite.email || "",
    method: invite.method || "idram"
  };
}

async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch("/api/upload", { method: "POST", body: form });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Չհաջողվեց վերբեռնել");
  return data.url;
}

export default function CreateApp() {
  const [draft, setDraft] = useState(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [editToken, setEditToken] = useState("");
  const [recordNote, setRecordNote] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const edit = params.get("edit");
    if (edit) {
      setEditToken(edit);
      fetch(`/api/creator/${edit}`)
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Չհաջողվեց բացել");
          if (!data.open?.pin && data.open?.pinRequired) data.open.pin = "";
          setDraft(inviteToDraft(data));
        })
        .catch((err) => setError(err.message));
      return;
    }
    const saved = localStorage.getItem("jerm_draft_v1");
    const audience = params.get("audience") === "him" ? "him" : "her";
    const occasion = params.get("occasion") || "date";
    if (saved) {
      try {
        setDraft(JSON.parse(saved));
        return;
      } catch {
        localStorage.removeItem("jerm_draft_v1");
      }
    }
    setDraft(blankDraft(audience, occasion));
  }, []);

  useEffect(() => {
    if (!draft || editToken) return;
    localStorage.setItem("jerm_draft_v1", JSON.stringify(draft));
  }, [draft, editToken]);

  const preview = useMemo(() => (draft ? previewInvite(draft) : null), [draft]);

  function patch(partial) {
    setDraft((current) => ({ ...current, ...partial }));
  }

  function next() {
    const message = validateStep(draft, step);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setStep((value) => Math.min(value + 1, STEPS.length - 1));
    setPreviewKey((value) => value + 1);
  }

  async function record(kind) {
    setRecordNote("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia(kind === "video" ? { video: true, audio: true } : { audio: true });
      const mime = kind === "video" ? "video/webm" : "audio/webm";
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      const blob = await new Promise((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: mime }));
        recorder.start();
        setTimeout(() => recorder.stop(), kind === "video" ? 8000 : 20000);
      });
      stream.getTracks().forEach((track) => track.stop());
      const url = await uploadFile(new File([blob], kind === "video" ? "circle.webm" : "voice.webm", { type: mime }));
      setDraft((current) => ({ ...current, media: { ...current.media, [kind === "video" ? "video" : "voice"]: url } }));
      setRecordNote(kind === "video" ? "Տեսաշրջանը պահվեց" : "Ձայնը պահվեց");
    } catch (err) {
      const inApp = /Instagram|FBAN|FBAV|Telegram/i.test(navigator.userAgent || "");
      setRecordNote(err.message || (inApp ? "Բացիր կայքը Safari-ում կամ Chrome-ում և փորձիր էլի" : "Չհաջողվեց գրառել"));
    }
  }

  async function publish() {
    const message = validateStep(draft, 6);
    if (message) {
      setError(message);
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (editToken) {
        const response = await fetch(`/api/creator/${editToken}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draft })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Չհաջողվեց պահել");
        setResult({ id: data.id, creatorToken: data.creatorToken, expiresAt: data.expiresAt, edited: true });
      } else {
        const ref = localStorage.getItem("jerm_ref") || "";
        const response = await fetch("/api/invites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draft, method: draft.method, ref })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Չհաջողվեց ստեղծել");
        localStorage.removeItem("jerm_draft_v1");
        localStorage.setItem("jerm_last", JSON.stringify(data));
        setResult(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!draft) {
    return <main className="center-page">{error || "Բեռնում…"}</main>;
  }

  if (result) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const guest = `${origin}/i/${result.id}`;
    const mine = `${origin}/c/${result.creatorToken}`;
    return (
      <main className="wrap narrow">
        <p className="eyebrow">{result.edited ? "Պահվեց" : "Հրավերը պատրաստ է"}</p>
        <h1>{result.edited ? "Փոփոխությունները պահվեցին" : "Հղումը քոնն է"}</h1>
        <p className="lead">Ուղարկիր հյուրի հղումը։ Պատասխանը կերևա միայն քո էջում։</p>
        <label className="field">Հյուրի հղում<input readOnly value={guest} /></label>
        <label className="field">Քո էջը<input readOnly value={mine} /></label>
        <div className="share-row">
          <button className="btn btn-solid" type="button" onClick={() => navigator.clipboard.writeText(guest)}>Պատճենել հղումը</button>
          <Link className="btn btn-ghost" href={`/c/${result.creatorToken}`}>Բացել իմ էջը</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="builder">
      <div className="wrap builder-grid">
        <section className="builder-main">
          <ol className="progress">
            {STEPS.map((label, index) => (
              <li key={label} className={index === step ? "on" : index < step ? "done" : ""}>
                <button type="button" onClick={() => index < step && setStep(index)}>{index + 1}. {label}</button>
              </li>
            ))}
          </ol>
          <div className="panel">
            {step === 0 ? (
              <>
                <h1>Ո՞ւմ համար է</h1>
                <div className="seg">
                  <button type="button" className={draft.audience === "her" ? "on her" : ""} onClick={() => patch({ audience: "her", theme: draft.theme === "sevan" ? "rose" : draft.theme })}>Աղջկա համար</button>
                  <button type="button" className={draft.audience === "him" ? "on him" : ""} onClick={() => patch({ audience: "him", theme: "sevan" })}>Տղայի համար</button>
                </div>
                <p className="label">Առիթ</p>
                <div className="chips">
                  {OCCASIONS.map((item) => (
                    <button key={item.id} type="button" className={draft.occasion === item.id ? "chip on" : "chip"} onClick={() => setDraft((current) => applyOccasion(current, item.id))}>{item.label}</button>
                  ))}
                </div>
                <label className="field">Նրա անունը<input value={draft.recipientName} onChange={(event) => patch({ recipientName: event.target.value })} placeholder="Անի" /></label>
                <label className="field">Քո անունը, եթե ուզում ես<input value={draft.senderName} onChange={(event) => patch({ senderName: event.target.value })} placeholder="Նարեկ" /></label>
                <p className="label">Գույներ</p>
                <div className="chips">
                  {THEMES.map((item) => (
                    <button key={item.id} type="button" className={draft.theme === item.id ? "chip on" : "chip"} onClick={() => patch({ theme: item.id })}>
                      <i style={{ background: item.accent }} /> {item.name}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <h1>Ինչպես բացվի</h1>
                <div className="choice-list">
                  {OPEN_MODES.map((item) => (
                    <button key={item.id} type="button" className={draft.open.mode === item.id ? "choice on" : "choice"} onClick={() => patch({ open: { ...draft.open, mode: item.id } })}>
                      <strong>{item.title}</strong>
                      <span>{item.text}</span>
                    </button>
                  ))}
                </div>
                <label className="field">Տեքստը մինչև բացելը<textarea value={draft.open.beforeText} onChange={(event) => patch({ open: { ...draft.open, beforeText: event.target.value } })} /></label>
                {draft.open.mode === "timer" ? (
                  <>
                    <div className="seg">
                      <button type="button" className={draft.open.schedule !== "in" ? "on" : ""} onClick={() => patch({ open: { ...draft.open, schedule: "at" } })}>Որոշակի ժամ</button>
                      <button type="button" className={draft.open.schedule === "in" ? "on" : ""} onClick={() => patch({ open: { ...draft.open, schedule: "in" } })}>Այսքան ժամանակից</button>
                    </div>
                    {draft.open.schedule === "in" ? (
                      <div className="chips">
                        {DELAYS.map((item) => (
                          <button key={item.minutes} type="button" className={Number(draft.open.delayMinutes) === item.minutes ? "chip on" : "chip"} onClick={() => patch({ open: { ...draft.open, delayMinutes: item.minutes } })}>{item.label}</button>
                        ))}
                      </div>
                    ) : (
                      <label className="field">Բացման օրն ու ժամը<input type="datetime-local" value={draft.open.openAt} onChange={(event) => patch({ open: { ...draft.open, openAt: event.target.value } })} /></label>
                    )}
                    <p className="help">Ժամը վերցվում է այս սարքից։ Հայաստանում դա UTC+4 է։</p>
                  </>
                ) : null}
                {draft.open.mode === "scratch" ? (
                  <>
                    <label className="field">Գրությունը շերտի վրա<input value={draft.open.scratchText} onChange={(event) => patch({ open: { ...draft.open, scratchText: event.target.value } })} /></label>
                    <label className="field">Շերտի գույնը<input type="color" value={draft.open.scratchColor} onChange={(event) => patch({ open: { ...draft.open, scratchColor: event.target.value } })} /></label>
                  </>
                ) : null}
                {draft.open.mode === "envelope" ? (
                  <label className="field">Գրությունը ծրարի վրա<input value={draft.open.envelopeHint} onChange={(event) => patch({ open: { ...draft.open, envelopeHint: event.target.value } })} /></label>
                ) : null}
                {draft.open.mode === "pin" ? (
                  <>
                    <label className="field">Հարցը<input value={draft.open.pinQuestion} onChange={(event) => patch({ open: { ...draft.open, pinQuestion: event.target.value } })} /></label>
                    <label className="field">4 թիվ<input inputMode="numeric" maxLength={4} value={draft.open.pin} onChange={(event) => patch({ open: { ...draft.open, pin: event.target.value.replace(/\D/g, "").slice(0, 4) } })} /></label>
                  </>
                ) : null}
              </>
            ) : null}

            {step === 2 ? (
              <>
                <h1>Հարցը</h1>
                <label className="field">Վերնագիր<input value={draft.question.title} onChange={(event) => patch({ question: { ...draft.question, title: event.target.value } })} /></label>
                <label className="field">Ենթավերնագիր<textarea value={draft.question.subtitle} onChange={(event) => patch({ question: { ...draft.question, subtitle: event.target.value } })} /></label>
                <div className="split">
                  <label className="field">Այո<input value={draft.question.yes} onChange={(event) => patch({ question: { ...draft.question, yes: event.target.value } })} /></label>
                  <label className="field">Ոչ<input value={draft.question.no} onChange={(event) => patch({ question: { ...draft.question, no: event.target.value } })} /></label>
                </div>
                <div className="choice-list">
                  {NO_MODES.map((item) => (
                    <button key={item.id} type="button" className={draft.question.noMode === item.id ? "choice on" : "choice"} onClick={() => patch({ question: { ...draft.question, noMode: item.id } })}>
                      <strong>{item.title}</strong>
                      <span>{item.text}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <h1>Երբ հանդիպել</h1>
                <div className="seg">
                  <button type="button" className={draft.when.mode === "recipient" ? "on" : ""} onClick={() => patch({ when: { ...draft.when, mode: "recipient" } })}>Թող ինքը ընտրի</button>
                  <button type="button" className={draft.when.mode === "creator" ? "on" : ""} onClick={() => patch({ when: { ...draft.when, mode: "creator" } })}>Օրը ես եմ նշում</button>
                </div>
                <label className="field">Վերնագիր<input value={draft.when.title} onChange={(event) => patch({ when: { ...draft.when, title: event.target.value } })} /></label>
                <label className="field">Ենթավերնագիր<input value={draft.when.subtitle} onChange={(event) => patch({ when: { ...draft.when, subtitle: event.target.value } })} /></label>
                {draft.when.mode === "creator" ? (
                  <div className="split">
                    <label className="field">Օր<input type="date" value={draft.when.date} onChange={(event) => patch({ when: { ...draft.when, date: event.target.value } })} /></label>
                    <label className="field">Ժամ<input type="time" value={draft.when.time} onChange={(event) => patch({ when: { ...draft.when, time: event.target.value } })} /></label>
                  </div>
                ) : (
                  <label className="field">Ժամերը, ստորակետով
                    <input value={draft.when.times.join(", ")} onChange={(event) => patch({ when: { ...draft.when, times: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) } })} />
                  </label>
                )}
              </>
            ) : null}

            {step === 4 ? (
              <>
                <h1>Թող ընտրի</h1>
                <p className="help">Վայր, ուտելիք, ֆիլմ կամ քո տարբերակը։ Անջատված բլոկը հյուրը չի տեսնի։</p>
                {draft.choices.map((choice, choiceIndex) => (
                  <fieldset key={choice.id} className="pack">
                    <label className="check">
                      <input type="checkbox" checked={choice.enabled} onChange={(event) => {
                        const choices = draft.choices.slice();
                        choices[choiceIndex] = { ...choice, enabled: event.target.checked };
                        patch({ choices });
                      }} />
                      Ցույց տալ
                    </label>
                    <label className="field">Վերնագիր<input value={choice.title} onChange={(event) => {
                      const choices = draft.choices.slice();
                      choices[choiceIndex] = { ...choice, title: event.target.value };
                      patch({ choices });
                    }} /></label>
                    <label className="field">Ենթավերնագիր<input value={choice.subtitle} onChange={(event) => {
                      const choices = draft.choices.slice();
                      choices[choiceIndex] = { ...choice, subtitle: event.target.value };
                      patch({ choices });
                    }} /></label>
                    {choice.items.map((item, itemIndex) => (
                      <div className="item-row" key={item.id}>
                        <input className="emoji" value={item.emoji} onChange={(event) => {
                          const choices = draft.choices.slice();
                          const items = choice.items.slice();
                          items[itemIndex] = { ...item, emoji: event.target.value };
                          choices[choiceIndex] = { ...choice, items };
                          patch({ choices });
                        }} />
                        <input value={item.label} onChange={(event) => {
                          const choices = draft.choices.slice();
                          const items = choice.items.slice();
                          items[itemIndex] = { ...item, label: event.target.value };
                          choices[choiceIndex] = { ...choice, items };
                          patch({ choices });
                        }} />
                        <button type="button" className="text-btn" onClick={() => {
                          const choices = draft.choices.slice();
                          choices[choiceIndex] = { ...choice, items: choice.items.filter((_, index) => index !== itemIndex) };
                          patch({ choices });
                        }}>Ջնջել</button>
                      </div>
                    ))}
                    <button type="button" className="text-btn" onClick={() => {
                      const choices = draft.choices.slice();
                      choices[choiceIndex] = { ...choice, items: [...choice.items, { id: `n${Date.now()}`, emoji: "💛", label: "" }] };
                      patch({ choices });
                    }}>+ Տարբերակ</button>
                  </fieldset>
                ))}
                <button type="button" className="btn btn-ghost" onClick={() => patch({
                  choices: [...draft.choices, { id: `c${Date.now()}`, enabled: true, title: "Ի՞նչ անենք", subtitle: "Ընտրիր տարբերակը", items: [{ id: "a", emoji: "☕", label: "Սուրճ" }, { id: "b", emoji: "🚶", label: "Զբոսանք" }] }]
                })}>Ավելացնել սեփական ընտրություն</button>
              </>
            ) : null}

            {step === 5 ? (
              <>
                <h1>Եզրափակումը</h1>
                <p className="help">Կարող ես դնել {"{name}"} {"{date}"} {"{time}"} {"{place}"}։ Դրանք կլցվեն հյուրի ընտրությամբ։</p>
                <div className="chips">
                  {["{name}", "{date}", "{time}", "{place}"].map((token) => (
                    <button key={token} type="button" className="chip" onClick={() => patch({ finale: { ...draft.finale, title: `${draft.finale.title} ${token}` } })}>{token}</button>
                  ))}
                </div>
                <label className="field">Տեքստ<textarea rows={4} value={draft.finale.title} onChange={(event) => patch({ finale: { ...draft.finale, title: event.target.value } })} /></label>
                <div className="seg">
                  <button type="button" className={draft.finale.animation !== "none" ? "on" : ""} onClick={() => patch({ finale: { ...draft.finale, animation: "hearts" } })}>Սրտեր</button>
                  <button type="button" className={draft.finale.animation === "none" ? "on" : ""} onClick={() => patch({ finale: { ...draft.finale, animation: "none" } })}>Առանց անիմացիայի</button>
                </div>
                <label className="field">Լուսանկար
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    try {
                      const url = await uploadFile(file);
                      patch({ media: { ...draft.media, photo: url } });
                      setRecordNote("Նկարը պահվեց");
                    } catch (err) {
                      setRecordNote(err.message);
                    }
                  }} />
                </label>
                <div className="share-row">
                  <button className="btn btn-ghost" type="button" onClick={() => record("voice")}>Ձայն, մինչև 20 վրկ</button>
                  <button className="btn btn-ghost" type="button" onClick={() => record("video")}>Տեսաշրջան, 8 վրկ</button>
                </div>
                {recordNote ? <p className="help">{recordNote}</p> : null}
                {draft.media.photo ? <p className="help">Նկար կա</p> : null}
                {draft.media.voice ? <p className="help">Ձայն կա</p> : null}
                {draft.media.video ? <p className="help">Տեսանյութ կա</p> : null}
              </>
            ) : null}

            {step === 6 ? (
              <>
                <h1>{editToken ? "Պահել փոփոխությունը" : "Ստանալ հղումը"}</h1>
                <p className="price">{editToken ? amd(EDIT_PRICE) : amd(PRICE)} <small>{editToken ? "մեկ խմբագրում" : "մեկ հրավեր, 30 օր"}</small></p>
                <p className="help">Վճարային համակարգը դեռ միացված չէ։ Հղումը ստեղծվում է անմիջապես, գումար չի գանձվում։</p>
                <div className="choice-list">
                  {PAY_METHODS.map((item) => (
                    <button key={item.id} type="button" className={draft.method === item.id ? "choice on" : "choice"} onClick={() => patch({ method: item.id })}>
                      <strong>{item.title}</strong>
                      <span>{item.text}</span>
                    </button>
                  ))}
                </div>
                <label className="field">Էլ. փոստ կտրոնի համար<input type="email" value={draft.email} onChange={(event) => patch({ email: event.target.value })} placeholder="ani@mail.am" /></label>
                <label className="field">Telegram, եթե ուզում ես<input value={draft.telegram} onChange={(event) => patch({ telegram: event.target.value })} placeholder="username" /></label>
              </>
            ) : null}

            {error ? <p className="form-error">{error}</p> : null}
            <div className="wizard-nav">
              {step > 0 ? <button className="btn btn-ghost" type="button" onClick={() => { setError(""); setStep((value) => value - 1); }}>Հետ</button> : <span />}
              {step < 6 ? <button className="btn btn-solid" type="button" onClick={next}>Առաջ</button> : (
                <button className="btn btn-solid" type="button" disabled={busy} onClick={publish}>{busy ? "Պահում ենք…" : editToken ? "Պահել" : "Ստեղծել հղումը"}</button>
              )}
            </div>
            <button className="text-btn preview-toggle" type="button" onClick={() => setShowPreview((value) => !value)}>
              {showPreview ? "Թաքցնել հեռախոսը" : "Տեսնել հեռախոսով"}
            </button>
          </div>
        </section>
        <aside className={showPreview ? "preview-col open" : "preview-col"}>
          <div className="phone">
            <InviteExperience key={previewKey} invite={preview} mode="preview" />
          </div>
          <button className="text-btn" type="button" onClick={() => setPreviewKey((value) => value + 1)}>Նորից խաղալ</button>
        </aside>
      </div>
    </main>
  );
}
