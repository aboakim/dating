import Link from "next/link";
import { DATE_IDEAS } from "@/lib/catalog";

export const metadata = {
  title: "Հանդիպման գաղափարներ Հայաստանում — Ջերմ",
  description: "Երևան, Սևան, Գառնի, տուն և առաջին հանդիպում։ Գաղափարներ, որոնք կարելի է դնել հրավերի մեջ։"
};

export default function IdeasPage() {
  return (
    <main className="wrap prose">
      <p className="eyebrow">Հայաստան</p>
      <h1>Ուր գնալ</h1>
      <p className="lead">Սրանք պատրաստի ուղղություններ են։ Կոնստրուկտորում կարող ես թողնել մի քանիսը, որ մյուս կողմն ինքը ընտրի։</p>
      {DATE_IDEAS.map((group) => (
        <section key={group.id}>
          <h2>{group.title}</h2>
          <div className="feature-grid">
            {group.items.map((item) => (
              <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>
            ))}
          </div>
        </section>
      ))}
      <Link className="btn btn-solid" href="/create">Դնել հրավերի մեջ</Link>
    </main>
  );
}
