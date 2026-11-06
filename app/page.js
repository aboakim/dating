import Link from "next/link";
import { EDIT_PRICE, EXTEND_PLANS, PRICE } from "@/lib/catalog";
import { amd } from "@/lib/format";

const FEATURES = [
  ["Փախչող «Ոչ»", "Կոճակը փախչում է, փոքրանում կամ անհետանում։ «Այո»-ից հետո էկրանը լցվում է սրտերով։"],
  ["Օր ու ժամ", "Կամ դու ես նշում օրը, կամ հյուրն ինքն է ընտրում մոտակա երեք շաբաթից։"],
  ["Վայր, սեղան, ֆիլմ", "Կասկադ, Սևան, խորոված, գինի կամ քո տարբերակները։"],
  ["Ինչպես բացվի", "Անմիջապես, ժամաչափ, ջնջվող շերտ, ծրար կամ 4 թվանոց կոդ։"],
  ["Նկար, ձայն, շրջան", "Լուսանկարը պտտվում է սկավառակի պես, ձայնը և կարճ տեսանյութը նստում են հարցի վրա։"],
  ["Պատասխանը քեզ մոտ", "Առանձին հղումով տեսնում ես բացումը, «ոչ»-ի փորձերը և ընտրված օրը։"]
];

export default function HomePage() {
  return (
    <main>
      <section className="hero wrap">
        <div>
          <p className="eyebrow">Հայաստանի համար</p>
          <h1>առցանց հրավեր <span>հանդիպման</span></h1>
          <div className="pills">
            <Link href="/create?audience=her">աղջկա համար</Link>
            <Link href="/create?audience=him">տղայի համար</Link>
          </div>
          <p className="lead">Ստեղծիր ջերմ հրավեր և ուղարկիր հղումը այն մարդուն, ում ուզում ես տեսնել։ Նա կբացի հեռախոսով, կասի այո և կընտրի օրը։</p>
          <div className="hero-actions">
            <Link className="btn btn-solid" href="/create">Ստեղծել հրավեր</Link>
            <Link className="btn btn-ghost" href="/preview">Փորձել օրինակը</Link>
          </div>
        </div>
        <div className="phone hero-phone" aria-hidden="true">
          <div className="invite" style={{ "--accent": "#F85589", "--soft": "#FFE8EF", background: "#FFF5F8", color: "#2D1926" }}>
            <div className="stage">
              <div className="ask">
                <p className="eyebrow">Նարեկից</p>
                <h2>Անի, կգա՞ս ինձ հետ հանդիպման</h2>
                <p className="sub">Կասկադ, հետո մի բաժակ գինի</p>
                <div className="ask-actions">
                  <span className="btn btn-solid">Այո</span>
                  <span className="btn btn-no">Ոչ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <h2>Ինչպես է ստացվում</h2>
        <div className="cards">
          <article><b>1</b><h3>Հավաքիր 2 րոպեում</h3><p>Անուն, հարց, բացման ձև, օր և վայր։ Աջ կողմում տեսնում ես հեռախոսը։</p></article>
          <article><b>2</b><h3>Ուղարկիր հղում կամ QR</h3><p>Telegram, WhatsApp կամ Viber։ Գրանցում չկա։</p></article>
          <article><b>3</b><h3>Տես պատասխանը</h3><p>Քո էջում երևում է այոն, օրը, ժամը և ինչ են ընտրել։</p></article>
        </div>
      </section>

      <section className="wrap section">
        <h2>Ինչ կա ներսում</h2>
        <div className="feature-grid">
          {FEATURES.map(([title, text]) => (
            <article key={title}><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section className="wrap section price-band">
        <div>
          <h2>{amd(PRICE)}</h2>
          <p>Մեկ հրավեր, մեկ վճարում, 30 օր։ Առանց բաժանորդագրության։</p>
          <ul>
            <li>Խմբագրում՝ {amd(EDIT_PRICE)}</li>
            {EXTEND_PLANS.map((plan) => (
              <li key={plan.days}>Երկարացում {plan.label}՝ {amd(plan.price)}</li>
            ))}
          </ul>
          <p className="help">Idram, Telcell, ArCa և քարտ նախատեսված են ինտերֆեյսում։ Այս պատճենում գումար չի գանձվում, մինչև կկապվի վճարային կազմակերպությունը։</p>
        </div>
        <Link className="btn btn-solid" href="/create">Սկսել</Link>
      </section>

      <section className="wrap section">
        <h2>Կարճ հարցեր</h2>
        <div className="faq">
          <details><summary>Պե՞տք է գրանցվել</summary><p>Ոչ։ Հրավերից հետո ստանում ես երկու հղում. մեկը ուղարկում ես, մյուսը պահում ես քեզ համար։</p></details>
          <details><summary>Ինչպե՞ս կիմանամ պատասխանը</summary><p>Քո էջը թարմանում է մի քանի վայրկյանը մեկ։ Այնտեղ երևում են բացումը, «ոչ»-ի փորձերը և ընտրված վայրը։</p></details>
          <details><summary>Որքա՞ն է ապրում հղումը</summary><p>30 օր։ Կարող ես երկարացնել 30, 90 կամ 365 օրով։</p></details>
          <details><summary>Ի՞նչ առիթների համար է</summary><p>Հանդիպում, ծննդյան օր, մարտի 8, տարեդարձ, կարոտ կամ ներողություն։ Տեքստերը կարելի է ամբողջովին փոխել։</p></details>
        </div>
      </section>
    </main>
  );
}
