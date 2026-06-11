import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/contexts/LanguageContext";
import { Code2, Server, Database, Cloud, ChevronDown, Sparkles } from "lucide-react";

const ICONS = { Code2, Server, Database, Cloud };

function normalizeItems(items) {
  return (items || []).map((it) =>
    typeof it === "string" ? { name: it, years: 0, i18n: { en: "", id: "" } } : it
  );
}

export default function Skills({ data }) {
  const { lang, t } = useLang();
  const categories = (data && data.categories) || [];
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <section id="skills" className="relative py-24 px-6 lg:px-10 overflow-hidden" data-testid="section-skills">
      <span aria-hidden className="absolute top-12 right-4 lg:right-12 font-heading font-black text-[140px] sm:text-[200px] lg:text-[260px] leading-none tracking-tighter select-none pointer-events-none z-0 watermark-num">02</span>
      <div className="max-w-7xl mx-auto relative">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">{t.sections.skills.eyebrow}</p>
          <div className="flex items-baseline gap-3 flex-wrap mt-2">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter">{t.sections.skills.title}</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary border border-primary/40 bg-primary/5 px-2.5 py-1 rounded-full">stack</span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-3">
            // CLICK ANY CATEGORY TO EXPAND
          </p>
        </div>

        <div className="space-y-4">
          {categories.map((cat, idx) => {
            const Icon = ICONS[cat.icon] || Sparkles;
            const items = normalizeItems(cat.items);
            const isOpen = openIdx === idx;
            const summary = cat.summary?.[lang] || cat.summary?.en || "";

            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                data-testid={`skill-category-${cat.name}`}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  data-testid={`skill-toggle-${idx}`}
                  aria-expanded={isOpen}
                  className={`w-full text-left p-5 sm:p-6 border rounded-md bg-card/40 backdrop-blur-sm transition-all group ${
                    isOpen
                      ? "border-primary/60 border-glow"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`shrink-0 w-11 h-11 rounded-md flex items-center justify-center border transition-colors ${isOpen ? "border-primary/50 text-primary bg-primary/10" : "border-border text-muted-foreground"}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                        [{String(idx + 1).padStart(2, "0")}] · {items.length} {items.length === 1 ? "item" : "items"}
                      </p>
                      <h3 className="font-heading text-xl sm:text-2xl font-bold tracking-tight mt-0.5">{cat.name}</h3>
                    </div>
                    <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${isOpen ? "rotate-180 text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                  </div>

                  {summary && (
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{summary}</p>
                  )}

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5 pt-5 border-t border-border" data-testid={`skill-detail-${cat.name}`}>
                          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">// BREAKDOWN</p>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {items.map((it, i) => (
                              <motion.div
                                key={it.name}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="border border-border bg-background/40 rounded-sm p-3.5 hover:border-primary/40 transition-colors"
                                data-testid={`skill-item-${it.name}`}
                              >
                                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                                  <div className="flex items-baseline gap-2 min-w-0">
                                    <span className="font-mono text-[10px] text-primary">{String(i + 1).padStart(2, "0")}</span>
                                    <span className="font-heading font-bold tracking-tight truncate">{it.name}</span>
                                  </div>
                                  {it.years ? (
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">
                                      {it.years} {it.years === 1 ? "yr" : "yrs"}
                                    </span>
                                  ) : null}
                                </div>
                                {(it.i18n?.[lang] || it.i18n?.en) && (
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {it.i18n[lang] || it.i18n.en}
                                  </p>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
