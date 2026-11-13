import { THEMES, WIZARD_STEPS, isPresetSrc } from "./catalog";
import { clip } from "./format";
import { getDict, normalizeLocale } from "./i18n";

const OPEN = new Set(["now", "timer", "scratch", "envelope", "pin"]);
const YES = new Set(["burst", "none"]);
const NO = new Set(["run", "shrink", "none", "fade"]);
const MEDIA = /^\/uploads\/[a-zA-Z0-9._-]+$/;

function media(url) {
  const value = String(url || "");
  if (!value) return "";
  if (!MEDIA.test(value)) throw new Error("Invalid media URL");
  return value;
}

function art(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (isPresetSrc(raw)) return raw;
  if (MEDIA.test(raw)) return raw;
  return clip(raw, 12);
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

function messages(locale) {
  const lang = normalizeLocale(locale);
  if (lang === "en") {
    return {
      name: "Enter their name",
      open: "Pick how it opens",
      pin: "Code must be 4 digits",
      pinQ: "Enter the code question",
      timer: "Pick when it opens",
      qTitle: "Enter the question title",
      yes: "Enter the Yes button text",
      noMode: "Pick the No button behavior",
      confirm: "Enter the confirmation title",
      date: "Pick a date",
      time: "Pick a time",
      choiceTitle: "Enter the choice title",
      choiceItems: "Each choice needs at least two options",
      finale: "Enter the finale text",
      email: "Enter an email",
      telegram: "Telegram username must be 5–32 characters: letters, numbers or _"
    };
  }
  if (lang === "ru") {
    return {
      name: "Введи имя",
      open: "Выбери способ открытия",
      pin: "Код должен быть из 4 цифр",
      pinQ: "Введи вопрос к коду",
      timer: "Выбери время открытия",
      qTitle: "Введи заголовок вопроса",
      yes: "Введи текст кнопки «Да»",
      noMode: "Выбери поведение «Нет»",
      confirm: "Введи заголовок подтверждения",
      date: "Выбери дату",
      time: "Выбери время",
      choiceTitle: "Введи заголовок выбора",
      choiceItems: "В каждом выборе нужно минимум два варианта",
      finale: "Введи финальный текст",
      email: "Укажи почту",
      telegram: "Telegram-ник: 5–32 символа, латиница, цифры или _"
    };
  }
  return {
    name: "Գրիր նրա անունը",
    open: "Ընտրիր բացման ձևը",
    pin: "Կոդը պետք է լինի 4 թիվ",
    pinQ: "Գրիր կոդի հարցը",
    timer: "Ընտրիր բացման ժամը",
    qTitle: "Գրիր հարցի վերնագիրը",
    yes: "Գրիր «այո» կոճակի տեքստը",
    noMode: "Ընտրիր «ոչ» կոճակի վարքը",
    confirm: "Գրիր հաստատման վերնագիրը",
    date: "Ընտրիր օրը",
    time: "Ընտրիր ժամը",
    choiceTitle: "Գրիր ընտրության վերնագիրը",
    choiceItems: "Յուրաքանչյուր ընտրության մեջ թող առնվազն երկու տարբերակ",
    finale: "Գրիր եզրափակիչ տեքստը",
    email: "Գրիր էլ. փոստը",
    telegram: "Telegram-ի անունը պետք է լինի 5–32 նշան. լատինատառ, թիվ կամ _"
  };
}

export function validateStep(draft, step) {
  const msg = messages(draft?.locale);
  if (step === 0) {
    if (!draft.recipientName?.trim()) return msg.name;
  }
  if (step === 1) {
    if (!OPEN.has(draft.open?.mode)) return msg.open;
    if (draft.open.mode === "pin" && !/^\d{4}$/.test(draft.open.pin || "")) return msg.pin;
    if (draft.open.mode === "pin" && !draft.open.pinQuestion?.trim()) return msg.pinQ;
    if (draft.open.mode === "timer") {
      const hasAt = draft.open.schedule !== "in" && draft.open.openAt;
      const hasIn = draft.open.schedule === "in" && Number(draft.open.delayMinutes) > 0;
      if (!hasAt && !hasIn) return msg.timer;
    }
  }
  if (step === 2) {
    if (!draft.question?.title?.trim()) return msg.qTitle;
    if (!draft.question?.yes?.trim()) return msg.yes;
    if (!NO.has(draft.question?.noMode || "run")) return msg.noMode;
  }
  if (step === 3) {
    if (!draft.confirm?.title?.trim()) return msg.confirm;
  }
  if (step === 4 && draft.when?.mode === "creator") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.when.date || "")) return msg.date;
    if (!/^\d{2}:\d{2}$/.test(draft.when.time || "")) return msg.time;
  }
  if (step === 5) {
    const enabled = (draft.choices || []).filter((choice) => choice.enabled);
    if (!enabled.length) return msg.choiceItems;
    for (const choice of enabled) {
      if (!choice.title?.trim()) return msg.choiceTitle;
      if (itemsOf(choice.items).length < 2) return msg.choiceItems;
    }
  }
  if (step === 6 && !draft.finale?.title?.trim()) return msg.finale;
  if (step === 7) {
    if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email || "")) return msg.email;
    const tg = String(draft.telegram || "").replace(/^@/, "");
    if (!tg || !/^[a-zA-Z0-9_]{5,32}$/.test(tg)) return msg.telegram;
  }
  return "";
}

