import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/contexts/LanguageContext";
import { Briefcase, MapPin, ChevronDown, Check } from "lucide-react";
import SectionShape from "@/components/SectionShape";

export default function Experience({ data }) {
  const { lang, t } = useLang();
  const items = (data && data.items) || [];
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <section id="experience" className="relative py-24 px-6 lg:px-10 overflow-hidden" data-testid="section-experience">
      <SectionShape variant="pillbar" />
      <div className="max-w-7xl mx-auto relative">
        <div className="mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">{t.sections.experience.eyebrow}</p>
          <div className="flex items-baseline gap-3 flex-wrap mt-2">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter">{t.sections.experience.title}</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary border-l-2 border-primary px-2.5">timeline</span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-3">
            // CLICK ANY ITEM TO EXPAND
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4">
            {items.map((it, idx) => {
              const desc = (it.i18n && (it.i18n[lang] || it.i18n.en)) || "";
              const highlights = (it.highlights && (it.highlights[lang] || it.highlights.en)) || [];
              const isOpen = openIdx === idx;
              return (
                <motion.div
                  key={it.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="relative pl-12"
                  data-testid={`experience-item-${idx}`}
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-4 top-5 -translate-x-1/2 w-3 h-3 rounded-full transition-all ${isOpen ? "bg-primary border-glow" : "bg-background border-2 border-primary"}`}>
                    <Briefcase className="w-3 h-3 absolute -top-5 left-1/2 -translate-x-1/2 text-primary/50" />
                  </div>

                  <button
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    data-testid={`experience-toggle-${idx}`}
                    aria-expanded={isOpen}
                    className={`w-full text-left p-5 sm:p-6 border rounded-md bg-card/40 backdrop-blur-sm transition-all group ${
                      isOpen
                        ? "border-primary/60 border-glow"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-primary">{it.period}</p>
                        <h3 className="font-heading text-xl sm:text-2xl font-bold tracking-tight mt-1">{it.role}</h3>
                        <p className="text-sm text-muted-foreground font-mono mt-1">@ {it.company}</p>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ${isOpen ? "rotate-180 text-primary" : "group-hover:text-foreground"}`} />
                    </div>

                    <p className="text-sm mt-3 text-foreground/80 leading-relaxed">{desc}</p>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mt-5 pt-5 border-t border-border space-y-5" data-testid={`experience-detail-${idx}`}>
                            {it.location && (
                              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                                <MapPin className="w-3.5 h-3.5 text-primary" />
                                {it.location}
                              </div>
                            )}

                            {highlights.length > 0 && (
                              <div>
                                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">// HIGHLIGHTS</p>
                                <ul className="space-y-2">
                                  {highlights.map((h, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm">
                                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                      <span className="text-foreground/85 leading-relaxed">{h}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {(it.stack || []).length > 0 && (
                              <div>
                                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">// STACK</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {it.stack.map((s) => (
                                    <span key={s} className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 border border-primary/30 text-primary bg-primary/5 rounded-sm">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
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
      </div>
    </section>
  );
}
