export const PRICE = 1900;
export const EDIT_PRICE = 400;
export const EXTEND_PLANS = [
  { days: 30, price: 1500, edits: 1, label: "30 օր" },
  { days: 90, price: 3400, edits: 2, label: "90 օր" },
  { days: 365, price: 5900, edits: 4, label: "1 տարի" }
];

export const THEMES = [
  { id: "rose", name: "Վարդագույն", bg: "#FFF5F8", accent: "#F85589", ink: "#2D1926", soft: "#FFE8EF" },
  { id: "yerevan", name: "Երևանի երեկո", bg: "#FFF6F0", accent: "#E07A3D", ink: "#2A1812", soft: "#FFE8D6" },
  { id: "sevan", name: "Սևան", bg: "#F4F9FC", accent: "#3C7CA8", ink: "#163044", soft: "#E3F1FA" },
  { id: "grape", name: "Արենի", bg: "#F7F4FB", accent: "#7A4E9B", ink: "#241433", soft: "#EFE6F6" },
  { id: "spring", name: "Գարուն", bg: "#F4FBF7", accent: "#2F9E6B", ink: "#143226", soft: "#E3F6EC" }
];

export function themeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

export const OCCASIONS = [
  {
    id: "date",
    label: "Հանդիպում",
    question: "Կգա՞ս ինձ հետ հանդիպման",
    qsub: "Ունեմ մի ծրագիր, որ ուզում եմ քեզ հետ կիսել",
    whenTitle: "Ե՞րբ ես ազատ",
    whenSub: "Ընտրիր քեզ հարմար օրը և ժամը",
    finale: "{name}, պատրաստ եղիր {date}-ին, ժամը {time}-ին։ Կգամ քեզ հետևից։ {place}"
  },
  {
    id: "birthday",
    label: "Ծննդյան օր",
    question: "Այս տարի տոնդ միասի՞ն նշենք",
    qsub: "Ուզում եմ, որ օրը հենց քոնը լինի",
    whenTitle: "Ո՞ր օրը նշենք",
    whenSub: "Ընտրիր օրը և ժամը",
    finale: "{name}, սպասում եմ քեզ {date}-ին, ժամը {time}-ին։ {place}"
  },
  {
    id: "march8",
    label: "Մարտի 8",
    question: "Մարտի 8-ը միասի՞ն դիմավորենք",
    qsub: "Մի փոքր անակնկալ ունեմ քեզ համար",
    whenTitle: "Ե՞րբ կարող ես",
    whenSub: "Ընտրիր օրը և ժամը",
    finale: "{name}, {date}-ին, ժամը {time}-ին քեզ մոտ կլինեմ։ {place}"
  },
  {
    id: "anniversary",
    label: "Տարեդարձ",
    question: "Մեր օրը նշե՞նք միասին",
    qsub: "Ուզում եմ, որ էլի մերն լինի",
    whenTitle: "Ե՞րբ նշենք",
    whenSub: "Ընտրիր օրը և ժամը",
    finale: "{name}, {date}-ին, ժամը {time}-ին միասին ենք։ {place}"
  },
  {
    id: "miss",
    label: "Կարոտում եմ",
    question: "Կարոտել եմ։ Կտեսնվե՞նք",
    qsub: "Մի երեկո միայն քեզ համար",
    whenTitle: "Ե՞րբ կարող ես",
    whenSub: "Ընտրիր օրը և ժամը",
    finale: "Վերջապես։ {date}-ին, ժամը {time}-ին կտեսնվենք։ {place}"
  },
  {
    id: "apology",
    label: "Ներողություն",
    question: "Կտաս ինձ մի երեկո, որ ներես",
    qsub: "Ուզում եմ ասել այն, ինչ դեմառդեմ պետք է ասվի",
    whenTitle: "Ե՞րբ կարող ենք խոսել",
    whenSub: "Ընտրիր քեզ հարմար ժամը",
    finale: "Շնորհակալ եմ, որ այո ասացիր։ Կսպասեմ {date}-ին, ժամը {time}-ին։ {place}"
  }
];

