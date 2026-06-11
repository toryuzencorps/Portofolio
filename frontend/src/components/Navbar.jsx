import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Moon, Sun, Languages, Terminal, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const scrollTo = (id) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="glass fixed top-0 inset-x-0 z-50" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group" data-testid="nav-logo">
          <Terminal className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform" />
          <span className="font-mono text-sm tracking-tight">
            <span className="text-primary">~/</span>portfolio<span className="text-muted-foreground">.dev</span>
          </span>
        </Link>

        {!isAdminPage && (
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                data-testid={`nav-link-${l.id}`}
                className="font-mono text-xs uppercase tracking-widest px-3 py-2 text-muted-foreground hover:text-primary transition-colors"
              >
                {l.label}
              </button>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            data-testid="lang-toggle-button"
            className="hidden sm:flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest px-3 py-2 border border-border rounded-sm hover:border-primary/60 hover:text-primary transition-colors"
            aria-label="Toggle language"
          >
            <Languages className="w-3.5 h-3.5" />
            {lang.toUpperCase()}
          </button>
          <button
            onClick={toggleTheme}
            data-testid="theme-toggle-button"
            className="p-2 border border-border rounded-sm hover:border-primary/60 hover:text-primary transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {user && user.role === "admin" ? (
            <>
              <Link to="/admin" data-testid="nav-admin-link">
                <Button size="sm" variant="outline" className="font-mono text-xs uppercase tracking-widest">
                  {t.nav.admin}
                </Button>
              </Link>
              <button
                onClick={logout}
                data-testid="nav-logout-button"
                className="p-2 border border-border rounded-sm hover:border-destructive hover:text-destructive transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link to="/admin/login" data-testid="nav-admin-login-link">
              <Button size="sm" variant="ghost" className="font-mono text-xs uppercase tracking-widest hidden sm:inline-flex">
                {t.nav.admin}
              </Button>
            </Link>
          )}
          {!isAdminPage && (
            <button
              onClick={() => setOpen((o) => !o)}
              data-testid="nav-mobile-toggle"
              className="lg:hidden p-2 border border-border rounded-sm"
              aria-label="Menu"
            >
              {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {open && !isAdminPage && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="px-6 py-4 grid grid-cols-2 gap-2">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                data-testid={`nav-mobile-link-${l.id}`}
                className="font-mono text-xs uppercase tracking-widest p-3 text-left border border-border hover:border-primary/60 hover:text-primary transition-colors"
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
