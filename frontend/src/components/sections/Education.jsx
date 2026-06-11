import React from "react";
import { motion } from "framer-motion";
import { useLang } from "@/contexts/LanguageContext";
import { GraduationCap } from "lucide-react";

export default function Education({ data }) {
  const { lang, t } = useLang();
  const items = (data && data.items) || [];

  return (
    <section id="education" className="relative py-24 px-6 lg:px-10" data-testid="section-education">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">{t.sections.education.eyebrow}</p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mt-2">{t.sections.education.title}</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((it, idx) => {
            const desc = (it.i18n && (it.i18n[lang] || it.i18n.en)) || "";
            return (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="p-6 border border-border bg-card/40 backdrop-blur-sm rounded-sm hover:border-primary/40 transition-colors"
                data-testid={`education-item-${idx}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">{it.period}</p>
                </div>
                <h3 className="font-heading text-xl font-bold">{it.degree}</h3>
                <p className="text-sm text-muted-foreground font-mono mt-1">@ {it.school}</p>
                <p className="text-sm mt-3 text-foreground/80 leading-relaxed">{desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
