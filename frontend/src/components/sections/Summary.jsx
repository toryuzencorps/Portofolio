import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

export default function Summary({ data }) {
  const { lang, t } = useLang();
  const i18n = (data && data.i18n) || {};
  const content = i18n[lang] || i18n.en || {};

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="summary" className="relative min-h-screen pt-32 pb-20 px-6 lg:px-10 overflow-hidden" data-testid="section-summary">
      <span aria-hidden className="absolute top-32 right-4 lg:right-12 font-heading font-black text-[140px] sm:text-[200px] lg:text-[260px] leading-none tracking-tighter select-none pointer-events-none z-0 watermark-num">01</span>
      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="grid lg:grid-cols-12 gap-8 items-start"
        >
          <div className="lg:col-span-8 space-y-6">
            {content.available && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-primary/40 bg-primary/5 rounded-full" data-testid="availability-badge">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" style={{ background: "#00FF9D" }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#00FF9D" }} />
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-primary">{t.hero.available}</span>
              </div>
            )}
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">{t.sections.summary.eyebrow}</p>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-black leading-[0.95] tracking-tighter">
              {content.name || "Your Name"}
              <span className="block text-primary text-glow caret">{content.title || "Title"}</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              {content.tagline}
            </p>
            <p className="text-base text-muted-foreground/80 max-w-2xl leading-relaxed">
              {content.bio}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                size="lg"
                onClick={() => scrollTo("portfolio")}
                data-testid="hero-view-work-button"
                className="font-mono uppercase tracking-widest text-xs rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {t.hero.view_work} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollTo("contact")}
                data-testid="hero-contact-button"
                className="font-mono uppercase tracking-widest text-xs rounded-none border-border hover:border-primary hover:text-primary"
              >
                {t.hero.contact_me}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="terminal rounded-md p-5 noise relative overflow-hidden" data-testid="hero-terminal">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-success/70" style={{ background: "#00FF9D" }} />
                <span className="ml-2 text-[10px] text-muted-foreground">~/whoami</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <p><span className="terminal-prompt">$</span> <span className="text-foreground">cat profile.json</span></p>
                <p className="terminal-line">{`{`}</p>
                <p className="terminal-line">{`  "name": "${content.name || "—"}",`}</p>
                <p className="terminal-line">{`  "role": "${content.title || "—"}",`}</p>
                {content.location && (
                  <p className="terminal-line">{`  "loc": "${content.location}",`}</p>
                )}
                <p className="terminal-line">{`  "status": "${content.available ? "online" : "offline"}"`}</p>
                <p className="terminal-line">{`}`}</p>
                <p className="pt-2"><span className="terminal-prompt">$</span> <span className="caret"></span></p>
              </div>
            </div>
            {content.location && (
              <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                {content.location}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
