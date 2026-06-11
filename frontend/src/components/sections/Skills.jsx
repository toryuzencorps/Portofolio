import React from "react";
import { motion } from "framer-motion";
import { useLang } from "@/contexts/LanguageContext";

export default function Skills({ data }) {
  const { t } = useLang();
  const categories = (data && data.categories) || [];

  return (
    <section id="skills" className="relative py-24 px-6 lg:px-10" data-testid="section-skills">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">{t.sections.skills.eyebrow}</p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mt-2">{t.sections.skills.title}</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="p-6 border border-border bg-card/40 backdrop-blur-sm rounded-sm hover:border-primary/40 transition-colors group"
              data-testid={`skill-category-${cat.name}`}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-4">[{String(idx + 1).padStart(2, "0")}] {cat.name}</p>
              <div className="flex flex-wrap gap-2">
                {(cat.items || []).map((it) => (
                  <span
                    key={it}
                    className="skill-chip px-2.5 py-1 text-xs font-mono rounded-sm"
                  >
                    {it}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
