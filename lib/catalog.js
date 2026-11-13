import { getDict, normalizeLocale } from "@/lib/i18n";

export const PRICE = 1900;
export const EDIT_PRICE = 400;
export const EXTEND_PLANS = [
  { days: 30, price: 1500, edits: 1, key: "30" },
  { days: 90, price: 3400, edits: 2, key: "90" },
  { days: 365, price: 5900, edits: 4, key: "365" }
];

export const THEMES = [
  { id: "rose", bg: "#FFF5F8", accent: "#F85589", ink: "#8A4F63", soft: "#FFE8EF" },
  { id: "yerevan", bg: "#FFF6F0", accent: "#E07A3D", ink: "#9A5A3A", soft: "#FFE8D6" },
  { id: "sevan", bg: "#F4F9FC", accent: "#3C7CA8", ink: "#3F5F78", soft: "#E3F1FA" },
  { id: "grape", bg: "#F7F4FB", accent: "#7A4E9B", ink: "#6A4A7A", soft: "#EFE6F6" },
  { id: "spring", bg: "#F4FBF7", accent: "#2F9E6B", ink: "#3F6A55", soft: "#E3F6EC" }
];

export function themeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

export const OCCASION_IDS = ["date", "birthday", "march8", "anniversary", "miss", "apology"];
export const OPEN_MODE_IDS = ["now", "pin", "scratch", "envelope", "timer"];
export const YES_MODE_IDS = ["burst", "none"];
export const NO_MODE_IDS = ["run", "shrink", "none"];
export const DELAY_MINUTES = [1, 5, 10, 15, 30, 60, 120];
export const SCRATCH_COLORS = ["#F7A8C4", "#C9B6F0", "#A8D4F7", "#A8E6CF", "#FFD6A5", "#FFADB8"];
export const MEDIA_PRESETS = [
  { id: "cat-love", src: "/presets/cat-love.png" },
  { id: "heart-pulse", src: "/presets/heart-pulse.png" },
  { id: "hearts-rise", src: "/presets/hearts-rise.png" },
  { id: "love-bloom", src: "/presets/love-bloom.png" },
  { id: "kiss-marks", src: "/presets/kiss-marks.png" },
  { id: "blossom-heart", src: "/presets/blossom-heart.png" }
];
export const WIZARD_STEPS = 8;

export function isPresetSrc(value) {
  return /^\/presets\/[a-z0-9._-]+\.(gif|webp|png|jpe?g)$/i.test(String(value || ""));
}

export function occasionPreset(locale, occasionId) {
  const dict = getDict(locale);
  return dict.occasions[occasionId] || dict.occasions.date;
}

function mapRows(rows) {
  return rows.map(([id, emoji, label]) => ({ id, emoji, label }));
}

