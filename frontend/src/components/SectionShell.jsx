import React from "react";

/**
 * Consistent outer shell so every section aligns left/right identically,
 * while letting each section have its own distinct visual flair through
 * a giant section number watermark + a custom accent under the heading.
 */
export function SectionShell({ id, num, accent = "default", children, testId }) {
  return (
    <section
      id={id}
      className="relative py-24 px-6 lg:px-10"
      data-testid={testId || `section-${id}`}
    >
      {/* Giant decorative section number (subtle watermark) */}
      <span
        aria-hidden
        className="absolute top-10 right-4 lg:right-12 font-heading font-black text-[120px] sm:text-[180px] lg:text-[240px] leading-none tracking-tighter text-primary/[0.035] select-none pointer-events-none"
      >
        {num}
      </span>

      <div className="max-w-7xl mx-auto relative">
        {children}
      </div>

      {/* Bottom accent — different per section */}
      <SectionAccent variant={accent} />
    </section>
  );
}

function SectionAccent({ variant }) {
  const styles = {
    default: null,
    dots: (
      <div aria-hidden className="absolute bottom-0 inset-x-0 h-px overflow-hidden opacity-30">
        <div className="h-px w-full" style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "12px 1px",
        }} />
      </div>
    ),
    dashed: (
      <div aria-hidden className="absolute bottom-0 inset-x-6 lg:inset-x-10 h-px"
        style={{ backgroundImage: "repeating-linear-gradient(90deg, hsl(var(--primary) / 0.25) 0 8px, transparent 8px 18px)" }} />
    ),
    gradient: (
      <div aria-hidden className="absolute bottom-0 inset-x-6 lg:inset-x-10 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.4), transparent)" }} />
    ),
    glow: (
      <div aria-hidden className="absolute bottom-0 inset-x-6 lg:inset-x-10 h-px bg-primary/40"
        style={{ boxShadow: "0 0 22px hsl(var(--primary) / 0.45)" }} />
    ),
  };
  return styles[variant] || null;
}

/**
 * Standard section heading with consistent left-right padding.
 * `tagAccent` selects a small decorative flair next to the title for variety.
 */
export function SectionHeading({ eyebrow, title, subtitle, tag = "DEFAULT", side }) {
  const tagStyles = {
    DEFAULT:    "font-mono text-[10px] uppercase tracking-[0.3em] text-primary border border-primary/40 bg-primary/5 px-2.5 py-1 rounded-sm",
    BRACKET:    "font-mono text-[10px] uppercase tracking-[0.3em] text-primary border border-primary/40 px-2.5 py-1 rounded-full",
    PROMPT:     "font-mono text-[10px] uppercase tracking-[0.3em] text-primary",
    PIN:        "font-mono text-[10px] uppercase tracking-[0.3em] text-primary border-l-2 border-primary px-2.5",
    STAMP:      "font-mono text-[10px] uppercase tracking-[0.3em] text-primary border-y border-primary/40 py-0.5 px-2",
    DIAMOND:    "font-mono text-[10px] uppercase tracking-[0.3em] text-primary border border-primary/40 px-2.5 py-1 [clip-path:polygon(8px_0,calc(100%-8px)_0,100%_50%,calc(100%-8px)_100%,8px_100%,0_50%)]",
    SLASH:      "font-mono text-[10px] uppercase tracking-[0.3em] text-primary",
  };

  return (
    <div className="mb-12 flex items-end justify-between gap-4 flex-wrap">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
        <div className="flex items-center gap-3 mt-2">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter">{title}</h2>
          <span className={tagStyles[tag] || tagStyles.DEFAULT}>{tag === "PROMPT" ? "$ run" : tag === "SLASH" ? "//" : "live"}</span>
        </div>
        {subtitle && (
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-3">
            {subtitle}
          </p>
        )}
      </div>
      {side && <div className="shrink-0">{side}</div>}
    </div>
  );
}
