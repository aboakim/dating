import Link from "next/link";

export default function BrandLogo({ href = "/", size = "nav", showAura = false }) {
  const content = (
    <span className={`brand-logo brand-logo-${size}`}>
      {showAura ? (
        <span className="brand-aura" aria-hidden="true">
          <span className="brand-cloud brand-cloud-left" />
          <span className="brand-cloud brand-cloud-right" />
          <span className="brand-spark brand-spark-a">♥</span>
          <span className="brand-spark brand-spark-b">♥</span>
          <span className="brand-spark brand-spark-c">♥</span>
        </span>
      ) : null}
      <span className="brand-wordmark">
        <span className="brand-word">Date</span>
        <span className="brand-heart" aria-hidden="true">♥</span>
        <span className="brand-word">Me</span>
      </span>
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="brand-logo-link" aria-label="DateMe">
      {content}
    </Link>
  );
}
