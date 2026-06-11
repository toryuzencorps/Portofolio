import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/contexts/LanguageContext";
import { Mail, Github, Linkedin, Twitter, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Contact({ data }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const email = data?.email || "hello@example.com";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) { /* ignore */ }
  };

  const socials = [
    { icon: Github, url: data?.github, label: "GitHub", key: "github" },
    { icon: Linkedin, url: data?.linkedin, label: "LinkedIn", key: "linkedin" },
    { icon: Twitter, url: data?.twitter, label: "Twitter", key: "twitter" },
  ].filter((s) => s.url);

  return (
    <section id="contact" className="relative py-24 px-6 lg:px-10" data-testid="section-contact">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">{t.sections.contact.eyebrow}</p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mt-2">{t.sections.contact.title}</h2>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-2 gap-8 items-center"
        >
          <div className="space-y-6">
            <div className="terminal p-6 rounded-md noise relative">
              <p className="font-mono text-xs text-muted-foreground mb-2">$ echo $EMAIL</p>
              <p className="font-mono text-lg sm:text-xl text-primary break-all">{email}</p>
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={copy}
                  data-testid="contact-copy-email-button"
                  className="font-mono text-xs uppercase tracking-widest rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? t.contact.copied : t.contact.copy_email}
                </Button>
                <a href={`mailto:${email}`} data-testid="contact-mail-link">
                  <Button variant="outline" className="font-mono text-xs uppercase tracking-widest rounded-none border-border hover:border-primary hover:text-primary">
                    <Mail className="w-4 h-4 mr-1" /> {t.contact.send_message}
                  </Button>
                </a>
              </div>
            </div>
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.key}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  data-testid={`contact-social-${s.key}`}
                  className="p-3 border border-border hover:border-primary/60 hover:text-primary transition-colors rounded-sm"
                >
                  <s.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          <div className="hidden lg:flex justify-center">
            <div className="font-mono text-xs text-muted-foreground/60 leading-relaxed max-w-md">
              <p>{`> Looking for a collaborator, hire, or just want to say hi? Drop a message — usually replies within 24h.`}</p>
              <p className="mt-2 text-primary/60">{`> connecting...`}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