export const OPEN_MODES = [
  { id: "now", title: "Անմիջապես", text: "Հյուրը միանգամից տեսնում է հարցը" },
  { id: "timer", title: "Ժամաչափ", text: "Կբացվի ընտրված ժամին" },
  { id: "scratch", title: "Ջնջել շերտը", text: "Մատով ջնջում է վերին շերտը" },
  { id: "envelope", title: "Ծրար", text: "Սեղմում է ծրարը, հետո բացվում է" },
  { id: "pin", title: "Թվային կոդ", text: "Հարց և ճիշտ թիվ, օրինակ ծանոթության օրը" }
];

export const NO_MODES = [
  { id: "run", title: "Փախչում է", text: "«Ոչ»-ը փախչում է մատից և կուրսորից" },
  { id: "shrink", title: "Փոքրանում է", text: "Ամեն փորձից փոքրանում է" },
  { id: "fade", title: "Անհետանում է", text: "Մի քանի փորձից վերանում է" }
];

export const DELAYS = [
  { minutes: 1, label: "1 րոպե" },
  { minutes: 5, label: "5 րոպե" },
  { minutes: 10, label: "10 րոպե" },
  { minutes: 15, label: "15 րոպե" },
  { minutes: 30, label: "30 րոպե" },
  { minutes: 60, label: "1 ժամ" },
  { minutes: 120, label: "2 ժամ" }
];

export function defaultChoices() {
  return [
    {
      id: "places",
      enabled: true,
      title: "Ո՞ւր գնանք",
      subtitle: "Ընտրիր, թե ուր ես ուզում",
      items: [
        { id: "cascade", emoji: "🪜", label: "Կասկադ" },
        { id: "republic", emoji: "🏛️", label: "Հանրապետության հրապարակ" },
        { id: "sevan", emoji: "🌊", label: "Սևանա լիճ" },
        { id: "garni", emoji: "⛪", label: "Գառնի և Գեղարդ" },
        { id: "areni", emoji: "🍷", label: "Արենի, գինու համտես" },
        { id: "tsaghkadzor", emoji: "🎿", label: "Ծաղկաձոր" },
        { id: "opera", emoji: "🎭", label: "Օպերայի թատրոն" },
        { id: "tumanyan", emoji: "🌃", label: "Թումանյան փողոց" }
      ]
    },
    {
      id: "food",
      enabled: false,
      title: "Ի՞նչ ուտենք",
      subtitle: "Ընտրիր, թե ինչն է քեզ դուր գալիս",
      items: [
        { id: "khorovats", emoji: "🔥", label: "Խորոված" },
        { id: "khachapuri", emoji: "🧀", label: "Խաչապուրի" },
        { id: "lahmajo", emoji: "🫓", label: "Լահմաջո" },
        { id: "pizza", emoji: "🍕", label: "Պիցցա" },
        { id: "sushi", emoji: "🍣", label: "Սուշի" },
        { id: "gata", emoji: "🍯", label: "Գաթա և սուրճ" }
      ]
    },
    {
      id: "films",
      enabled: false,
      title: "Ի՞նչ նայենք",
      subtitle: "Ընտրիր երեկոյի տրամադրությունը",
      items: [
        { id: "comedy", emoji: "😂", label: "Կատակերգություն" },
        { id: "romance", emoji: "💌", label: "Ռոմանտիկ" },
        { id: "action", emoji: "🎬", label: "Արկածային" },
        { id: "armenian", emoji: "🎞️", label: "Հայկական ֆիլմ" },
        { id: "animation", emoji: "🧸", label: "Մուլտֆիլմ" }
      ]
    }
  ];
}

