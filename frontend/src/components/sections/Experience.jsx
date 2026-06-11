import React from "react";
import { motion } from "framer-motion";
import { useLang } from "@/contexts/LanguageContext";
import { Briefcase } from "lucide-react";

export default function Experience({ data }) {
  const { lang, t } = useLang();
  const items = (data && data.items) || [];

  return (
    <section id="experience" className="relative py-24 px-6 lg:px-10" data-testid="section-experience">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">{t.sections.experience.eyebrow}</p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mt-2">{t.sections.experience.title}</h2>
        </div>
        <div className="relative">
          <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-12">
            {items.map((it, idx) => {
              const desc = (it.i18n && (it.i18n[lang] || it.i18n.en)) || "";
              const isLeft = idx % 2 === 0;
              return (
                <motion.div
                  key={it.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className={`relative lg:grid lg:grid-cols-2 lg:gap-8 ${isLeft ? "" : "lg:[&>*:first-child]:order-2"}`}
                  data-testid={`experience-item-${idx}`}
                >
                  <div className={`pl-12 lg:pl-0 ${isLeft ? "lg:text-right lg:pr-12" : "lg:pl-12"}`}>
                    <p className="font-mono text-xs text-primary">{it.period}</p>
                    <h3 className="font-heading text-xl sm:text-2xl font-bold mt-1">{it.role}</h3>
                    <p className="text-sm text-muted-foreground font-mono">@ {it.company}</p>
                    <p className="text-sm mt-3 text-foreground/80 leading-relaxed">{desc}</p>
                  </div>
                  <div className="hidden lg:block" />
                  <div className="absolute left-4 lg:left-1/2 top-2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background border-glow">
                    <Briefcase className="w-3 h-3 absolute -top-5 left-1/2 -translate-x-1/2 text-primary/60" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
