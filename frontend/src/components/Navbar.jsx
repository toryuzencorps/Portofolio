import React, { useState, useRef, useLayoutEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveSection } from "@/hooks/useActiveSection";
import { Moon, Sun, Languages, Terminal, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const SECTION_IDS = ["summary", "skills", "experience", "portfolio", "education", "forum", "contact"];

export default function Navbar() {
  const { lang, toggle: toggleLang, t } = useLang();
  const { theme, toggle: toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { id: "summary", label: t.nav.summary },
    { id: "skills", label: t.nav.skills },
    { id: "experience", label: t.nav.experience },
    { id: "portfolio", label: t.nav.portfolio },
    { id: "education", label: t.nav.education },
    { id: "forum", label: t.nav.forum },
    { id: "contact", label: t.nav.contact },
  ];

  const isAdminPage = location.pathname.startsWith("/admin");
  const active = useActiveSection(isAdminPage ? [] : SECTION_IDS);

  // sliding pill indicator
  const navRef = useRef(null);
  const itemRefs = useRef({});
  const [pill, setPill] = useState({ left: 0, width: 0, visible: false });

  useLayoutEffect(() => {
    if (isAdminPage) return;
    const el = itemRefs.current[active];
    const container = navRef.current;
    if (el && container) {
      const cRect = container.getBoundingClientRect();
      const eRect = el.getBoundingClientRect();
      setPill({ left: eRect.left - cRect.left, width: eRect.width, visible: true });
    } else {
      setPill((p) => ({ ...p, visible: false }));
    }
  }, [active, isAdminPage, lang]);

  const scrollTo = (id) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="fixed top-3 inset-x-0 z-50 flex justify-center px-3" data-testid="navbar">
      <div className="liquid-glass w-full max-w-6xl">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 group shrink-0" data-testid="nav-logo">
            <span className="relative inline-flex">
              <Terminal className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform duration-300" />
              <span className="absolute -inset-1 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="font-mono text-sm tracking-tight hidden sm:inline">
              <span className="text-primary">~/</span>portfolio<span className="text-muted-foreground">.dev</span>
            </span>
          </Link>

          {!isAdminPage && (
            <nav ref={navRef} className="hidden lg:flex items-center relative">
              {pill.visible && (
                <span
                  aria-hidden
                  className="absolute top-1/2 -translate-y-1/2 h-9 rounded-full liquid-pill transition-all duration-500 ease-out"
                  style={{ left: pill.left, width: pill.width }}
                />
              )}
              {links.map((l) => (
                <button
                  key={l.id}
                  ref={(el) => { itemRefs.current[l.id] = el; }}
                  onClick={() => scrollTo(l.id)}
                  data-testid={`nav-link-${l.id}`}
                  data-active={active === l.id}
                  className={`relative z-10 font-mono text-[11px] uppercase tracking-[0.18em] px-3.5 py-2.5 transition-colors duration-300 ${active === l.id ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {l.label}
                </button>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={toggleLang}
              data-testid="lang-toggle-button"
              className="liquid-chip hidden sm:flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest px-2.5 py-1.5"
              aria-label="Toggle language"
            >
              <Languages className="w-3.5 h-3.5" />
              {lang.toUpperCase()}
            </button>
            <button
              onClick={toggleTheme}
              data-testid="theme-toggle-button"
              className="liquid-chip p-2"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {user && user.role === "admin" ? (
              <>
                <Link to="/admin" data-testid="nav-admin-link">
                  <Button size="sm" variant="ghost" className="font-mono text-[10px] uppercase tracking-widest h-8 px-3 hover:text-primary">
                    {t.nav.admin}
                  </Button>
                </Link>
                <button
                  onClick={logout}
                  data-testid="nav-logout-button"
                  className="liquid-chip p-2 hover:text-destructive"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link to="/admin/login" data-testid="nav-admin-login-link" className="hidden sm:inline-flex">
                <Button size="sm" variant="ghost" className="font-mono text-[10px] uppercase tracking-widest h-8 px-3 hover:text-primary">
                  {t.nav.admin}
                </Button>
              </Link>
            )}
            {!isAdminPage && (
              <button
                onClick={() => setOpen((o) => !o)}
                data-testid="nav-mobile-toggle"
                className="lg:hidden liquid-chip p-2"
                aria-label="Menu"
              >
                {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {open && !isAdminPage && (
          <div className="lg:hidden border-t border-white/10 px-3 pb-3 pt-2">
            <div className="grid grid-cols-2 gap-1.5">
              {links.map((l) => (
                <button
                  key={l.id}
                  onClick={() => scrollTo(l.id)}
                  data-testid={`nav-mobile-link-${l.id}`}
                  className={`liquid-chip font-mono text-[10px] uppercase tracking-widest p-2.5 text-left ${active === l.id ? "text-primary border-primary/40" : ""}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