export function blankDraft(audience = "her", occasion = "date") {
  const preset = OCCASIONS.find((o) => o.id === occasion) || OCCASIONS[0];
  return {
    audience: audience === "him" ? "him" : "her",
    occasion: preset.id,
    recipientName: "",
    senderName: "",
    theme: audience === "him" ? "sevan" : "rose",
    open: {
      mode: "now",
      schedule: "at",
      openAt: "",
      delayMinutes: 60,
      scratchColor: "#F7A8C4",
      scratchText: "Ջնջիր ինձ",
      envelopeHint: "Սեղմիր ծրարը",
      pin: "1402",
      pinQuestion: "Մեր ծանոթության օրը",
      beforeText: "Շուտով կտեսնես մի յուրահատուկ բան…"
    },
    question: {
      title: preset.question,
      subtitle: preset.qsub,
      yes: "Այո",
      no: "Ոչ",
      noMode: "run"
    },
    when: {
      mode: "recipient",
      title: preset.whenTitle,
      subtitle: preset.whenSub,
      date: "",
      time: "19:30",
      times: ["14:00", "17:00", "19:30", "21:00"]
    },
    choices: defaultChoices(),
    finale: {
      title: preset.finale,
      animation: "hearts"
    },
    media: { photo: "", voice: "", video: "" },
    telegram: "",
    email: "",
    method: "idram"
  };
}

export function applyOccasion(draft, occasionId) {
  const preset = OCCASIONS.find((o) => o.id === occasionId) || OCCASIONS[0];
  return {
    ...draft,
    occasion: preset.id,
    question: { ...draft.question, title: preset.question, subtitle: preset.qsub },
    when: { ...draft.when, title: preset.whenTitle, subtitle: preset.whenSub },
    finale: { ...draft.finale, title: preset.finale }
  };
}

export const PAY_METHODS = [
  { id: "idram", title: "Idram", text: "Հայաստանում ամենածանոթ դրամապանակը" },
  { id: "telcell", title: "Telcell", text: "Դրամապանակ և տերմինալ" },
  { id: "arca", title: "ArCa", text: "Հայկական քարտ" },
  { id: "card", title: "Visa / Mastercard", text: "Սովորական բանկային քարտ" }
];

export const SAMPLE_INVITE = {
  id: "sample",
  audience: "her",
  theme: "rose",
  recipientName: "Անի",
  senderName: "Նարեկ",
  open: {
    mode: "envelope",
    openAt: null,
    scratchColor: "#F7A8C4",
    scratchText: "Ջնջիր ինձ",
    envelopeHint: "Սեղմիր ծրարը",
    pin: "1402",
    pinQuestion: "Մեր ծանոթության օրը",
    beforeText: "Շուտով կտեսնես մի յուրահատուկ բան…"
  },
  question: {
    title: "Անի, կգա՞ս ինձ հետ հանդիպման",
    subtitle: "Ունեմ մի ծրագիր, որ ուզում եմ քեզ հետ կիսել",
    yes: "Այո",
    no: "Ոչ",
    noMode: "run"
  },
  when: {
    mode: "recipient",
    title: "Ե՞րբ ես ազատ",
    subtitle: "Ընտրիր քեզ հարմար օրը և ժամը",
    date: "",
    time: "19:30",
    times: ["14:00", "17:00", "19:30", "21:00"]
  },
  choices: [
    {
      id: "places",
      enabled: true,
      title: "Ո՞ւր գնանք",
      subtitle: "Երևանյան երեկո",
      items: [
        { id: "cascade", emoji: "🪜", label: "Կասկադ" },
        { id: "tumanyan", emoji: "🌃", label: "Թումանյան փողոց" },
        { id: "sevan", emoji: "🌊", label: "Սևանա լիճ" },
        { id: "areni", emoji: "🍷", label: "Արենի" }
      ]
    }
  ],
  finale: {
    title: "{name}, պատրաստ եղիր {date}-ին, ժամը {time}-ին։ Կգամ քեզ հետևից։ {place}",
    animation: "hearts"
  },
  media: { photo: "", voice: "", video: "" }
};

