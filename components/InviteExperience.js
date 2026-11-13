"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FallingHearts from "@/components/FallingHearts";
import { useLanguage } from "@/components/LanguageProvider";
import { isPresetSrc, themeById } from "@/lib/catalog";
import { getDict } from "@/lib/i18n";
import { fillTemplate, formatDateISO, upcomingDays } from "@/lib/format";

function ScreenArt({ value, className = "screen-gif" }) {
  if (!value) return null;
  if (isPresetSrc(value) || String(value).startsWith("/uploads/")) {
    return <img className={className} src={value} alt="" />;
  }
  return <div className="emoji-hero" aria-hidden="true">{value}</div>;
}

function HeartBurst() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        left: 6 + ((index * 31) % 88),
        delay: (index % 7) * 0.07,
        duration: 1.4 + (index % 5) * 0.22
      })),
    []
  );
  return (
    <div className="burst" aria-hidden="true">
      {hearts.map((heart) => (
        <span key={heart.id} style={{ left: `${heart.left}%`, animationDelay: `${heart.delay}s`, animationDuration: `${heart.duration}s` }}>
          ♥
        </span>
      ))}
    </div>
  );
}

function ScratchCard({ color, text, onDone }) {
  const ref = useRef(null);
  const done = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let drawing = false;
    let last = null;
    let cleared = 0;

    const paint = () => {
      const width = Math.max(1, parent.clientWidth);
      const height = Math.max(1, parent.clientHeight);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = color || "#F7A8C4";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#fff";
      ctx.font = "700 26px var(--font-hy), var(--font-body), sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text || "", width / 2, height / 2);
      done.current = false;
      cleared = 0;
      last = null;
    };

    const point = (event) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    };

    const eraseAt = (from, to) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 56;
      ctx.beginPath();
      if (from) ctx.moveTo(from.x, from.y);
      else ctx.moveTo(to.x, to.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(to.x, to.y, 28, 0, Math.PI * 2);
      ctx.fill();
    };

    const check = () => {
      if (done.current) return;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0;
      const step = 16;
      for (let i = 3; i < data.length; i += step) {
        if (data[i] < 40) clear += 1;
      }
      const total = data.length / step;
      if (clear / total > 0.35) {
        done.current = true;
        drawing = false;
        last = null;
        onDoneRef.current();
      }
    };

    const down = (event) => {
      if (done.current) return;
      event.preventDefault();
      drawing = true;
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
      last = point(event);
      eraseAt(null, last);
    };

    const move = (event) => {
      if (!drawing || done.current) return;
      event.preventDefault();
      const next = point(event);
      eraseAt(last, next);
      last = next;
      cleared += 1;
      if (cleared % 8 === 0) check();
    };

    const up = (event) => {
      if (!drawing) return;
      drawing = false;
      last = null;
      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
      check();
    };

    paint();
    const resize = new ResizeObserver(paint);
    resize.observe(parent);
    canvas.addEventListener("pointerdown", down, { passive: false });
    canvas.addEventListener("pointermove", move, { passive: false });
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("lostpointercapture", up);
    return () => {
      resize.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("lostpointercapture", up);
    };
  }, [color, text]);

  return <canvas ref={ref} className="scratch" aria-label="scratch" />;
}

function Countdown({ openAt, beforeText, onDone, labels }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const left = Math.max(0, (openAt || 0) - now);
  const hours = Math.floor(left / 3600000);
  const minutes = Math.floor((left % 3600000) / 60000);
  const seconds = Math.floor((left % 60000) / 1000);
  return (
    <div className="gate-card">
      <FallingHearts compact color="var(--accent)" />
      <p>{beforeText}</p>
      {left > 0 ? (
        <div className="clock" aria-live="polite">
          <b>{String(hours).padStart(2, "0")}</b>
          <span>{labels.hours}</span>
          <b>{String(minutes).padStart(2, "0")}</b>
          <span>{labels.minutes}</span>
          <b>{String(seconds).padStart(2, "0")}</b>
          <span>{labels.seconds}</span>
        </div>
      ) : (
        <button className="btn btn-solid pulse" type="button" onClick={onDone}>
          {labels.openInvite}
        </button>
      )}
    </div>
  );
}

