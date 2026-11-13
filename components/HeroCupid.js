"use client";

export default function HeroCupid({ size = "inline" }) {
  return (
    <div className={`hero-cupid hero-cupid-${size}`} aria-hidden="true">
      <div className="hero-cupid-glow" />
      <img className="hero-cupid-img" src="/cupid.png?v=4" alt="" width={280} height={280} />
      <span className="hero-cupid-arrow">♥</span>
      <span className="hero-cupid-heart hero-cupid-heart-a">♥</span>
      <span className="hero-cupid-heart hero-cupid-heart-b">♥</span>
      <span className="hero-cupid-heart hero-cupid-heart-c">♥</span>
      <span className="hero-cupid-heart hero-cupid-heart-d">♥</span>
      <span className="hero-cupid-heart hero-cupid-heart-e">♥</span>
    </div>
  );
}
