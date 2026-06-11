import React from "react";

/**
 * Decorative section shape — translucent + backdrop-blur so the animated
 * particle background stays visible through it. One unique variant per
 * section to give every menu its own personality.
 */
export default function SectionShape({ variant = "orb" }) {
  const common = "absolute pointer-events-none select-none z-0";

  switch (variant) {
    // SUMMARY — Big floating orb (top-right)
    case "orb":
      return (
        <>
          <div className={`${common} top-24 -right-10 sm:right-10 w-[380px] h-[380px] rounded-full bg-primary/20 backdrop-blur-2xl border border-primary/30`}
            style={{ boxShadow: "0 0 80px -10px hsl(var(--primary) / 0.45) inset" }} />
          <div className={`${common} top-44 right-32 w-12 h-12 rounded-full bg-primary/40 backdrop-blur-md border border-primary/40`} />
        </>
      );

    // SKILLS — Rotated square (rhombus) on the right
    case "rhombus":
      return (
        <>
          <div className={`${common} top-16 -right-20 w-[360px] h-[360px] rotate-45 bg-primary/18 backdrop-blur-2xl border border-primary/35`} />
          <div className={`${common} top-72 right-20 w-20 h-20 rotate-45 bg-primary/30 backdrop-blur-md border border-primary/40`} />
        </>
      );

    // EXPERIENCE — Vertical pill bar
    case "pillbar":
      return (
        <>
          <div className={`${common} top-10 right-6 sm:right-16 w-32 h-[420px] rounded-full bg-primary/18 backdrop-blur-2xl border border-primary/35`} />
          <div className={`${common} top-72 right-3 sm:right-8 w-3 h-32 rounded-full bg-primary/50`} />
        </>
      );

    // PORTFOLIO — Triangle (SVG)
    case "triangle":
      return (
        <svg
          className={`${common} top-16 right-4 sm:right-12 w-[300px] h-[300px]`}
          viewBox="0 0 300 300"
          aria-hidden
        >
          <defs>
            <filter id="ptr-blur" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          <polygon
            points="150,20 280,260 20,260"
            fill="hsl(var(--primary))"
            fillOpacity="0.12"
            stroke="hsl(var(--primary))"
            strokeOpacity="0.35"
            strokeWidth="2"
            filter="url(#ptr-blur)"
          />
          <polygon
            points="150,90 220,220 80,220"
            fill="hsl(var(--primary))"
            fillOpacity="0.05"
            stroke="hsl(var(--primary))"
            strokeOpacity="0.2"
            strokeWidth="1"
          />
        </svg>
      );

    // EDUCATION — Concentric rings (radar)
    case "rings":
      return (
        <div className={`${common} top-12 right-8 w-[360px] h-[360px]`}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border backdrop-blur-2xl"
              style={{
                margin: `${i * 28}px`,
                borderColor: `hsl(var(--primary) / ${0.35 - i * 0.08})`,
                background: `hsl(var(--primary) / ${0.10 - i * 0.025})`,
              }}
            />
          ))}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary" />
        </div>
      );

    // FORUM — Hexagon (CLI/circuit vibe)
    case "hexagon":
      return (
        <svg
          className={`${common} top-12 right-4 sm:right-12 w-[300px] h-[300px]`}
          viewBox="0 0 300 300"
          aria-hidden
        >
          <defs>
            <filter id="hex-blur" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>
          <polygon
            points="150,15 270,82 270,218 150,285 30,218 30,82"
            fill="hsl(var(--primary))"
            fillOpacity="0.10"
            stroke="hsl(var(--primary))"
            strokeOpacity="0.35"
            strokeWidth="2"
            filter="url(#hex-blur)"
          />
          <polygon
            points="150,80 215,115 215,185 150,220 85,185 85,115"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeOpacity="0.25"
            strokeWidth="1"
          />
        </svg>
      );

    // CONTACT — Cross/plus + circle (signal)
    case "signal":
      return (
        <>
          <div className={`${common} top-16 -right-12 w-[340px] h-[340px] rounded-full bg-primary/12 backdrop-blur-2xl border border-primary/25`} />
          <div className={`${common} top-32 right-32 w-1 h-32 bg-primary/40`} />
          <div className={`${common} top-56 right-12 w-32 h-1 bg-primary/40`} />
          <div className={`${common} top-52 right-32 w-10 h-10 rounded-full border-2 border-primary bg-background/40 backdrop-blur-md`} />
        </>
      );

    default:
      return null;
  }
}