export function choiceCatalog(locale = "hy") {
  const lang = normalizeLocale(locale);
  const isRu = lang === "ru";
  const isEn = lang === "en";
  return {
    food: {
      id: "food",
      emoji: "🍽️",
      label: isEn ? "Dishes" : isRu ? "Блюда" : "Ուտելիք",
      title: isEn ? "What do you want?" : isRu ? "Что ты хочешь?" : "Ի՞նչ ես ուզում",
      subtitle: isEn ? "Pick what you like" : isRu ? "Выбери что тебе в кайф" : "Ընտրիր ինչը հաճույք է",
      items: mapRows(
        isEn
          ? [["pizza", "🍕", "Pizza"], ["sushi", "🍣", "Sushi"], ["burger", "🍔", "Burger"], ["pasta", "🍝", "Pasta"], ["rollton", "🍜", "Instant noodles"], ["ramen", "🥣", "Ramen"]]
          : isRu
            ? [["pizza", "🍕", "Пицца"], ["sushi", "🍣", "Суши"], ["burger", "🍔", "Бургер"], ["pasta", "🍝", "Паста"], ["rollton", "🍜", "Ролтон"], ["ramen", "🥣", "Рамен"]]
            : [["pizza", "🍕", "Պիցցա"], ["sushi", "🍣", "Սուշի"], ["burger", "🍔", "Բուրգեր"], ["pasta", "🍝", "Պաստա"], ["rollton", "🍜", "Ռոլտոն"], ["ramen", "🥣", "Ռամեն"]]
      )
    },
    cinema: {
      id: "cinema",
      emoji: "🎬",
      label: isEn ? "Cinema" : isRu ? "Кино" : "Կինո",
      title: isEn ? "What shall we watch?" : isRu ? "Что посмотрим?" : "Ի՞նչ նայենք",
      subtitle: isEn ? "Pick the mood" : isRu ? "Выбери настроение" : "Ընտրիր տրամադրությունը",
      items: mapRows(
        isEn
          ? [["comedy", "😂", "Comedy"], ["romance", "💌", "Romance"], ["action", "💥", "Action"], ["cartoon", "🧸", "Animation"], ["horror", "👻", "Horror"], ["drama", "🎭", "Drama"]]
          : isRu
            ? [["comedy", "😂", "Комедия"], ["romance", "💌", "Романтика"], ["action", "💥", "Боевик"], ["cartoon", "🧸", "Мультфильм"], ["horror", "👻", "Ужасы"], ["drama", "🎭", "Драма"]]
            : [["comedy", "😂", "Կատակերգություն"], ["romance", "💌", "Ռոմանտիկ"], ["action", "💥", "Էքշն"], ["cartoon", "🧸", "Մուլտֆիլմ"], ["horror", "👻", "Սարսափ"], ["drama", "🎭", "Դրամա"]]
      )
    },
    activities: {
      id: "activities",
      emoji: "✨",
      label: isEn ? "Activities" : isRu ? "Активности" : "Զբաղմունք",
      title: isEn ? "What shall we do?" : isRu ? "Чем займёмся?" : "Ի՞նչ անենք",
      subtitle: isEn ? "Pick an activity" : isRu ? "Выбери занятие" : "Ընտրիր զբաղմունքը",
      items: mapRows(
        isEn
          ? [["walk", "🚶", "Walk"], ["game", "🎲", "Games"], ["karaoke", "🎤", "Karaoke"], ["dance", "💃", "Dance"], ["sport", "⚽", "Sport"], ["photo", "📷", "Photos"]]
          : isRu
            ? [["walk", "🚶", "Прогулка"], ["game", "🎲", "Игры"], ["karaoke", "🎤", "Караоке"], ["dance", "💃", "Танцы"], ["sport", "⚽", "Спорт"], ["photo", "📷", "Фото"]]
            : [["walk", "🚶", "Զբոսանք"], ["game", "🎲", "Խաղեր"], ["karaoke", "🎤", "Կարաոկե"], ["dance", "💃", "Պար"], ["sport", "⚽", "Սպորտ"], ["photo", "📷", "Լուսանկար"]]
      )
    },
    drinks: {
      id: "drinks",
      emoji: "☕",
      label: isEn ? "Drinks" : isRu ? "Напитки" : "Խմիչք",
      title: isEn ? "What shall we drink?" : isRu ? "Что будем пить?" : "Ի՞նչ խմենք",
      subtitle: isEn ? "Pick a drink" : isRu ? "Выбери напиток" : "Ընտրիր խմիչքը",
      items: mapRows(
        isEn
          ? [["coffee", "☕", "Coffee"], ["tea", "🍵", "Tea"], ["wine", "🍷", "Wine"], ["cocoa", "🍫", "Cocoa"], ["juice", "🧃", "Juice"], ["smoothie", "🥤", "Smoothie"]]
          : isRu
            ? [["coffee", "☕", "Кофе"], ["tea", "🍵", "Чай"], ["wine", "🍷", "Вино"], ["cocoa", "🍫", "Какао"], ["juice", "🧃", "Сок"], ["smoothie", "🥤", "Смузи"]]
            : [["coffee", "☕", "Սուրճ"], ["tea", "🍵", "Թեյ"], ["wine", "🍷", "Գինի"], ["cocoa", "🍫", "Կակաո"], ["juice", "🧃", "Հյութ"], ["smoothie", "🥤", "Սմուզի"]]
      )
    },
    places: {
      id: "places",
      emoji: "📍",
      label: isEn ? "Places" : isRu ? "Места" : "Վայրեր",
      title: isEn ? "Where shall we go?" : isRu ? "Куда пойдём?" : "Ո՞ւր գնանք",
      subtitle: isEn ? "Pick a place" : isRu ? "Выбери место" : "Ընտրիր վայրը",
      items: mapRows(
        isEn
          ? [["park", "🌳", "Park"], ["cafe", "☕", "Café"], ["home", "🏠", "Home"], ["rooftop", "🏙️", "Rooftop"], ["beach", "🏖️", "Beach"], ["museum", "🖼️", "Museum"]]
          : isRu
            ? [["park", "🌳", "Парк"], ["cafe", "☕", "Кафе"], ["home", "🏠", "Дома"], ["rooftop", "🏙️", "Крыша"], ["beach", "🏖️", "Пляж"], ["museum", "🖼️", "Музей"]]
            : [["park", "🌳", "Պուրակ"], ["cafe", "☕", "Սրճարան"], ["home", "🏠", "Տանը"], ["rooftop", "🏙️", "Տանիք"], ["beach", "🏖️", "Լողափ"], ["museum", "🖼️", "Թանգարան"]]
      )
    }
  };
}