export const DATE_IDEAS = [
  {
    id: "yerevan",
    title: "Երևանում",
    items: [
      { title: "Կասկադ և սուրճ", text: "Իջեք աստիճաններով, նստեք վերևի տեսարանի մոտ, հետո իջեք Սարյան կամ Թումանյան՝ մի բաժակ սուրճի։" },
      { title: "Կոնդի երեկո", text: "Զբոսանք նեղ փողոցներով, հետո ընթրիք հին թաղամասի մոտակայքում։ Հանգիստ է առաջին հանդիպման համար, եթե օրը ցերեկով է։" },
      { title: "Օպերա և հրապարակ", text: "Կարճ ներկայացում կամ պարզապես երեկոյան հրապարակը, շատրվանները և երկար զրույց։" },
      { title: "Մատենադարան", text: "Մի ժամ ցուցադրություն, հետո գինի կամ թեյ մոտակա այգում։ Լավ է, եթե երկուսդ էլ սիրում եք հանգիստ տեղեր։" },
      { title: "Երևան Պարկ", text: "Երեկոյան լույսեր, պարզ ուրախություն, հետո տաք ըմպելիք։" }
    ]
  },
  {
    id: "out",
    title: "Քաղաքից դուրս",
    items: [
      { title: "Սևան", text: "Առավոտյան ճանապարհ, ձուկ կամ պարզապես ափ։ Վերցրեք քամուց մի շերտ հագուստ ավել։" },
      { title: "Գառնի և Գեղարդ", text: "Կեսօրյա զբոսանք, տաճար և ձոր։ Լավ է, երբ ուզում եք օրը միասին անցկացնել, ոչ թե մի ժամ։" },
      { title: "Ծաղկաձոր", text: "Պարանուղի կամ պարզապես անտառ։ Ձմռանը սա արդեն ամբողջ ծրագիր է։" },
      { title: "Դիլիջան", text: "Անտառ, դանդաղ ճանապարհ, երեկոյան վերադարձ։ Հարմար է տարեդարձի համար։" },
      { title: "Արենի", text: "Գինու համտես և կիրճ։ Գնացեք, եթե երկուսդ էլ սիրում եք երկար սեղան և զրույց։" },
      { title: "Խոր Վիրապ", text: "Արևածագ կամ ուշ կեսօր, Արարատը դիմացը։ Քիչ խոսք է պետք, տեղն ինքն է աշխատում։" }
    ]
  },
  {
    id: "home",
    title: "Տանը",
    items: [
      { title: "Խորոված և ֆիլմ", text: "Եթե բակ կամ պատշգամբ կա։ Ֆիլմը թող երկրորդ պլանում լինի, ոչ թե ամբողջ երեկոն։" },
      { title: "Խաչապուրի միասին", text: "Խոհանոցը դառնում է հանդիպման վայր։ Պարզ է, տաք, և երկուսդ էլ գործ ունեք անելու։" },
      { title: "Խաղ և գինի", text: "Քարտեր, նարդի կամ մի կարճ խաղ։ Լավ է, երբ չեք ուզում դրսում աղմուկ։" }
    ]
  },
  {
    id: "cheap",
    title: "Քիչ գումարով",
    items: [
      { title: "Օղակաձև այգի", text: "Զբոսանք, նստարան, մի գաթա։ Առաջին հանդիպման համար հաճախ սա բավական է։" },
      { title: "Կասկադի տեսարանը", text: "Անվճար է, երեկոյան գեղեցիկ է, և կարելի է հեշտությամբ ավարտել, եթե զրույցը չգնա։" },
      { title: "Շուկա և միրգ", text: "Կոմիտասի շուկա կամ թաղային կրպակ, հետո նստել մոտակա նստարանին։" }
    ]
  },
  {
    id: "first",
    title: "Առաջին հանդիպում",
    items: [
      { title: "Կարճ սուրճ", text: "Մեկ ժամ, մարդաշատ տեղ, հստակ ավարտ։ Թումանյանը կամ մի ծանոթ սրճարան։" },
      { title: "Ցերեկային զբոսանք", text: "Լույս կա, հեշտ է բաժանվել, և ավելի հանգիստ է, քան ուշ երեկոն։" },
      { title: "Թանգարան", text: "Կա ինչի մասին խոսել, եթե լռությունը երկարի։ Ժամը նախապես պայմանավորեք։" }
    ]
  }
];