function resolveFocus(invite, focus) {
  if (!focus || focus === "audience") return null;
  if (focus === "gate") return invite.open.mode === "now" ? "ask" : "gate";
  if (focus === "choice") return (invite.choices || []).length > 1 ? "choiceHub" : invite.choices?.[0]?.id || "finale";
  if (focus === "telegram") return "finale";
  return focus;
}

export default function InviteExperience({ invite, mode = "live", onEvent, focus }) {
  const { dict: uiDict } = useLanguage();
  const locale = invite.locale || uiDict.lang || "hy";
  const dict = getDict(locale);
  const theme = themeById(invite.theme);
  const choices = invite.choices || [];
  const multiChoices = choices.length > 1;
  const previewFocus = mode === "preview" ? resolveFocus(invite, focus) : null;
  const steps = useMemo(() => {
    const list = [];
    if (invite.open.mode !== "now") list.push("gate");
    list.push("ask");
    if (invite.confirm?.title) list.push("confirm");
    if (invite.when.mode === "recipient" || previewFocus === "when") list.push("when");
    if (multiChoices) list.push("choiceHub");
    for (const choice of choices) list.push(choice.id);
    list.push("finale");
    return list;
  }, [invite, previewFocus, multiChoices, choices]);

  const initialStep = useMemo(() => {
    if (!previewFocus) return 0;
    const index = steps.indexOf(previewFocus);
    return index >= 0 ? index : 0;
  }, [previewFocus, steps]);

  const [step, setStep] = useState(initialStep);
  const [unlocked, setUnlocked] = useState(invite.open.mode !== "pin" || previewFocus !== "gate");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [runPos, setRunPos] = useState(null);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [shake, setShake] = useState(false);
  const [date, setDate] = useState(invite.when.mode === "creator" ? invite.when.date : "");
  const [time, setTime] = useState(invite.when.mode === "creator" ? invite.when.time : "");
  const [picks, setPicks] = useState({});
  const [hubSelected, setHubSelected] = useState(() => (multiChoices ? [] : choices.map((choice) => choice.id)));
  const [error, setError] = useState("");
  const [showHearts, setShowHearts] = useState(previewFocus === "finale" && invite.finale?.animation !== "none");
  const stageRef = useRef(null);
  const sentOpen = useRef(false);

  useEffect(() => {
    if (mode !== "live" || sentOpen.current) return;
    sentOpen.current = true;
    onEvent?.({ type: "open" });
  }, [mode, onEvent]);

  useEffect(() => {
    if (mode !== "live" || attempts === 0) return;
    const timer = setTimeout(() => onEvent?.({ type: "no", count: attempts }), 350);
    return () => clearTimeout(timer);
  }, [attempts, mode, onEvent]);

  useEffect(() => {
    if (invite.state?.answered) {
      setDate(invite.state.date || date);
      setTime(invite.state.time || time);
      setPicks(invite.state.picks || {});
      setStep(steps.length - 1);
      setShowHearts(invite.finale.animation !== "none");
    }
  }, [invite.state, steps.length]);

  const current = steps[step];
  const place = Object.values(picks).filter(Boolean).join(", ");
  const finaleText = fillTemplate(invite.finale.title, {
    date,
    time,
    place,
    name: invite.recipientName,
    locale
  });

  function evade(event) {
    if (invite.question.noMode === "none") return;
    setAttempts((count) => count + 1);
    if (invite.question.noMode === "shrink") {
      setScale((value) => Math.max(0.18, value * 0.7));
      return;
    }
    if (invite.question.noMode === "fade") {
      setOpacity((value) => Math.max(0, value - 0.34));
      return;
    }
    const stage = stageRef.current?.getBoundingClientRect();
    if (!stage) return;
    event.preventDefault();
    setRunPos({
      x: 8 + Math.random() * Math.max(20, stage.width - 130),
      y: 8 + Math.random() * Math.max(20, stage.height - 70)
    });
  }

  async function submitPin(event) {
    event.preventDefault();
    setPinError("");
    if (mode === "preview") {
      if (pin === invite.open.pin) setUnlocked(true);
      else setPinError(dict.guest.wrongPin);
      return;
    }
    const response = await fetch(`/api/invites/${invite.id}/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "unlock", pin })
    });
    if (response.ok) setUnlocked(true);
    else setPinError(dict.guest.wrongPin);
  }

  async function finish(nextPicks = picks, nextDate = date, nextTime = time) {
    if (mode === "live") {
      setError("");
      const response = await fetch(`/api/invites/${invite.id}/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "answer", date: nextDate, time: nextTime, picks: nextPicks })
      });
      if (!response.ok) {
        setError(dict.guest.saveFail);
        return;
      }
    }
    setStep(steps.length - 1);
  }

  function toggleHub(id) {
    setHubSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function nextSelectedChoice(fromStep) {
    for (let index = fromStep + 1; index < steps.length; index += 1) {
      const id = steps[index];
      if (id === "finale") return index;
      if (hubSelected.includes(id)) return index;
    }
    return steps.indexOf("finale");
  }

  async function goNext() {
    const next = steps[step + 1];
    if (next === "choiceHub" || hubSelected.includes(next) || next === "finale" || !choices.some((choice) => choice.id === next)) {
      if (next === "finale") await finish();
      else setStep((value) => value + 1);
      return;
    }
    const jump = nextSelectedChoice(step);
    if (steps[jump] === "finale") await finish();
    else setStep(jump);
  }

  async function sayYes() {
    if (invite.question.yesMode !== "none") {
      setShowHearts(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    await goNext();
  }

  async function continueFrom(kind) {
    if (kind === "when" && (!date || !time)) {
      setError(dict.guest.pickDate);
      return;
    }
    if (kind === "choiceHub") {
      if (!hubSelected.length) {
        setError(dict.guest.pickChoice);
        return;
      }
      setError("");
      const first = nextSelectedChoice(step);
      setStep(first);
      return;
    }
    if (kind === "choice") {
      setError("");
      const jump = nextSelectedChoice(step);
      if (steps[jump] === "finale") await finish();
      else setStep(jump);
      return;
    }
    setError("");
    if (steps[step + 1] === "finale") await finish();
    else setStep((value) => value + 1);
  }

  const fromLabel = invite.senderName
    ? locale === "en"
      ? `${dict.common.from} ${invite.senderName}`
      : locale === "ru"
        ? `${dict.common.from} ${invite.senderName}`
        : `${invite.senderName}${dict.common.from}`
    : dict.common.forYou;

  return (
    <div className={`invite ${shake ? "shake" : ""}`} style={{ background: theme.bg, color: theme.ink, "--accent": theme.accent, "--soft": theme.soft }}>
      <div className="stage" ref={stageRef}>
        {showHearts && current !== "ask" ? <HeartBurst /> : null}

        {current === "gate" && invite.open.mode === "timer" ? (
          <div className="ask enter-up">
            <ScreenArt value={invite.open.gateEmoji} />
            <Countdown
              openAt={invite.open.openAt}
              beforeText={invite.open.beforeText}
              onDone={() => setStep((value) => value + 1)}
              labels={{ ...dict.guest, openInvite: invite.open.readyText || dict.common.openInvite }}
            />
            {mode === "preview" ? (
              <button className="text-btn" type="button" onClick={() => setStep((value) => value + 1)}>{dict.common.skipPreview}</button>
            ) : null}
          </div>
        ) : null}
        {current === "gate" && invite.open.mode === "scratch" ? (
          <div className="scratch-wrap enter-up">
            <div className="gate-under">
              <ScreenArt value={invite.open.gateEmoji} className="screen-gif gate-art" />
              {invite.open.beforeText ? <p>{invite.open.beforeText}</p> : null}
            </div>
            <ScratchCard color={invite.open.scratchColor} text={invite.open.scratchText} onDone={() => setStep((value) => value + 1)} />
          </div>
        ) : null}
        {current === "gate" && invite.open.mode === "envelope" ? (
          <button className="envelope enter-up" type="button" onClick={() => setStep((value) => value + 1)}>
            <span className="flap" />
            <span className="letter">
              <ScreenArt value={invite.open.gateEmoji} className="screen-gif gate-art" />
              {invite.open.envelopeHint}
            </span>
          </button>
        ) : null}
        {current === "gate" && invite.open.mode === "pin" && !unlocked ? (
          <form className="gate-card enter-up" onSubmit={submitPin}>
            <ScreenArt value={invite.open.gateEmoji} />
            <p>{invite.open.pinQuestion}</p>
            <input className="pin" inputMode="numeric" maxLength={4} value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))} aria-label="PIN" />
            {pinError ? <p className="form-error">{pinError}</p> : null}
            <button className="btn btn-solid" type="submit">{dict.guest.open}</button>
          </form>
        ) : null}
        {current === "gate" && invite.open.mode === "pin" && unlocked ? (
          <div className="gate-card enter-up">
            <p>{dict.common.correct}</p>
            <button className="btn btn-solid" type="button" onClick={() => setStep((value) => value + 1)}>{dict.common.continue}</button>
          </div>
        ) : null}

        {current === "ask" ? (
          <div className="ask scallop enter-up">
            <Media invite={invite} emoji={invite.question?.emoji} />
            <p className="eyebrow">{fromLabel}</p>
            <h2>{invite.question.title}</h2>
            {invite.question.subtitle ? <p className="sub">{invite.question.subtitle}</p> : null}
            <div className="ask-actions">
              <button className="btn btn-solid pulse" type="button" onClick={sayYes}>{invite.question.yes}</button>
              <button
                className="btn btn-no"
                type="button"
                style={{
                  opacity,
                  transform: `scale(${scale})`,
                  ...(runPos ? { position: "absolute", left: runPos.x, top: runPos.y } : null)
                }}
                onPointerDown={evade}
              >
                {invite.question.no}
              </button>
            </div>
            {attempts > 2 ? <p className="hint">{dict.common.stillTrying}</p> : null}
            {error ? <p className="form-error">{error}</p> : null}
          </div>
        ) : null}

        {current === "confirm" ? (
          <div className="ask scallop enter-up">
            <ScreenArt value={invite.confirm?.emoji} />
            <h2>{invite.confirm?.title}</h2>
            {invite.confirm?.subtitle ? <p className="sub">{invite.confirm.subtitle}</p> : null}
            <button className="btn btn-solid" type="button" onClick={() => goNext()}>{invite.confirm?.button || dict.landing.yes}</button>
          </div>
        ) : null}

        {current === "when" ? (
          <div className="ask scallop enter-up">
            <ScreenArt value={invite.when?.emoji} />
            <h2>{invite.when.title}</h2>
            {invite.when.subtitle ? <p className="sub">{invite.when.subtitle}</p> : null}
            <div className="day-row">
              {upcomingDays(21, locale).map((day) => (
                <button key={day.iso} type="button" className={date === day.iso ? "day on" : "day"} onClick={() => setDate(day.iso)}>
                  <small>{day.weekday}</small>
                  {day.num}
                </button>
              ))}
            </div>
            <label className="field when-time">
              <span>{dict.create?.time || "Time"}</span>
              <input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            <button className="btn btn-solid" type="button" onClick={() => continueFrom("when")}>{invite.when.button || dict.common.thisDay}</button>
          </div>
        ) : null}

        {current === "choiceHub" ? (
          <div className="ask scallop enter-up">
            <h2>{dict.common.pickCategories}</h2>
            <p className="sub">{dict.common.pickCategoriesHelp}</p>
            <div className="hub-grid">
              {choices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  className={hubSelected.includes(choice.id) ? "hub-card on" : "hub-card"}
                  onClick={() => toggleHub(choice.id)}
                >
                  <span aria-hidden="true">{choice.emoji || "💛"}</span>
                  <strong>{choice.label || choice.title}</strong>
                  {choice.subtitle ? <small>{choice.subtitle}</small> : null}
                </button>
              ))}
            </div>
            {error ? <p className="form-error">{error}</p> : null}
            <button className="btn btn-solid" type="button" onClick={() => continueFrom("choiceHub")}>{dict.common.continue}</button>
          </div>
        ) : null}

        {choices.map((choice) =>
          current === choice.id ? (
            <div className="ask scallop enter-up" key={choice.id}>
              <p className="eyebrow">{dict.common.thenPick}</p>
              <h2>{choice.title}</h2>
              {choice.subtitle ? <p className="sub">{choice.subtitle}</p> : null}
              <div className="option-grid">
                {choice.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={picks[choice.id] === item.label ? "option on" : "option"}
                    onClick={() => setPicks((prev) => ({ ...prev, [choice.id]: item.label }))}
                  >
                    <span>{item.emoji}</span>
                    {item.label}
                  </button>
                ))}
              </div>
              {error ? <p className="form-error">{error}</p> : null}
              <button
                className="btn btn-solid"
                type="button"
                onClick={() => {
                  if (!picks[choice.id]) {
                    setError(dict.guest.pickChoice);
                    return;
                  }
                  continueFrom("choice");
                }}
              >
                {dict.common.thisOne}
              </button>
            </div>
          ) : null
        )}

        {current === "finale" ? (
          <div className="ask scallop finale enter-up">
            {showHearts || invite.finale.animation !== "none" ? <HeartBurst /> : null}
            <ScreenArt value={invite.finale?.emoji} />
            <p className="eyebrow">{dict.landing.yes}</p>
            <h2>{finaleText}</h2>
            {mode === "preview" && date ? (
              <p className="sub">{formatDateISO(date, locale)}{time ? `, ${time}` : ""}{place ? ` · ${place}` : ""}</p>
            ) : null}
            <p className="finale-wish">{dict.common.finaleWish}</p>
            {error ? (
              <button className="btn btn-solid" type="button" onClick={() => finish()}>{dict.common.tryAgainSave}</button>
            ) : null}
            {error ? <p className="form-error">{error}</p> : null}
          </div>
        ) : null}

        {mode === "preview" && current === "gate" && invite.open.mode !== "timer" ? (
          <button className="skip" type="button" onClick={() => setStep((value) => value + 1)}>{dict.common.skipPreview}</button>
        ) : null}
      </div>
    </div>
  );
}

function Media({ invite, emoji }) {
  const mode = invite.question?.mediaMode || "image";
  const photo = invite.media?.photo || "";
  const voice = invite.media?.voice || "";
  const video = invite.media?.video || "";
  if (mode === "circle" && video) {
    return (
      <div className="media">
        <video className="disc" src={video} autoPlay muted loop playsInline />
      </div>
    );
  }
  if (mode === "voice") {
    return (
      <div className="media">
        <ScreenArt value={emoji} />
        {voice ? <audio src={voice} controls /> : null}
      </div>
    );
  }
  if (photo) {
    const animated = /\.gif$/i.test(photo);
    return (
      <div className="media">
        <img className={animated ? "screen-gif" : "disc spin"} src={photo} alt="" />
        {voice ? <audio src={voice} controls /> : null}
      </div>
    );
  }
  return <ScreenArt value={emoji} />;
}
