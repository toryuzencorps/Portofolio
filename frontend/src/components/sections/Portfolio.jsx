import React from "react";
import { motion } from "framer-motion";
import { useLang } from "@/contexts/LanguageContext";
import { ExternalLink } from "lucide-react";

export default function Portfolio({ data }) {
  const { lang, t } = useLang();
  const items = (data && data.items) || [];

  return (
    <section id="portfolio" className="relative py-24 px-6 lg:px-10" data-testid="section-portfolio">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">{t.sections.portfolio.eyebrow}</p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mt-2">{t.sections.portfolio.title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-8 lg:grid-cols-12 gap-6">
          {items.map((it, idx) => {
            const desc = (it.i18n && (it.i18n[lang] || it.i18n.en)) || "";
            const spans = [
              "md:col-span-5 lg:col-span-7",
              "md:col-span-3 lg:col-span-5",
              "md:col-span-8 lg:col-span-12",
            ];
            return (
              <motion.a
                key={it.id}
                href={it.url || "#"}
                target={it.url && it.url !== "#" ? "_blank" : undefined}
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`group relative overflow-hidden border border-border hover:border-primary/60 transition-all rounded-sm ${spans[idx % spans.length]}`}
                data-testid={`portfolio-item-${idx}`}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                  {it.image && (
                    <img
                      src={it.image}
                      alt={it.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                </div>
                <div className="p-5 absolute inset-x-0 bottom-0">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(it.tags || []).map((tag) => (
                      <span key={tag} className="font-mono text-[10px] uppercase tracking-widest text-primary border border-primary/40 px-2 py-0.5 bg-background/60">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-xl sm:text-2xl font-bold">{it.title}</h3>
                    <ExternalLink className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
