import { OCCASIONS, THEMES } from "./catalog";
import { clip } from "./format";

const OPEN = new Set(["now", "timer", "scratch", "envelope", "pin"]);
const NO = new Set(["run", "shrink", "fade"]);
const MEDIA = /^\/uploads\/[a-zA-Z0-9._-]+$/;

function media(url) {
  const value = String(url || "");
  if (!value) return "";
  if (!MEDIA.test(value)) throw new Error("Մեդիայի հղումը վավեր չէ");
  return value;
}

function itemsOf(list) {
  if (!Array.isArray(list)) return [];
  return list
    .slice(0, 8)
    .map((item, index) => ({
      id: clip(item?.id || `item-${index + 1}`, 24) || `item-${index + 1}`,
      emoji: clip(item?.emoji || "💛", 8) || "💛",
      label: clip(item?.label, 40)
    }))
    .filter((item) => item.label);
}

export function validateStep(draft, step) {
  if (step === 0) {
    if (!draft.recipientName?.trim()) return "Գրիր նրա անունը";
    if (!OCCASIONS.some((item) => item.id === draft.occasion)) return "Ընտրիր առիթը";
  }
  if (step === 1) {
    if (!OPEN.has(draft.open?.mode)) return "Ընտրիր բացման ձևը";
    if (draft.open.mode === "pin" && !/^\d{4}$/.test(draft.open.pin || "")) return "Կոդը պետք է լինի 4 թիվ";
    if (draft.open.mode === "pin" && !draft.open.pinQuestion?.trim()) return "Գրիր կոդի հարցը";
    if (draft.open.mode === "timer") {
      const hasAt = draft.open.schedule !== "in" && draft.open.openAt;
      const hasIn = draft.open.schedule === "in" && Number(draft.open.delayMinutes) > 0;
      if (!hasAt && !hasIn) return "Ընտրիր բացման ժամը";
    }
  }
  if (step === 2) {
    if (!draft.question?.title?.trim()) return "Գրիր հարցի վերնագիրը";
    if (!draft.question?.yes?.trim()) return "Գրիր «այո» կոճակի տեքստը";
    if (!NO.has(draft.question?.noMode)) return "Ընտրիր «ոչ» կոճակի վարքը";
  }
  if (step === 3 && draft.when?.mode === "creator") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.when.date || "")) return "Ընտրիր օրը";
    if (!/^\d{2}:\d{2}$/.test(draft.when.time || "")) return "Ընտրիր ժամը";
  }
  if (step === 4) {
    const enabled = (draft.choices || []).filter((choice) => choice.enabled);
    for (const choice of enabled) {
      if (!choice.title?.trim()) return "Գրիր ընտրության վերնագիրը";
      if (itemsOf(choice.items).length < 2) return "Յուրաքանչյուր ընտրության մեջ թող առնվազն երկու տարբերակ";
    }
  }
  if (step === 5 && !draft.finale?.title?.trim()) return "Գրիր եզրափակիչ տեքստը";
  if (step === 6) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email || "")) return "Գրիր էլ. փոստը, որպեսզի կտրոնը տեղ հասնի";
    const tg = String(draft.telegram || "").replace(/^@/, "");
    if (tg && !/^[a-zA-Z0-9_]{5,32}$/.test(tg)) return "Telegram-ի անունը պետք է լինի 5–32 նշան. լատինատառ, թիվ կամ _";
  }
  return "";
}

export function cleanContent(draft) {
  for (let step = 0; step <= 6; step += 1) {
    const message = validateStep(draft, step);
    if (message) throw new Error(message);
  }
  const theme = THEMES.some((item) => item.id === draft.theme) ? draft.theme : "rose";
  let openAt = null;
  if (draft.open.mode === "timer") {
    if (draft.open.schedule === "in") {
      const minutes = Math.min(Math.max(Number(draft.open.delayMinutes) || 0, 1), 60 * 24 * 30);
      openAt = Date.now() + minutes * 60 * 1000;
    } else {
      const parsed = new Date(draft.open.openAt).getTime();
      if (!Number.isFinite(parsed)) throw new Error("Բացման ժամը վավեր չէ");
      openAt = parsed;
    }
  }
  const times = (draft.when.times || [])
    .map((time) => clip(time, 5))
    .filter((time) => /^\d{2}:\d{2}$/.test(time))
    .slice(0, 8);
  return {
    audience: draft.audience === "him" ? "him" : "her",
    occasion: draft.occasion,
    recipientName: clip(draft.recipientName, 40),
    senderName: clip(draft.senderName, 40),
    theme,
    open: {
      mode: draft.open.mode,
      openAt,
      scratchColor: /^#[0-9a-fA-F]{6}$/.test(draft.open.scratchColor || "") ? draft.open.scratchColor : "#F7A8C4",
      scratchText: clip(draft.open.scratchText, 40) || "Ջնջիր ինձ",
      envelopeHint: clip(draft.open.envelopeHint, 40) || "Սեղմիր ծրարը",
      pin: draft.open.mode === "pin" ? draft.open.pin : "",
      pinQuestion: clip(draft.open.pinQuestion, 80),
      beforeText: clip(draft.open.beforeText, 160)
    },
    question: {
      title: clip(draft.question.title, 120),
      subtitle: clip(draft.question.subtitle, 160),
      yes: clip(draft.question.yes, 24) || "Այո",
      no: clip(draft.question.no, 24) || "Ոչ",
      noMode: draft.question.noMode
    },
    when: {
      mode: draft.when.mode === "creator" ? "creator" : "recipient",
      title: clip(draft.when.title, 120),
      subtitle: clip(draft.when.subtitle, 160),
      date: draft.when.mode === "creator" ? draft.when.date : "",
      time: draft.when.mode === "creator" ? draft.when.time : "",
      times: times.length ? times : ["14:00", "17:00", "19:30", "21:00"]
    },
    choices: (draft.choices || [])
      .filter((choice) => choice.enabled)
      .slice(0, 4)
      .map((choice, index) => ({
        id: clip(choice.id || `choice-${index + 1}`, 24),
        title: clip(choice.title, 80),
        subtitle: clip(choice.subtitle, 120),
        items: itemsOf(choice.items).slice(0, 8)
      })),
    finale: {
      title: clip(draft.finale.title, 400),
      animation: draft.finale.animation === "none" ? "none" : "hearts"
    },
    media: {
      photo: media(draft.media?.photo),
      voice: media(draft.media?.voice),
      video: media(draft.media?.video)
    },
    telegram: clip(String(draft.telegram || "").replace(/^@/, ""), 32),
    email: clip(draft.email, 80)
  };
}