export function defaultChoices(locale = "hy") {
  const catalog = choiceCatalog(locale);
  return [
    { ...catalog.food, enabled: true },
    { ...catalog.places, enabled: false },
    { ...catalog.drinks, enabled: false },
    { ...catalog.activities, enabled: false },
    { ...catalog.cinema, enabled: false }
  ];
}

export function blankDraft(audience = "her", occasion = "", locale = "hy") {
  const lang = normalizeLocale(locale);
  const dict = getDict(lang);
  const presetKey = OCCASION_IDS.includes(occasion) ? occasion : "date";
  const preset = occasionPreset(lang, presetKey);
  const openDefaults = isOpenDefaults(lang);
  const confirmDefaults = isConfirmDefaults(lang, audience);
  const occasionLabel = OCCASION_IDS.includes(occasion)
    ? dict.occasions[occasion].label
    : String(occasion || "").trim() || dict.occasions.date.label;
  return {
    audience: audience === "him" ? "him" : "her",
    occasion: occasionLabel,
    locale: lang,
    recipientName: "",
    senderName: "",
    theme: audience === "him" ? "sevan" : "rose",
    open: {
      mode: "now",
      schedule: "at",
      openAt: "",
      delayMinutes: 60,
      timezone: "Asia/Yerevan",
      scratchColor: "#F7A8C4",
      scratchText: openDefaults.scratch,
      envelopeHint: openDefaults.envelope,
      pin: "1402",
      pinQuestion: openDefaults.pinQ,
      beforeText: openDefaults.before,
      readyText: openDefaults.ready,
      gateEmoji: MEDIA_PRESETS[0].src
    },
    question: {
      title: preset.question,
      subtitle: preset.qsub,
      yes: dict.landing.yes,
      no: dict.landing.no,
      yesMode: "burst",
      noMode: "run",
      mediaMode: "image",
      emoji: MEDIA_PRESETS[0].src
    },
    confirm: {
      title: confirmDefaults.title,
      subtitle: confirmDefaults.subtitle,
      button: confirmDefaults.button,
      emoji: MEDIA_PRESETS[1].src
    },
    when: {
      mode: "recipient",
      title: preset.whenTitle,
      subtitle: preset.whenSub,
      button: confirmDefaults.whenButton,
      date: "",
      time: "19:30",
      times: ["14:00", "17:00", "19:30", "21:00"],
      emoji: MEDIA_PRESETS[2].src
    },
    choiceMode: "one",
    choices: defaultChoices(lang),
    finale: {
      title: preset.finale,
      animation: "hearts",
      emoji: MEDIA_PRESETS[3].src
    },
    media: { photo: "", voice: "", video: "" },
    telegram: "",
    email: "",
    method: "free"
  };
}

function isOpenDefaults(locale) {
  if (locale === "en") {
    return {
      scratch: "Scratch me",
      envelope: "Tap the envelope",
      pinQ: "The day we met",
      before: "Soon you’ll see something special…",
      ready: "It’s time!"
    };
  }
  if (locale === "ru") {
    return {
      scratch: "Сотри меня",
      envelope: "Нажми на конверт",
      pinQ: "День нашего знакомства",
      before: "Скоро ты увидишь кое-что особенное…",
      ready: "Время пришло!"
    };
  }
  return {
    scratch: "Ջնջիր ինձ",
    envelope: "Սեղմիր ծրարը",
    pinQ: "Մեր ծանոթության օրը",
    before: "Շուտով կտեսնես մի յուրահատուկ բան…",
    ready: "Ժամանակն է։"
  };
}

