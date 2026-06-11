import React from "react";
import Navbar from "@/components/Navbar";
import TechBackground from "@/components/TechBackground";
import Summary from "@/components/sections/Summary";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import Portfolio from "@/components/sections/Portfolio";
import Education from "@/components/sections/Education";
import Contact from "@/components/sections/Contact";
import Forum from "@/components/sections/Forum";
import { useContent } from "@/hooks/useContent";
import { useLang } from "@/contexts/LanguageContext";

export default function PortfolioPage() {
  const { content, loading } = useContent();
  const { t } = useLang();

  if (loading || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="portfolio-loading">
        <div className="font-mono text-xs uppercase tracking-widest text-primary caret">Loading</div>
      </div>
    );
  }

  return (
    <>
      <TechBackground />
      <Navbar />
      <main className="relative">
        <Summary data={content.summary} />
        <Skills data={content.skills} />
        <Experience data={content.experience} />
        <Portfolio data={content.portfolio} />
        <Education data={content.education} />
        <Forum />
        <Contact data={content.contact} />
        <footer className="border-t border-border py-10 px-6 lg:px-10 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-mono text-xs text-muted-foreground" data-testid="footer-credit">
              Made By <span className="text-primary font-semibold">Ryuzen</span>
              <span className="mx-2 text-muted-foreground/40">|</span>
              <span className="uppercase tracking-widest">MY CV</span>
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">© {new Date().getFullYear()} · v1.0.0</p>
          </div>
        </footer>
      </main>
    </>
  );
}
