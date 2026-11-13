"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import FallingHearts from "@/components/FallingHearts";
import HeroCupid from "@/components/HeroCupid";
import { useLanguage } from "@/components/LanguageProvider";

export default function HomePage() {
  const { dict } = useLanguage();
  const L = dict.landing;

  return (
    <main className="landing">
      <section className="hero wrap">
        <FallingHearts />
        <div className="hero-copy enter-up">
          <div className="brand-mark">
            <BrandLogo href={null} size="hero" showAura />
          </div>
          <div className="hero-title-row">
            <h1>
              <span className="title-line">{L.title1}</span>
              <span className="title-line">{L.title1b}</span>
              <span className="title-accent">{L.title2}</span>
            </h1>
            <HeroCupid size="inline" />
          </div>
          <div className="pills">
            <Link href="/create?audience=her" className="pill-her">{L.forHer}</Link>
            <Link href="/create?audience=him" className="pill-him">{L.forHim}</Link>
          </div>
          <p className="lead">{L.lead}</p>
          <div className="hero-actions">
            <Link className="btn btn-solid" href="/create">{L.cta}</Link>
            <Link className="btn btn-ghost" href="/preview">{L.trySample}</Link>
          </div>
        </div>
        <div className="phone hero-phone enter-phone" aria-hidden="true">
          <div className="phone-brand-screen">
            <span className="phone-brand-heart">♥</span>
            <strong>DateMe</strong>
          </div>
        </div>
      </section>

      <section className="wrap section how-section">
        <h2>{L.howTitle}</h2>
        <div className="how-steps">
          <article className="how-step">
            <div className="how-visual how-visual-create" aria-hidden="true">
              <span className="how-phone">
                <i className="how-line" />
                <i className="how-line short" />
                <i className="how-heart">♥</i>
              </span>
            </div>
            <p className="how-num">1</p>
            <h3>{L.how1t}</h3>
            <p>{L.how1d}</p>
          </article>
          <article className="how-step">
            <div className="how-visual how-visual-send" aria-hidden="true">
              <span className="how-bubble">♥</span>
              <span className="how-link">↗</span>
            </div>
            <p className="how-num">2</p>
            <h3>{L.how2t}</h3>
            <p>{L.how2d}</p>
          </article>
          <article className="how-step">
            <div className="how-visual how-visual-reply" aria-hidden="true">
              <span className="how-tg">
                <b>TG</b>
                <i>♥</i>
              </span>
            </div>
            <p className="how-num">3</p>
            <h3>{L.how3t}</h3>
            <p>{L.how3d}</p>
          </article>
        </div>
      </section>

      <section className="wrap section features-section">
        <h2>{L.featuresTitle}</h2>
        <div className="feature-grid">
          {L.features.map((item) => {
            const [title, text, icon] = item;
            return (
              <article key={title} className="feature-card">
                <div className={`feature-visual feature-visual-${icon}`} aria-hidden="true">
                  {icon === "no" ? (
                    <>
                      <span className="fv-btn yes">Այո</span>
                      <span className="fv-btn no">Ոչ</span>
                      <span className="fv-heart">♥</span>
                    </>
                  ) : null}
                  {icon === "when" ? (
                    <>
                      <span className="fv-cal">
                        <b>19</b>
                        <small>30</small>
                      </span>
                    </>
                  ) : null}
                  {icon === "place" ? (
                    <>
                      <span className="fv-chip">☕</span>
                      <span className="fv-chip">🚶</span>
                      <span className="fv-chip">🍽️</span>
                    </>
                  ) : null}
                  {icon === "open" ? (
                    <>
                      <span className="fv-env">✉</span>
                      <span className="fv-lock">4</span>
                    </>
                  ) : null}
                  {icon === "media" ? (
                    <>
                      <span className="fv-disc spin" />
                      <span className="fv-note">♪</span>
                    </>
                  ) : null}
                  {icon === "reply" ? (
                    <>
                      <span className="fv-tg">TG</span>
                      <span className="fv-dot">♥</span>
                    </>
                  ) : null}
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="wrap section">
        <h2>{L.faqTitle}</h2>
        <div className="faq">
          {L.faq.map(([q, a]) => (
            <details key={q}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </div>
      </section>
    </main>
  );
}

