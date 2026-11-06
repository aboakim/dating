"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { themeById } from "@/lib/catalog";
import { fillTemplate, formatDateISO, upcomingDays } from "@/lib/format";

function HeartBurst() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        id: index,
        left: 8 + ((index * 37) % 84),
        delay: (index % 6) * 0.08,
        duration: 1.5 + (index % 4) * 0.25
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
    const paint = () => {
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#fff";
      ctx.font = "700 28px 'Noto Sans Armenian', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text || "Ջնջիր ինձ", width / 2, height / 2);
    };
    paint();

    let drawing = false;
    const point = (event) => {
      const rect = canvas.getBoundingClientRect();
      const source = event.touches ? event.touches[0] : event;
      return {
        x: ((source.clientX - rect.left) * canvas.width) / rect.width,
        y: ((source.clientY - rect.top) * canvas.height) / rect.height
      };
    };
    const scratch = (event) => {
      if (!drawing || done.current) return;
      const ctx = canvas.getContext("2d");
      const { x, y } = point(event);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, Math.PI * 2);
      ctx.fill();
    };
    const check = () => {
      if (done.current) return;
      const ctx = canvas.getContext("2d");
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0;
      const total = data.length / 4;
      for (let i = 3; i < data.length; i += 16) if (data[i] < 40) clear += 1;
      if (clear / (total / 4) > 0.45) {
        done.current = true;
        onDoneRef.current();
      }
    };
    const down = (event) => {
      drawing = true;
      scratch(event);
    };
    const up = () => {
      drawing = false;
      check();
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", scratch);
    window.addEventListener("pointerup", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", scratch);
      window.removeEventListener("pointerup", up);
    };
  }, [color, text]);

  return <canvas ref={ref} className="scratch" />;
}

function Countdown({ openAt, beforeText, onDone }) {
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
      <p>{beforeText || "Շուտով կտեսնես մի յուրահատուկ բան…"}</p>
      {left > 0 ? (
        <div className="clock" aria-live="polite">
          <b>{String(hours).padStart(2, "0")}</b>
          <span>ժ</span>
          <b>{String(minutes).padStart(2, "0")}</b>
          <span>ր</span>
          <b>{String(seconds).padStart(2, "0")}</b>
          <span>վ</span>
        </div>
      ) : (
        <button className="btn btn-solid" type="button" onClick={onDone}>
          Բացել հրավերը
        </button>
      )}
    </div>
  );
}

