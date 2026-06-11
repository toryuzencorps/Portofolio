import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/contexts/LanguageContext";
import { Code2, Server, Database, Cloud, ChevronRight, Sparkles } from "lucide-react";

const ICONS = { Code2, Server, Database, Cloud };

function normalizeItems(items) {
  return (items || []).map((it) =>
    typeof it === "string" ? { name: it, level: 80, years: 2, i18n: { en: "", id: "" } } : it
  );
}

export default function Skills({ data }) {
  const { lang, t } = useLang();
  const categories = (data && data.categories) || [];
  const [activeIdx, setActiveIdx] = useState(0);

  const active = useMemo(() => {
    const c = categories[activeIdx];
    if (!c) return null;
    return { ...c, items: normalizeItems(c.items) };
  }, [categories, activeIdx]);

  return (
    <section id="skills" className="relative py-24 px-6 lg:px-10" data-testid="section-skills">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">{t.sections.skills.eyebrow}</p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mt-2">{t.sections.skills.title}</h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-4">
          {/* Categories rail */}
          <aside className="lg:col-span-4 space-y-2">
            {categories.map((cat, idx) => {
              const Icon = ICONS[cat.icon] || Sparkles;
              const isActive = idx === activeIdx;
              return (
                <motion.button
                  key={cat.name}
                  onClick={() => setActiveIdx(idx)}
                  data-testid={`skill-category-${cat.name}`}
                  data-active={isActive}
                  whileHover={{ x: 4 }}
                  className={`w-full text-left p-4 border rounded-md transition-all flex items-center gap-3 group ${
                    isActive
                      ? "border-primary/60 bg-primary/5 border-glow"
                      : "border-border bg-card/40 hover:border-primary/30"
                  }`}
                >
                  <span className={`shrink-0 w-10 h-10 rounded-md flex items-center justify-center border ${isActive ? "border-primary/50 text-primary bg-primary/10" : "border-border text-muted-foreground"}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                      [{String(idx + 1).padStart(2, "0")}]
                    </p>
                    <p className={`font-heading text-base sm:text-lg font-bold tracking-tight truncate ${isActive ? "text-primary" : ""}`}>
                      {cat.name}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "text-primary translate-x-0" : "text-muted-foreground -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"}`} />
                </motion.button>
              );
            })}
          </aside>

          {/* Detail panel */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {active && (
                <motion.div
                  key={active.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35 }}
                  className="p-6 sm:p-8 border border-border bg-card/40 backdrop-blur-sm rounded-md min-h-[400px]"
                  data-testid={`skill-detail-${active.name}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-1">// CATEGORY</p>
                      <h3 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{active.name}</h3>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground border border-border px-2.5 py-1 rounded-sm shrink-0">
                      {active.items.length} {active.items.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {active.summary?.[lang] || active.summary?.en}
                  </p>

                  <div className="space-y-4">
                    {active.items.map((it, i) => (
                      <motion.div
                        key={it.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border border-border bg-background/40 rounded-sm p-4 hover:border-primary/40 transition-colors"
                        data-testid={`skill-item-${it.name}`}
                      >
                        <div className="flex items-baseline justify-between gap-3 mb-2">
                          <div className="flex items-baseline gap-2 min-w-0">
                            <span className="font-mono text-[10px] text-primary">{String(i + 1).padStart(2, "0")}</span>
                            <span className="font-heading font-bold tracking-tight truncate">{it.name}</span>
                          </div>
                          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">
                            {it.years}y · {it.level}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-background border border-border rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${it.level}%` }}
                            transition={{ duration: 0.8, delay: 0.1 + i * 0.05, ease: "easeOut" }}
                            className="h-full bg-primary"
                            style={{ boxShadow: "0 0 12px hsl(var(--primary) / 0.6)" }}
                          />
                        </div>
                        {(it.i18n?.[lang] || it.i18n?.en) && (
                          <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed">
                            {it.i18n[lang] || it.i18n.en}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
