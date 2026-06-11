import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/contexts/LanguageContext";
import { ExternalLink, X, Calendar, User, Tag as TagIcon } from "lucide-react";

export default function Portfolio({ data }) {
  const { lang, t } = useLang();
  const items = (data && data.items) || [];
  const [openId, setOpenId] = useState(null);

  const opened = items.find((i) => i.id === openId) || null;

  // Google Photos-style asymmetric mosaic — varied tile heights for a magazine feel.
  // Pattern repeats every 6 items: tall, short, short, wide, short, tall…
  const tileClass = (i) => {
    const pattern = [
      "row-span-2",            // tall
      "row-span-1",            // short
      "row-span-1",            // short
      "row-span-2",            // tall
      "row-span-1",            // short
      "row-span-1",            // short
    ];
    return pattern[i % pattern.length];
  };

  return (
    <section id="portfolio" className="relative py-24 px-6 lg:px-10" data-testid="section-portfolio">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {t.sections.portfolio.eyebrow}
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mt-2">
              {t.sections.portfolio.title}
            </h2>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground border border-border px-2.5 py-1 rounded-sm">
            {items.length} {items.length === 1 ? "project" : "projects"}
          </span>
        </div>

        {/* Gallery */}
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[140px] sm:auto-rows-[180px] lg:auto-rows-[210px]"
          data-testid="portfolio-gallery"
        >
          {items.map((it, idx) => {
            const desc = (it.i18n && (it.i18n[lang] || it.i18n.en)) || "";
            return (
              <motion.button
                key={it.id}
                onClick={() => setOpenId(it.id)}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                whileHover={{ y: -2 }}
                data-testid={`portfolio-item-${idx}`}
                className={`group relative overflow-hidden border border-border hover:border-primary/60 rounded-md text-left ${tileClass(idx)}`}
              >
                {/* Image */}
                {it.image && (
                  <img
                    src={it.image}
                    alt={it.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}

                {/* Bottom overlay (always visible) */}
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
                  <h3 className="font-heading text-sm sm:text-base font-bold text-white tracking-tight leading-tight truncate">
                    {it.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-white/75 mt-0.5 line-clamp-2 leading-snug">
                    {desc}
                  </p>
                </div>

                {/* Top-right zoom hint on hover */}
                <span
                  aria-hidden
                  className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/20 text-[9px] uppercase tracking-widest font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {it.year || "view"}
                </span>

                {/* Cyan ring on hover */}
                <span
                  aria-hidden
                  className="absolute inset-0 ring-1 ring-inset ring-transparent group-hover:ring-primary/60 transition-all duration-300 rounded-md pointer-events-none"
                  style={{ boxShadow: "0 0 0 transparent" }}
                />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {opened && (
          <PortfolioModal
            item={opened}
            lang={lang}
            onClose={() => setOpenId(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function PortfolioModal({ item, lang, onClose }) {
  const desc = (item.i18n && (item.i18n[lang] || item.i18n.en)) || "";
  const details = (item.details && (item.details[lang] || item.details.en)) || desc;

  // Lock body scroll
  React.useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-md"
      data-testid="portfolio-modal"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-[88vh] overflow-hidden grid lg:grid-cols-5 bg-background border border-primary/30 rounded-lg shadow-[0_0_60px_-12px_rgba(0,240,255,0.4)]"
      >
        {/* Close */}
        <button
          onClick={onClose}
          data-testid="portfolio-modal-close"
          aria-label="Close"
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 hover:border-primary text-white hover:text-primary backdrop-blur-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Image */}
        <div className="relative lg:col-span-3 aspect-[16/10] lg:aspect-auto bg-secondary overflow-hidden">
          {item.image && (
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/30 lg:to-background/0" />
        </div>

        {/* Content */}
        <div className="lg:col-span-2 p-6 sm:p-8 overflow-y-auto flex flex-col gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">// PROJECT</p>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold tracking-tighter mt-1.5" data-testid="portfolio-modal-title">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{desc}</p>
          </div>

          {/* Meta row */}
          {(item.year || item.role) && (
            <div className="flex flex-wrap gap-3 text-xs font-mono text-muted-foreground border-y border-border py-3">
              {item.year && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> {item.year}
                </span>
              )}
              {item.role && (
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" /> {item.role}
                </span>
              )}
            </div>
          )}

          {/* Tags */}
          {(item.tags || []).length > 0 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2 flex items-center gap-1.5">
                <TagIcon className="w-3 h-3" /> // STACK
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 border border-primary/30 text-primary bg-primary/5 rounded-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Long description */}
          <div className="flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">// DETAILS</p>
            <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line" data-testid="portfolio-modal-details">
              {details}
            </p>
          </div>

          {/* CTA */}
          {item.url && item.url !== "#" && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="portfolio-modal-link"
              className="mt-2 inline-flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest px-4 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm transition-colors"
            >
              Visit project <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
