"use client";

export default function FallingHearts({ compact = false, color = "#F85589" }) {
  const hearts = compact
    ? [
        { id: 0, left: "18%", delay: "0s", duration: "5s", rotation: 90 },
        { id: 1, left: "48%", delay: "1.4s", duration: "6s", rotation: -120 },
        { id: 2, left: "78%", delay: "2.8s", duration: "5.5s", rotation: 160 }
      ]
    : [
        { id: 0, left: "12%", delay: "0s", duration: "5.5s", rotation: 90 },
        { id: 1, left: "28%", delay: "1s", duration: "6s", rotation: -110 },
        { id: 2, left: "46%", delay: "2s", duration: "5s", rotation: 150 },
        { id: 3, left: "64%", delay: "0.8s", duration: "6.2s", rotation: -170 },
        { id: 4, left: "82%", delay: "2.4s", duration: "5.4s", rotation: 120 }
      ];

  return (
    <div className={compact ? "falling-hearts compact" : "falling-hearts"} aria-hidden="true">
      {hearts.map((heart) => (
        <span
          key={heart.id}
          className="falling-heart"
          style={{
            left: heart.left,
            animationDelay: heart.delay,
            animationDuration: heart.duration,
            "--heart-rotation": `${heart.rotation}deg`,
            color
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}