export default function InviteExperience({ invite, mode = "live", onEvent }) {
  const theme = themeById(invite.theme);
  const steps = useMemo(() => {
    const list = [];
    if (invite.open.mode !== "now") list.push("gate");
    list.push("ask");
    if (invite.when.mode === "recipient") list.push("when");
    for (const choice of invite.choices || []) list.push(choice.id);
    list.push("finale");
    return list;
  }, [invite]);

  const [step, setStep] = useState(0);
  const [unlocked, setUnlocked] = useState(invite.open.mode !== "pin");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [runPos, setRunPos] = useState(null);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [date, setDate] = useState(invite.when.mode === "creator" ? invite.when.date : "");
  const [time, setTime] = useState(invite.when.mode === "creator" ? invite.when.time : "");
  const [picks, setPicks] = useState({});
  const [error, setError] = useState("");
  const [showHearts, setShowHearts] = useState(false);
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
    }
  }, [invite.state, steps.length]);

  const current = steps[step];
  const place = Object.values(picks).filter(Boolean).join(", ");
  const finaleText = fillTemplate(invite.finale.title, {
    date,
    time,
    place,
    name: invite.recipientName
  });

  function evade(event) {
    setAttempts((count) => count + 1);
    if (invite.question.noMode === "shrink") {
      setScale((value) => Math.max(0.2, value * 0.72));
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
      else setPinError("Կոդը սխալ է");
      return;
    }
    const response = await fetch(`/api/invites/${invite.id}/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "unlock", pin })
    });
    if (response.ok) setUnlocked(true);
    else setPinError("Կոդը սխալ է");
  }

  async function goNext() {
    if (steps[step + 1] === "finale") await finish();
    else setStep((value) => value + 1);
  }

  async function sayYes() {
    setShowHearts(invite.finale.animation !== "none");
    await goNext();
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
        setError("Չհաջողվեց պահել պատասխանը։ Փորձիր էլի։");
        return;
      }
    }
    setStep(steps.length - 1);
  }

  async function continueFrom(kind) {
    if (kind === "when" && (!date || !time)) {
      setError("Ընտրիր օրը և ժամը");
      return;
    }
    setError("");
    if (steps[step + 1] === "finale") await finish();
    else setStep((value) => value + 1);
  }

  return (
    <div className="invite" style={{ background: theme.bg, color: theme.ink, "--accent": theme.accent, "--soft": theme.soft }}>
      <div className="stage" ref={stageRef}>
        {showHearts && current !== "ask" ? <HeartBurst /> : null}
        {current === "gate" && invite.open.mode === "timer" ? (
          <Countdown openAt={invite.open.openAt} beforeText={invite.open.beforeText} onDone={() => setStep(1)} />
        ) : null}
        {current === "gate" && invite.open.mode === "scratch" ? (
          <div className="scratch-wrap">
            <p className="gate-under">{invite.open.beforeText}</p>
            <ScratchCard color={invite.open.scratchColor} text={invite.open.scratchText} onDone={() => setStep(1)} />
          </div>
        ) : null}
        {current === "gate" && invite.open.mode === "envelope" ? (
          <button className="envelope" type="button" onClick={() => setStep(1)}>
            <span className="flap" />
            <span className="letter">{invite.open.envelopeHint || "Սեղմիր ծրարը"}</span>
          </button>
        ) : null}
        {current === "gate" && invite.open.mode === "pin" && !unlocked ? (
          <form className="gate-card" onSubmit={submitPin}>
            <p>{invite.open.pinQuestion || "Գրիր կոդը"}</p>
            <input className="pin" inputMode="numeric" maxLength={4} value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))} aria-label="Կոդ" />
            {pinError ? <p className="form-error">{pinError}</p> : null}
            <button className="btn btn-solid" type="submit">Բացել</button>
          </form>
        ) : null}
        {current === "gate" && invite.open.mode === "pin" && unlocked ? (
          <div className="gate-card">
            <p>Ճիշտ է</p>
            <button className="btn btn-solid" type="button" onClick={() => setStep(1)}>Շարունակել</button>
          </div>
        ) : null}

        {current === "ask" ? (
          <div className="ask">
            <Media invite={invite} />
            <p className="eyebrow">{invite.senderName ? `${invite.senderName}ից` : "Քեզ համար"}</p>
            <h2>{invite.question.title}</h2>
            {invite.question.subtitle ? <p className="sub">{invite.question.subtitle}</p> : null}
            <div className="ask-actions">
              <button className="btn btn-solid" type="button" onClick={sayYes}>{invite.question.yes || "Այո"}</button>
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
                {invite.question.no || "Ոչ"}
              </button>
            </div>
            {attempts > 2 ? <p className="hint">Էլի՞ փորձում ես</p> : null}
            {error ? <p className="form-error">{error}</p> : null}
          </div>
        ) : null}

        {current === "when" ? (
          <div className="ask">
            <h2>{invite.when.title || "Ե՞րբ ես ազատ"}</h2>
            {invite.when.subtitle ? <p className="sub">{invite.when.subtitle}</p> : null}
            <div className="day-row">
              {upcomingDays(21).map((day) => (
                <button key={day.iso} type="button" className={date === day.iso ? "day on" : "day"} onClick={() => setDate(day.iso)}>
                  <small>{day.weekday}</small>
                  {day.num}
                </button>
              ))}
            </div>
            <div className="chips">
              {(invite.when.times || []).map((slot) => (
                <button key={slot} type="button" className={time === slot ? "chip on" : "chip"} onClick={() => setTime(slot)}>
                  {slot}
                </button>
              ))}
            </div>
            {error ? <p className="form-error">{error}</p> : null}
            <button className="btn btn-solid" type="button" onClick={() => continueFrom("when")}>Այս օրը</button>
          </div>
        ) : null}

        {(invite.choices || []).map((choice) =>
          current === choice.id ? (
            <div className="ask" key={choice.id}>
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
                    setError("Ընտրիր տարբերակը");
                    return;
                  }
                  continueFrom("choice");
                }}
              >
                Այս մեկը
              </button>
            </div>
          ) : null
        )}

        {current === "finale" ? (
          <div className="ask finale">
            {showHearts || invite.finale.animation !== "none" ? <HeartBurst /> : null}
            <p className="eyebrow">Այո</p>
            <h2>{finaleText}</h2>
            {date ? <p className="sub">{formatDateISO(date)}{time ? `, ${time}` : ""}{place ? ` · ${place}` : ""}</p> : null}
            {error ? (
              <button className="btn btn-solid" type="button" onClick={() => finish()}>Փորձել պահել էլի</button>
            ) : null}
            {error ? <p className="form-error">{error}</p> : null}
          </div>
        ) : null}

        {mode === "preview" && current === "gate" ? (
          <button className="skip" type="button" onClick={() => setStep(1)}>Բացել հիմա, միայն դիտման մեջ</button>
        ) : null}
      </div>
    </div>
  );
}

function Media({ invite }) {
  if (!invite.media?.photo && !invite.media?.voice && !invite.media?.video) return null;
  return (
    <div className="media">
      {invite.media.video ? <video className="disc" src={invite.media.video} autoPlay muted loop playsInline /> : null}
      {!invite.media.video && invite.media.photo ? <img className="disc spin" src={invite.media.photo} alt="" /> : null}
      {invite.media.voice ? <audio src={invite.media.voice} controls /> : null}
    </div>
  );
}