export function cleanContent(draft) {
  for (let step = 0; step < WIZARD_STEPS; step += 1) {
    const message = validateStep(draft, step);
    if (message) throw new Error(message);
  }
  const theme = THEMES.some((item) => item.id === draft.theme) ? draft.theme : "rose";
  const locale = normalizeLocale(draft.locale);
  const dict = getDict(locale);
  let openAt = null;
  if (draft.open.mode === "timer") {
    if (draft.open.schedule === "in") {
      const minutes = Math.min(Math.max(Number(draft.open.delayMinutes) || 0, 1), 60 * 24 * 30);
      openAt = Date.now() + minutes * 60 * 1000;
    } else {
      const parsed = new Date(draft.open.openAt).getTime();
      if (!Number.isFinite(parsed)) throw new Error(messages(locale).timer);
      openAt = parsed;
    }
  }
  const times = (draft.when.times || [])
    .map((time) => clip(time, 5))
    .filter((time) => /^\d{2}:\d{2}$/.test(time))
    .slice(0, 8);
  const enabledChoices = (draft.choices || []).filter((choice) => choice.enabled);
  const choices = (draft.choiceMode === "one" ? enabledChoices.slice(0, 1) : enabledChoices)
    .slice(0, 4)
    .map((choice, index) => ({
      id: clip(choice.id || `choice-${index + 1}`, 24),
      emoji: clip(choice.emoji || "💛", 8) || "💛",
      label: clip(choice.label || choice.title, 40),
      title: clip(choice.title, 80),
      subtitle: clip(choice.subtitle, 120),
      items: itemsOf(choice.items).slice(0, 8)
    }));
  return {
    audience: draft.audience === "him" ? "him" : "her",
    occasion: clip(draft.occasion, 60),
    locale,
    recipientName: clip(draft.recipientName, 40),
    senderName: clip(draft.senderName, 40),
    theme,
    open: {
      mode: draft.open.mode,
      openAt,
      scratchColor: /^#[0-9a-fA-F]{6}$/.test(draft.open.scratchColor || "") ? draft.open.scratchColor : "#F7A8C4",
      scratchText: clip(draft.open.scratchText, 40) || dict.create?.scratchLabel || "Scratch",
      envelopeHint: clip(draft.open.envelopeHint, 40),
      pin: draft.open.mode === "pin" ? draft.open.pin : "",
      pinQuestion: clip(draft.open.pinQuestion, 80),
      beforeText: clip(draft.open.beforeText, 160),
      readyText: clip(draft.open.readyText, 80),
      gateEmoji: art(draft.open.gateEmoji)
    },
    question: {
      title: clip(draft.question.title, 120),
      subtitle: clip(draft.question.subtitle, 160),
      yes: clip(draft.question.yes, 24) || dict.landing.yes,
      no: clip(draft.question.no, 24) || dict.landing.no,
      yesMode: YES.has(draft.question.yesMode) ? draft.question.yesMode : "burst",
      noMode: NO.has(draft.question.noMode) ? draft.question.noMode : "run",
      mediaMode: ["image", "voice", "circle"].includes(draft.question.mediaMode) ? draft.question.mediaMode : "image",
      emoji: art(draft.question.emoji)
    },
    confirm: {
      title: clip(draft.confirm?.title, 160),
      subtitle: clip(draft.confirm?.subtitle, 200),
      button: clip(draft.confirm?.button, 40) || dict.landing.yes,
      emoji: art(draft.confirm?.emoji)
    },
    when: {
      mode: draft.when.mode === "creator" ? "creator" : "recipient",
      title: clip(draft.when.title, 120),
      subtitle: clip(draft.when.subtitle, 160),
      button: clip(draft.when.button, 40),
      date: draft.when.mode === "creator" ? draft.when.date : "",
      time: draft.when.mode === "creator" ? draft.when.time : "",
      times: times.length ? times : ["14:00", "17:00", "19:30", "21:00"],
      emoji: art(draft.when.emoji)
    },
    choices,
    finale: {
      title: clip(draft.finale.title, 400),
      animation: draft.finale.animation === "none" ? "none" : "hearts",
      emoji: art(draft.finale.emoji)
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
