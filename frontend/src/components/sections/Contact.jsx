import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/contexts/LanguageContext";
import { Mail, Github, Linkedin, Instagram, Copy, Check, ArrowUpRight, MessageSquare, Send } from "lucide-react";
import SectionShape from "@/components/SectionShape";

const SOCIAL_META = {
  github:    { icon: Github,    label: "GitHub",    handle: "@github",    color: "#FFFFFF" },
  linkedin:  { icon: Linkedin,  label: "LinkedIn",  handle: "in/profile", color: "#0A66C2" },
  instagram: { icon: Instagram, label: "Instagram", handle: "@instagram", color: "#E4405F" },
};

export default function Contact({ data }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const email = data?.email || "hello@example.com";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (_e) { /* ignore */ }
  };

  const socials = ["github", "linkedin", "instagram"]
    .filter((k) => data?.[k])
    .map((k) => ({ key: k, url: data[k], ...SOCIAL_META[k] }));

  return (
    <section id="contact" className="relative py-24 px-6 lg:px-10 overflow-hidden" data-testid="section-contact">
      <SectionShape variant="signal" />
      <div className="max-w-6xl mx-auto relative">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">{t.sections.contact.eyebrow}</p>
          <div className="flex items-baseline gap-3 flex-wrap mt-2">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter">{t.sections.contact.title}</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary inline-flex items-center gap-1">
              <span className="w-4 h-px bg-primary"></span> send →
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-4">
          {/* PRIMARY EMAIL CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-8 relative overflow-hidden border border-border bg-card/40 backdrop-blur-sm rounded-xl p-7 sm:p-10 group"
            data-testid="contact-email-card"
          >
            {/* Decorative gradient blob */}
            <span aria-hidden className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-primary/20 blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
            <span aria-hidden className="absolute inset-0 tech-grid opacity-30 pointer-events-none" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#00FF9D" }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#00FF9D" }} />
                </span>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">// PRIMARY CHANNEL</p>
              </div>

              <h3 className="font-heading text-2xl sm:text-3xl font-bold tracking-tighter mb-2">
                Drop me a line.
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mb-5">
                Open for collaborations, freelance, or just a friendly chat. Usually replies within 24h.
              </p>

              <div className="flex items-center gap-2 p-3 sm:p-4 border border-border bg-background/60 rounded-md font-mono text-sm sm:text-lg group/email">
                <span className="text-primary shrink-0">$</span>
                <span className="text-foreground truncate flex-1" data-testid="contact-email-value">{email}</span>
                <button
                  onClick={copy}
                  data-testid="contact-copy-email-button"
                  aria-label="Copy email"
                  className="shrink-0 p-2 rounded-md border border-border hover:border-primary/60 hover:text-primary transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-5">
                <a
                  href={`mailto:${email}`}
                  data-testid="contact-mail-link"
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest px-4 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
                >
                  <Mail className="w-4 h-4" /> {t.contact.send_message}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={copy}
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest px-4 py-3 border border-border hover:border-primary/60 hover:text-primary rounded-md transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? t.contact.copied : t.contact.copy_email}
                </button>
              </div>
            </div>
          </motion.div>

          {/* SECONDARY — STATUS CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-4 relative overflow-hidden border border-border bg-card/40 backdrop-blur-sm rounded-xl p-6"
            data-testid="contact-status-card"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">// STATUS</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00FF9D" }} />
                <span className="text-foreground/85">Available for new projects</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-foreground/85">Remote · Worldwide</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                <span className="text-foreground/85">Replies in ~24h</span>
              </li>
            </ul>

            <div className="mt-6 pt-5 border-t border-border">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">// PREFER FORUM?</p>
              <button
                onClick={() => document.getElementById("forum")?.scrollIntoView({ behavior: "smooth" })}
                data-testid="contact-forum-cta"
                className="w-full inline-flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-widest px-3 py-2.5 border border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 rounded-md transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Open Forum
              </button>
            </div>
          </motion.div>

          {/* SOCIAL CARDS */}
          {socials.map((s, idx) => (
            <motion.a
              key={s.key}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 + idx * 0.08 }}
              whileHover={{ y: -3 }}
              data-testid={`contact-social-${s.key}`}
              className="lg:col-span-4 relative overflow-hidden border border-border bg-card/40 backdrop-blur-sm rounded-xl p-6 group hover:border-primary/60 transition-colors"
            >
              <span aria-hidden className="absolute -bottom-12 -right-10 w-44 h-44 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" style={{ background: s.color }} />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">// {s.label.toUpperCase()}</p>
                  <h4 className="font-heading text-lg font-bold tracking-tight mt-1">{s.handle}</h4>
                  <p className="text-xs text-muted-foreground mt-2">Click to open profile</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-10 h-10 rounded-md border border-border flex items-center justify-center group-hover:border-primary/50 group-hover:text-primary transition-colors">
                    <s.icon className="w-4 h-4" />
                  </span>
                </div>
              </div>
              <ArrowUpRight className="absolute top-5 right-5 w-4 h-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary transition-all" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