function isConfirmDefaults(locale, audience) {
  const her = audience !== "him";
  if (locale === "en") {
    return {
      title: her ? "Wait — did you really say yes?" : "Wait — did you really say yes?",
      subtitle: "",
      button: "Yes Yes yes",
      whenButton: "Pick a date 💕"
    };
  }
  if (locale === "ru") {
    return {
      title: her ? "Подожди, ты действительно сказала да?" : "Подожди, ты действительно сказал да?",
      subtitle: "",
      button: "Да Да да",
      whenButton: "Выбери дату 💕"
    };
  }
  return {
    title: her ? "Սպասիր, դու իսկապե՞ս ասացիր այո" : "Սպասիր, դու իսկապե՞ս ասացիր այո",
    subtitle: "",
    button: "Այո Այո այո",
    whenButton: "Ընտրիր օրը 💕"
  };
}

export function applyOccasion(draft, occasionId, locale = draft.locale || "hy") {
  const preset = occasionPreset(locale, occasionId);
  return {
    ...draft,
    occasion: occasionId,
    question: { ...draft.question, title: preset.question, subtitle: preset.qsub },
    when: { ...draft.when, title: preset.whenTitle, subtitle: preset.whenSub },
    finale: { ...draft.finale, title: preset.finale }
  };
}

export function sampleInvite(locale = "hy") {
  const dict = getDict(locale);
  const draft = blankDraft("her", "date", locale);
  return {
    id: "sample",
    audience: "her",
    locale: normalizeLocale(locale),
    theme: "rose",
    recipientName: locale === "en" ? "Ani" : locale === "ru" ? "Ани" : "Անի",
    senderName: locale === "en" ? "Narek" : locale === "ru" ? "Нарек" : "Նարեկ",
    open: { ...draft.open, mode: "envelope" },
    question: {
      title: dict.landing.sampleQ,
      subtitle: dict.landing.sampleSub,
      yes: dict.landing.yes,
      no: dict.landing.no,
      yesMode: "burst",
      noMode: "run",
      mediaMode: "image",
      emoji: MEDIA_PRESETS[0].src
    },
    confirm: draft.confirm,
    when: draft.when,
    choices: [
      {
        id: "places",
        enabled: true,
        title: draft.choices.find((c) => c.id === "places")?.title || draft.choices[0].title,
        subtitle: draft.choices.find((c) => c.id === "places")?.subtitle || draft.choices[0].subtitle,
        items: (draft.choices.find((c) => c.id === "places") || draft.choices[0]).items.slice(0, 6)
      }
    ],
    finale: draft.finale,
    media: { photo: "", voice: "", video: "" },
    state: { answered: false }
  };
}

export const DATE_IDEAS = [
  {
    id: "yerevan",
    title: "Երևանում",
    items: [
      { title: "Կասկադ և սուրճ", text: "Իջեք աստիճաններով, նստեք վերևի տեսարանի մոտ, հետո իջեք Սարյան կամ Թումանյան՝ մի բաժակ սուրճի։" },
      { title: "Կոնդի երեկո", text: "Զբոսանք նեղ փողոցներով, հետո ընթրիք հին թաղամասի մոտակայքում։" },
      { title: "Օպերա և հրապարակ", text: "Կարճ ներկայացում կամ երեկոյան հրապարակը, շատրվանները և երկար զրույց։" }
    ]
  },
  {
    id: "out",
    title: "Քաղաքից դուրս",
    items: [
      { title: "Սևան", text: "Առավոտյան ճանապարհ, ձուկ կամ պարզապես ափ։" },
      { title: "Գառնի և Գեղարդ", text: "Կեսօրյա զբոսանք, տաճար և ձոր։" }
    ]
  },
  {
    id: "home",
    title: "Տանը",
    items: [
      { title: "Ֆիլմ և թեյ", text: "Հանգիստ երեկո տանը։" },
      { title: "Խաղ և գինի", text: "Քարտեր, նարդի կամ կարճ խաղ։" }
    ]
  }
];
