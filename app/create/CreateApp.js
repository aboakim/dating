"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import InviteExperience from "@/components/InviteExperience";
import { useLanguage } from "@/components/LanguageProvider";
import {
  DELAY_MINUTES,
  EDIT_PRICE,
  EXTEND_PLANS,
  MEDIA_PRESETS,
  NO_MODE_IDS,
  OPEN_MODE_IDS,
  PRICE,
  SCRATCH_COLORS,
  THEMES,
  WIZARD_STEPS,
  YES_MODE_IDS,
  blankDraft,
  choiceCatalog
} from "@/lib/catalog";
import { amd } from "@/lib/format";
import { validateStep } from "@/lib/validate";

function previewInvite(draft) {
  const open = { ...draft.open };
  if (open.mode === "timer") {
    open.openAt = open.schedule === "in"
      ? Date.now() + (Number(open.delayMinutes) || 1) * 60000
      : (open.openAt ? new Date(open.openAt).getTime() : Date.now() + 60000);
  }
  const enabled = (draft.choices || []).filter((choice) => choice.enabled);
  const choices = (draft.choiceMode === "one" ? enabled.slice(0, 1) : enabled)
    .map((choice) => ({
      ...choice,
      emoji: choice.emoji || "💛",
      label: choice.label || choice.title,
      items: choice.items.filter((item) => String(item.label || "").trim())
    }))
    .filter((choice) => choice.items.length > 0);
  return {
    id: "preview",
    audience: draft.audience,
    locale: draft.locale,
    recipientName: draft.recipientName || "…",
    senderName: draft.senderName,
    theme: draft.theme,
    open,
    question: draft.question,
    confirm: draft.confirm,
    when: draft.when,
    choices,
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

function inviteToDraft(invite, locale) {
  const draft = blankDraft(invite.audience, invite.occasion, invite.locale || locale);
  const catalog = choiceCatalog(invite.locale || locale);
  const byId = Object.fromEntries((invite.choices || []).map((choice) => [choice.id, choice]));
  return {
    ...draft,
    recipientName: invite.recipientName,
    senderName: invite.senderName || "",
    theme: invite.theme,
    locale: invite.locale || locale,
    open: {
      ...draft.open,
      ...invite.open,
      schedule: invite.open?.openAt ? "at" : draft.open.schedule,
      openAt: invite.open?.openAt ? toDatetimeLocal(invite.open.openAt) : "",
      pin: invite.open?.pin || draft.open.pin
    },
    question: { ...draft.question, ...invite.question },
    confirm: { ...draft.confirm, ...(invite.confirm || {}) },
    when: { ...draft.when, ...invite.when },
    choices: Object.values(catalog).map((pack) => {
      const saved = byId[pack.id];
      if (saved) return { ...pack, ...saved, enabled: true, items: saved.items?.length ? saved.items : pack.items };
      return { ...pack, enabled: false };
    }),
    choiceMode: (invite.choices || []).length > 1 ? "many" : "one",
    finale: { ...draft.finale, ...invite.finale },
    media: { ...draft.media, ...invite.media },
    telegram: invite.telegram || "",
    email: invite.email || "",
    method: "free"
  };
}

async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch("/api/upload", { method: "POST", body: form });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Upload failed");
  return data.url;
}

function Panel({ n, title, children }) {
  return (
    <div className="ctor-panel">
      <div className="ctor-panel-head">
        <span>{title}</span>
        {n ? <b>№{n}</b> : null}
      </div>
      <div className="ctor-panel-body">{children}</div>
    </div>
  );
}

export default function CreateApp() {
  const { dict, locale } = useLanguage();
  const C = dict.create;
  const [draft, setDraft] = useState(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [editToken, setEditToken] = useState("");
  const [recordNote, setRecordNote] = useState("");
  const [qr, setQr] = useState("");
  const [origin, setOrigin] = useState("");
  const catalog = useMemo(() => choiceCatalog(locale), [locale]);

  useEffect(() => {
    setOrigin(window.location.origin);
    const params = new URLSearchParams(window.location.search);
    const edit = params.get("edit");
    if (edit) {
      setEditToken(edit);
      fetch(`/api/creator/${edit}`)
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Failed");
          setDraft(inviteToDraft(data, locale));
        })
        .catch((err) => setError(err.message));
      return;
    }
    const saved = localStorage.getItem("jerm_draft_v3");
    const audience = params.get("audience") === "him" ? "him" : "her";
    const occasion = params.get("occasion") || "";
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const base = blankDraft(parsed.audience || audience, "", locale);
        const next = { ...base, ...parsed, locale };
        next.open = { ...base.open, ...(parsed.open || {}) };
        next.question = { ...base.question, ...(parsed.question || {}) };
        next.confirm = { ...base.confirm, ...(parsed.confirm || {}) };
        next.when = { ...base.when, ...(parsed.when || {}) };
        next.finale = { ...base.finale, ...(parsed.finale || {}) };
        next.media = { ...base.media, ...(parsed.media || {}) };
        // Always refresh preset arts so old crude stickers get replaced.
        next.open.gateEmoji = base.open.gateEmoji;
        if (!next.media?.photo) next.question.emoji = base.question.emoji;
        next.confirm.emoji = base.confirm.emoji;
        next.when.emoji = base.when.emoji;
        next.finale.emoji = base.finale.emoji;
        const oldNoHint = /ոչ|«нет»|for a no/i.test(String(next.confirm?.subtitle || ""));
        const oldButton = /այՈ|дА|yEs/.test(String(next.confirm?.button || ""));
        if (oldNoHint) next.confirm.subtitle = base.confirm.subtitle;
        if (oldButton) next.confirm.button = base.confirm.button;
        setDraft(next);
        return;
      } catch {
        localStorage.removeItem("jerm_draft_v3");
      }
    }
    setDraft(blankDraft(audience, occasion, locale));
  }, [locale]);

  useEffect(() => {
    if (!draft || editToken) return;
    localStorage.setItem("jerm_draft_v3", JSON.stringify({ ...draft, locale }));
  }, [draft, editToken, locale]);

  useEffect(() => {
    if (!draft) return;
    setDraft((current) => (current ? { ...current, locale } : current));
  }, [locale]);

  const preview = useMemo(() => (draft ? previewInvite({ ...draft, locale }) : null), [draft, locale]);
  const progress = step / Math.max(WIZARD_STEPS - 1, 1);

  useEffect(() => {
    if (!result || !origin) return;
    const url = `${origin}/i/${result.id}`;
    import("qrcode").then((QR) => QR.toDataURL(url, { margin: 1, width: 240 }).then(setQr));
  }, [result, origin]);

  function patch(partial) {
    setDraft((current) => ({ ...current, ...partial, locale }));
  }

  function patchDeep(key, partial) {
    setDraft((current) => ({ ...current, [key]: { ...current[key], ...partial }, locale }));
  }

  function next() {
    const message = validateStep({ ...draft, locale }, step);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setStep((value) => Math.min(value + 1, WIZARD_STEPS - 1));
    setPreviewKey((value) => value + 1);
  }

  function back() {
    setError("");
    setStep((value) => Math.max(value - 1, 0));
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
      setDraft((current) => ({
        ...current,
        media: { ...current.media, [kind === "video" ? "video" : "voice"]: url },
        question: { ...current.question, mediaMode: kind === "video" ? "circle" : "voice" }
      }));
      setRecordNote(kind === "video" ? C.videoSaved : C.voiceSaved);
    } catch (err) {
      const inApp = /Instagram|FBAN|FBAV|Telegram/i.test(navigator.userAgent || "");
      setRecordNote(err.message || (inApp ? C.inAppHint : C.recordFail));
    }
  }

  async function publish() {
    const message = validateStep({ ...draft, locale }, 7);
    if (message) {
      setError(message);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const payload = { ...draft, locale };
      if (editToken) {
        const response = await fetch(`/api/creator/${editToken}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draft: payload })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed");
        setResult({ id: data.id, creatorToken: data.creatorToken, expiresAt: data.expiresAt, edited: true, botUrl: data.botUrl });
      } else {
        const ref = localStorage.getItem("jerm_ref") || "";
        const response = await fetch("/api/invites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draft: payload, method: "free", ref })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed");
        localStorage.removeItem("jerm_draft_v3");
        setResult(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function setPackEnabled(packId, enabled) {
    const nextChoices = draft.choices.map((choice) => {
      if (draft.choiceMode === "one") {
        return { ...choice, enabled: choice.id === packId ? enabled : false };
      }
      return choice.id === packId ? { ...choice, enabled } : choice;
    });
    if (draft.choiceMode === "one" && enabled) {
      patch({ choices: nextChoices.map((choice) => ({ ...choice, enabled: choice.id === packId })) });
      return;
    }
    patch({ choices: nextChoices });
  }

  function enablePack(packId) {
    const pack = catalog[packId];
    if (!pack) return;
    const exists = draft.choices.some((choice) => choice.id === packId);
    if (exists) {
      setPackEnabled(packId, true);
      return;
    }
    patch({ choices: [...draft.choices, { ...pack, enabled: true }] });
  }

  if (!draft) return <main className="center-page">{error || dict.common.loading}</main>;

  if (result) {
    const guest = `${origin}/i/${result.id}`;
    const mine = `${origin}/c/${result.creatorToken}`;
    const botUrl = result.botUrl || "";
    return (
      <main className="wrap narrow success-screen">
        <div className="heart-rail"><span className="heart-knob" style={{ left: "100%" }} /></div>
        <p className="eyebrow">{result.edited ? C.saved : C.ready}</p>
        <h1>{result.edited ? C.changesSaved : C.linkYours}</h1>
        <p className="lead">{C.sendLead}</p>
        <label className="field">{C.guestLink}<input readOnly value={guest} /></label>
        <label className="field">{C.yourPage}<input readOnly value={mine} /></label>
        {qr ? <img className="qr" src={qr} alt="QR" /> : null}
        <div className="share-row">
          <button className="btn btn-solid" type="button" onClick={() => navigator.clipboard.writeText(guest)}>{C.copyLink}</button>
          <Link className="btn btn-ghost" href={`/c/${result.creatorToken}`}>{C.openMine}</Link>
          {botUrl ? <a className="btn btn-solid" href={botUrl} target="_blank" rel="noreferrer">{C.openBot}</a> : null}
        </div>
        {botUrl ? <p className="help">{C.botHelp}</p> : <p className="help">{C.freeNote}</p>}
      </main>
    );
  }

  const showPreview = step > 0;
  const previewFocus = ["audience", "gate", "ask", "confirm", "when", "choice", "finale", "telegram"][step] || "ask";
  const previewHint = step === 1 ? C.previewOpen : step >= 2 && step <= 5 ? C.previewAsk : "";

  return (
    <main className="ctor">
      <div className="ctor-progress wrap">
        <div className="heart-rail">
          <div className="heart-rail-done" style={{ width: `${progress * 100}%` }} />
          <span className="heart-knob" style={{ left: `${progress * 100}%` }} />
        </div>
      </div>

      <div className={`wrap ctor-grid ${showPreview ? "has-preview" : "solo"}`}>
        {showPreview ? (
          <aside className="ctor-preview">
            {previewHint ? <p className="ctor-preview-hint">{previewHint}</p> : null}
            <div className="phone ctor-phone">
              <InviteExperience key={`${previewKey}-${previewFocus}`} invite={preview} mode="preview" focus={previewFocus} />
            </div>
            <button className="text-btn" type="button" onClick={() => setPreviewKey((value) => value + 1)}>{C.replay}</button>
          </aside>
        ) : null}

        <section className="ctor-main">
          {step === 0 ? (
            <div className="ctor-audience enter-up">
              <h1>{C.whoTitle}</h1>
              <div className="audience-cards">
                <button type="button" className={draft.audience === "him" ? "audience-card on" : "audience-card"} onClick={() => patch({ audience: "him", theme: "sevan" })}>
                  <span className="audience-emoji" aria-hidden="true">👨</span>
                  <strong>{C.forHim}</strong>
                </button>
                <button type="button" className={draft.audience === "her" ? "audience-card on her" : "audience-card"} onClick={() => patch({ audience: "her", theme: draft.theme === "sevan" ? "rose" : draft.theme })}>
                  <span className="audience-emoji" aria-hidden="true">👩</span>
                  <strong>{C.forHer}</strong>
                </button>
              </div>
              <label className="field">{C.theirName}<input value={draft.recipientName} onChange={(event) => patch({ recipientName: event.target.value })} /></label>
              <label className="field">{C.yourName}<input value={draft.senderName} onChange={(event) => patch({ senderName: event.target.value })} /></label>
              <label className="field">{C.occasion}<input value={draft.occasion} onChange={(event) => patch({ occasion: event.target.value })} placeholder={C.occasionPlaceholder} /></label>
              <div className="chips theme-chips">
                {THEMES.map((item) => (
                  <button key={item.id} type="button" className={draft.theme === item.id ? "chip on" : "chip"} onClick={() => patch({ theme: item.id })}>
                    <i style={{ background: item.accent }} /> {dict.themes[item.id]}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="enter-up">
              <h1>{C.howOpen}</h1>
              <div className="open-grid">
                {OPEN_MODE_IDS.map((id) => (
                  <button key={id} type="button" className={draft.open.mode === id ? "open-card on" : "open-card"} onClick={() => patchDeep("open", { mode: id })}>
                    <span className="open-ico" aria-hidden="true">{id === "now" ? "✕" : id === "pin" ? "#" : id === "scratch" ? "▭" : id === "envelope" ? "✉" : "🕒"}</span>
                    <strong>{dict.openModes[id].title}</strong>
                  </button>
                ))}
              </div>
              {draft.open.mode === "scratch" || draft.open.mode === "envelope" || draft.open.mode === "pin" ? (
                <Panel n={1} title={C.imageOnScreen}>
                  <div className="preset-row">
                    {MEDIA_PRESETS.map((preset) => (
                      <button key={preset.id} type="button" className={draft.open.gateEmoji === preset.src ? "preset on" : "preset"} onClick={() => patchDeep("open", { gateEmoji: preset.src })}>
                        <img src={preset.src} alt="" />
                      </button>
                    ))}
                  </div>
                </Panel>
              ) : null}
              {draft.open.mode === "scratch" ? (
                <Panel n={2} title={C.scratchLayer}>
                  <p className="label">{C.scratchColor}</p>
                  <div className="swatches">
                    {SCRATCH_COLORS.map((color) => (
                      <button key={color} type="button" className={draft.open.scratchColor === color ? "swatch on" : "swatch"} style={{ background: color }} onClick={() => patchDeep("open", { scratchColor: color })} />
                    ))}
                  </div>
                  <label className="field">{C.scratchLabel}<input value={draft.open.scratchText} onChange={(event) => patchDeep("open", { scratchText: event.target.value })} /></label>
                </Panel>
              ) : null}
              {draft.open.mode === "envelope" ? (
                <Panel n={2} title={C.envelopeHintTitle}>
                  <label className="field">{C.envelopeLabel}<input value={draft.open.envelopeHint} onChange={(event) => patchDeep("open", { envelopeHint: event.target.value })} /></label>
                </Panel>
              ) : null}
              {draft.open.mode === "pin" ? (
                <Panel n={2} title={dict.openModes.pin.title}>
                  <label className="field">{C.pinQuestion}<input value={draft.open.pinQuestion} onChange={(event) => patchDeep("open", { pinQuestion: event.target.value })} /></label>
                  <label className="field">{C.pinCode}<input inputMode="numeric" maxLength={4} value={draft.open.pin} onChange={(event) => patchDeep("open", { pin: event.target.value.replace(/\D/g, "").slice(0, 4) })} /></label>
                </Panel>
              ) : null}
              {draft.open.mode === "timer" ? (
                <>
                  <Panel n={1} title={C.imageOnScreen}>
                    <div className="preset-row">
                      {MEDIA_PRESETS.map((preset) => (
                        <button key={preset.id} type="button" className={draft.open.gateEmoji === preset.src ? "preset on" : "preset"} onClick={() => patchDeep("open", { gateEmoji: preset.src })}>
                          <img src={preset.src} alt="" />
                        </button>
                      ))}
                    </div>
                  </Panel>
                  <div className="seg">
                    <button type="button" className={draft.open.schedule !== "in" ? "on" : ""} onClick={() => patchDeep("open", { schedule: "at" })}>{C.atTime}</button>
                    <button type="button" className={draft.open.schedule === "in" ? "on" : ""} onClick={() => patchDeep("open", { schedule: "in" })}>{C.inDelay}</button>
                  </div>
                  <Panel n={2} title={C.openAt}>
                    {draft.open.schedule === "in" ? (
                      <div className="chips">
                        {DELAY_MINUTES.map((minutes) => (
                          <button key={minutes} type="button" className={Number(draft.open.delayMinutes) === minutes ? "chip on" : "chip"} onClick={() => patchDeep("open", { delayMinutes: minutes })}>{dict.delays[minutes]}</button>
                        ))}
                      </div>
                    ) : (
                      <label className="field">{C.openAt}<input type="datetime-local" value={draft.open.openAt} onChange={(event) => patchDeep("open", { openAt: event.target.value })} /></label>
                    )}
                    <p className="help">{C.tzHelp}</p>
                  </Panel>
                  <Panel n={3} title={C.titleAndButtons}>
                    <label className="field">{C.beforeText}<textarea value={draft.open.beforeText} onChange={(event) => patchDeep("open", { beforeText: event.target.value })} /></label>
                    <label className="field">{C.readyText}<input value={draft.open.readyText} onChange={(event) => patchDeep("open", { readyText: event.target.value })} /></label>
                  </Panel>
                </>
              ) : null}
              {draft.open.mode === "now" || draft.open.mode === "scratch" || draft.open.mode === "envelope" ? (
                <label className="field">{C.beforeText}<textarea value={draft.open.beforeText} onChange={(event) => patchDeep("open", { beforeText: event.target.value })} /></label>
              ) : null}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="enter-up">
              <div className="seg media-tabs">
                {[["image", C.mediaImages], ["voice", C.mediaVoice], ["circle", C.mediaCircle]].map(([id, label]) => (
                  <button key={id} type="button" className={draft.question.mediaMode === id ? "on" : ""} onClick={() => patchDeep("question", { mediaMode: id })}>{label}</button>
                ))}
              </div>
              <Panel n={1} title={draft.question.mediaMode === "image" ? C.imageOnScreen : draft.question.mediaMode === "voice" ? C.mediaVoice : C.mediaCircle}>
                {draft.question.mediaMode === "image" ? (
                  <>
                    <div className="preset-row">
                      {MEDIA_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          className={!draft.media.photo && draft.question.emoji === preset.src ? "preset on" : "preset"}
                          onClick={() => {
                            patchDeep("question", { emoji: preset.src });
                            patch({ media: { ...draft.media, photo: "" } });
                          }}
                        >
                          <img src={preset.src} alt="" />
                        </button>
                      ))}
                      <span className="preset more">{C.morePresets}</span>
                    </div>
                    <label className="upload-box">
                      <span>{C.uploadOwn}</span>
                      <small>{C.uploadHint}</small>
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await uploadFile(file);
                          patch({ media: { ...draft.media, photo: url } });
                          setRecordNote(C.photoSaved);
                        } catch (err) {
                          setRecordNote(err.message);
                        }
                      }} />
                    </label>
                    {draft.media.photo ? <p className="help">{C.hasPhoto}</p> : null}
                  </>
                ) : null}
                {draft.question.mediaMode === "voice" ? (
                  <>
                    <button className="btn btn-ghost" type="button" onClick={() => record("voice")}>{C.voiceBtn}</button>
                    {draft.media.voice ? <p className="help">{C.hasVoice}</p> : null}
                  </>
                ) : null}
                {draft.question.mediaMode === "circle" ? (
                  <>
                    <button className="btn btn-ghost" type="button" onClick={() => record("video")}>{C.videoBtn}</button>
                    {draft.media.video ? <p className="help">{C.hasVideo}</p> : null}
                  </>
                ) : null}
                {recordNote ? <p className="help">{recordNote}</p> : null}
              </Panel>
              <Panel n={2} title={C.titleAndButtons}>
                <label className="field">{C.title}<input value={draft.question.title} onChange={(event) => patchDeep("question", { title: event.target.value })} /></label>
                <label className="field">{C.subtitle}<textarea value={draft.question.subtitle} onChange={(event) => patchDeep("question", { subtitle: event.target.value })} /></label>
                <div className="split">
                  <label className="field">{C.yesButton}<input value={draft.question.yes} onChange={(event) => patchDeep("question", { yes: event.target.value })} /></label>
                  <label className="field">{C.noButton}<input value={draft.question.no} onChange={(event) => patchDeep("question", { no: event.target.value })} /></label>
                </div>
              </Panel>
              <Panel n={3} title={C.buttonAnim}>
                <p className="label">{C.yesAnim}</p>
                <div className="chips">
                  {YES_MODE_IDS.map((id) => (
                    <button key={id} type="button" className={draft.question.yesMode === id ? "chip on" : "chip"} onClick={() => patchDeep("question", { yesMode: id })}>
                      {dict.yesModes?.[id]?.title || (id === "burst" ? C.animBurst : C.animNone)}
                    </button>
                  ))}
                </div>
                <p className="label">{C.noAnim}</p>
                <div className="chips">
                  {NO_MODE_IDS.map((id) => (
                    <button key={id} type="button" className={draft.question.noMode === id ? "chip on" : "chip"} onClick={() => patchDeep("question", { noMode: id })}>
                      {dict.noModes?.[id]?.title || id}
                    </button>
                  ))}
                </div>
              </Panel>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="enter-up">
              <h1>{C.confirmTitle}</h1>
              <Panel n={1} title={C.imageOnScreen}>
                <div className="preset-row">
                  {MEDIA_PRESETS.map((preset) => (
                    <button key={preset.id} type="button" className={draft.confirm.emoji === preset.src ? "preset on" : "preset"} onClick={() => patchDeep("confirm", { emoji: preset.src })}>
                      <img src={preset.src} alt="" />
                    </button>
                  ))}
                </div>
              </Panel>
              <Panel n={2} title={C.titleAndButtons}>
                <label className="field">{C.title}<input value={draft.confirm.title} onChange={(event) => patchDeep("confirm", { title: event.target.value })} /></label>
                <label className="field">{C.subtitle}<textarea value={draft.confirm.subtitle} onChange={(event) => patchDeep("confirm", { subtitle: event.target.value })} /></label>
                <label className="field">{C.confirmButton}<input value={draft.confirm.button} onChange={(event) => patchDeep("confirm", { button: event.target.value })} /></label>
              </Panel>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="enter-up">
              <h1>{C.whenTitle}</h1>
              <Panel n={1} title={C.imageOnScreen}>
                <div className="preset-row">
                  {MEDIA_PRESETS.map((preset) => (
                    <button key={preset.id} type="button" className={draft.when.emoji === preset.src ? "preset on" : "preset"} onClick={() => patchDeep("when", { emoji: preset.src })}>
                      <img src={preset.src} alt="" />
                    </button>
                  ))}
                </div>
              </Panel>
              <Panel n={2} title={C.titleAndButtons}>
                <p className="label">{C.whoPicks}</p>
                <div className="seg">
                  <button type="button" className={draft.when.mode === "recipient" ? "on" : ""} onClick={() => patchDeep("when", { mode: "recipient" })}>{C.letThem}</button>
                  <button type="button" className={draft.when.mode === "creator" ? "on" : ""} onClick={() => patchDeep("when", { mode: "creator" })}>{C.iSet}</button>
                </div>
                <label className="field">{C.title}<input value={draft.when.title} onChange={(event) => patchDeep("when", { title: event.target.value })} /></label>
                <label className="field">{C.whenButton}<input value={draft.when.button} onChange={(event) => patchDeep("when", { button: event.target.value })} /></label>
                {draft.when.mode === "creator" ? (
                  <div className="split">
                    <label className="field">{C.date}<input type="date" value={draft.when.date} onChange={(event) => patchDeep("when", { date: event.target.value })} /></label>
                    <label className="field">{C.time}<input type="time" value={draft.when.time} onChange={(event) => patchDeep("when", { time: event.target.value })} /></label>
                  </div>
                ) : (
                  <label className="field">{C.timesCsv}
                    <input value={draft.when.times.join(", ")} onChange={(event) => patchDeep("when", { times: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} />
                  </label>
                )}
              </Panel>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="enter-up">
              <h1>{C.chooseTitle}</h1>
              <p className="help">{C.chooseHelp}</p>
              <div className="seg">
                <button type="button" className={draft.choiceMode !== "many" ? "on" : ""} onClick={() => {
                  const first = draft.choices.find((choice) => choice.enabled) || draft.choices[0];
                  patch({ choiceMode: "one", choices: draft.choices.map((choice) => ({ ...choice, enabled: choice.id === first?.id })) });
                }}>{C.onePack}</button>
                <button type="button" className={draft.choiceMode === "many" ? "on" : ""} onClick={() => patch({ choiceMode: "many" })}>{C.manyPacks}</button>
              </div>
              <div className="pack-grid">
                {Object.values(catalog).map((pack) => {
                  const current = draft.choices.find((choice) => choice.id === pack.id);
                  const on = Boolean(current?.enabled);
                  return (
                    <button key={pack.id} type="button" className={on ? "pack-card on" : "pack-card"} onClick={() => (on ? setPackEnabled(pack.id, false) : enablePack(pack.id))}>
                      <span aria-hidden="true">{pack.emoji}</span>
                      <strong>{pack.label}</strong>
                    </button>
                  );
                })}
              </div>
              {draft.choices.filter((choice) => choice.enabled).map((choice, choiceIndex) => (
                <Panel key={choice.id} n={choiceIndex + 1} title={`${C.screenTitle}`}>
                  <label className="field">{C.title}<input value={choice.title} onChange={(event) => {
                    const choices = draft.choices.slice();
                    const index = choices.findIndex((item) => item.id === choice.id);
                    choices[index] = { ...choice, title: event.target.value };
                    patch({ choices });
                  }} /></label>
                  <label className="field">{C.subtitle}<input value={choice.subtitle} onChange={(event) => {
                    const choices = draft.choices.slice();
                    const index = choices.findIndex((item) => item.id === choice.id);
                    choices[index] = { ...choice, subtitle: event.target.value };
                    patch({ choices });
                  }} /></label>
                  {choice.items.map((item, itemIndex) => (
                    <div className="item-row" key={item.id}>
                      <input className="emoji" value={item.emoji} onChange={(event) => {
                        const choices = draft.choices.slice();
                        const index = choices.findIndex((row) => row.id === choice.id);
                        const items = choice.items.slice();
                        items[itemIndex] = { ...item, emoji: event.target.value };
                        choices[index] = { ...choice, items };
                        patch({ choices });
                      }} />
                      <input value={item.label} onChange={(event) => {
                        const choices = draft.choices.slice();
                        const index = choices.findIndex((row) => row.id === choice.id);
                        const items = choice.items.slice();
                        items[itemIndex] = { ...item, label: event.target.value };
                        choices[index] = { ...choice, items };
                        patch({ choices });
                      }} />
                      <button type="button" className="text-btn" onClick={() => {
                        const choices = draft.choices.slice();
                        const index = choices.findIndex((row) => row.id === choice.id);
                        choices[index] = { ...choice, items: choice.items.filter((_, i) => i !== itemIndex) };
                        patch({ choices });
                      }}>{C.delete}</button>
                    </div>
                  ))}
                  <button type="button" className="text-btn" onClick={() => {
                    const choices = draft.choices.slice();
                    const index = choices.findIndex((row) => row.id === choice.id);
                    choices[index] = { ...choice, items: [...choice.items, { id: `n${Date.now()}`, emoji: "💛", label: "" }] };
                    patch({ choices });
                  }}>{C.addOption}</button>
                </Panel>
              ))}
            </div>
          ) : null}

          {step === 6 ? (
            <div className="enter-up">
              <h1>{C.finaleTitle}</h1>
              <p className="help">{C.finaleHelp}</p>
              <Panel n={1} title={C.imageOnScreen}>
                <div className="preset-row">
                  {MEDIA_PRESETS.map((preset) => (
                    <button key={preset.id} type="button" className={draft.finale.emoji === preset.src ? "preset on" : "preset"} onClick={() => patchDeep("finale", { emoji: preset.src })}>
                      <img src={preset.src} alt="" />
                    </button>
                  ))}
                </div>
              </Panel>
              <div className="chips">
                {["{name}", "{date}", "{time}", "{place}"].map((token) => (
                  <button key={token} type="button" className="chip" onClick={() => patchDeep("finale", { title: `${draft.finale.title} ${token}` })}>{token}</button>
                ))}
              </div>
              <label className="field">{C.title}<textarea rows={4} value={draft.finale.title} onChange={(event) => patchDeep("finale", { title: event.target.value })} /></label>
              <div className="seg">
                <button type="button" className={draft.finale.animation !== "none" ? "on" : ""} onClick={() => patchDeep("finale", { animation: "hearts" })}>{C.hearts}</button>
                <button type="button" className={draft.finale.animation === "none" ? "on" : ""} onClick={() => patchDeep("finale", { animation: "none" })}>{C.noAnim}</button>
              </div>
            </div>
          ) : null}

          {step === 7 ? (
            <div className="enter-up">
              <h1>{C.payTitle}</h1>
              <p className="help">{C.payLead}</p>
              <div className="pay-card">
                <div className="pay-price">{amd(PRICE)}</div>
                <p>{dict.landing.priceLead}</p>
                <ul className="pay-list">
                  <li>{dict.landing.editLabel}: {amd(EDIT_PRICE)}</li>
                  {EXTEND_PLANS.map((plan) => (
                    <li key={plan.days}>{dict.landing.extendLabel} {plan.days}: {amd(plan.price)}</li>
                  ))}
                </ul>
                <p className="help">{C.freeNote}</p>
              </div>
              <Panel n={1} title={C.telegram}>
                <label className="field">
                  <input value={draft.telegram} onChange={(event) => patch({ telegram: event.target.value })} placeholder={C.telegramPlaceholder} />
                </label>
                <p className="help">{C.telegramHelp}</p>
                <label className="field">{C.email}<input type="email" value={draft.email} onChange={(event) => patch({ email: event.target.value })} /></label>
              </Panel>
            </div>
          ) : null}

          {error ? <p className="form-error">{error}</p> : null}

          <div className="ctor-nav">
            {step > 0 ? <button className="text-btn" type="button" onClick={back}>← {dict.common.back}</button> : <span />}
            {step < WIZARD_STEPS - 1 ? (
              <button className="btn btn-solid" type="button" onClick={next}>{C.continue || dict.common.continue}</button>
            ) : (
              <button className="btn btn-solid" type="button" disabled={busy} onClick={publish}>
                {busy ? C.saving : editToken ? dict.common.save : `${C.payAndGetLink} · ${amd(PRICE)}`}
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
