import React, { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { useContent } from "@/hooks/useContent";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { LogOut, Save, Check, AlertCircle, ExternalLink } from "lucide-react";

const SECTIONS = ["summary", "skills", "experience", "portfolio", "education", "contact"];

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const { t } = useLang();
  const { content, loading: cLoading, refresh } = useContent();
  const [active, setActive] = useState("summary");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [drafts, setDrafts] = useState({});

  const draft = drafts[active] ?? (content ? JSON.stringify(content[active] || {}, null, 2) : "");
  const setDraft = (val) => setDrafts((d) => ({ ...d, [active]: val }));
  const changeSection = (s) => { setActive(s); setError(""); setSaved(false); };

  if (loading || cLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="admin-loading">
        <div className="font-mono text-xs uppercase tracking-widest text-primary caret">Authenticating</div>
      </div>
    );
  }
  if (!user || user.role !== "admin") return <Navigate to="/admin/login" replace />;

  const save = async () => {
    setError(""); setSaved(false); setSaving(true);
    try {
      const parsed = JSON.parse(draft);
      await api.put(`/content/${active}`, { data: parsed });
      await refresh();
      setDrafts((d) => { const { [active]: _, ...rest } = d; return rest; });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      if (e instanceof SyntaxError) setError(`JSON Syntax error: ${e.message}`);
      else setError(e.response?.data?.detail || e.message || "Save failed");
    } finally { setSaving(false); }
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-6 lg:px-10 min-h-screen" data-testid="admin-dashboard">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">// ADMIN CMS</p>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tighter mt-2">{t.admin.dashboard}</h1>
              <p className="font-mono text-xs text-muted-foreground mt-1">Signed in as <span className="text-primary">{user.email}</span></p>
            </div>
            <div className="flex gap-2">
              <Link to="/" data-testid="admin-view-site-link">
                <button className="font-mono text-xs uppercase tracking-widest px-4 py-2.5 border border-border hover:border-primary/60 hover:text-primary flex items-center gap-2">
                  View site <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </Link>
              <button
                onClick={logout}
                data-testid="admin-logout-button"
                className="font-mono text-xs uppercase tracking-widest px-4 py-2.5 border border-border hover:border-destructive hover:text-destructive flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" /> {t.admin.logout}
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-4">
            <aside className="lg:col-span-3 space-y-1">
              {SECTIONS.map((s, i) => (
                <button
                  key={s}
                  onClick={() => changeSection(s)}
                  data-testid={`admin-section-tab-${s}`}
                  className={`w-full text-left px-4 py-3 font-mono text-xs uppercase tracking-widest border transition-colors ${active === s ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}
                >
                  <span className="text-[10px] opacity-60 mr-2">[{String(i + 1).padStart(2, "0")}]</span>
                  {s}
                </button>
              ))}
            </aside>

            <section className="lg:col-span-9 border border-border bg-card/40 rounded-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {t.admin.edit_section}: <span className="text-primary">/{active}</span>
                </p>
                <div className="flex items-center gap-2">
                  {saved && (
                    <span className="font-mono text-xs text-primary flex items-center gap-1" data-testid="admin-saved-indicator">
                      <Check className="w-3.5 h-3.5" /> {t.admin.saved}
                    </span>
                  )}
                  <button
                    onClick={save}
                    disabled={saving}
                    data-testid="admin-save-button"
                    className="font-mono text-xs uppercase tracking-widest px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" /> {saving ? "..." : t.admin.save}
                  </button>
                </div>
              </div>

              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                spellCheck={false}
                data-testid="admin-editor-textarea"
                className="w-full h-[60vh] bg-background/60 border border-border p-4 font-mono text-xs leading-relaxed focus:outline-none focus:border-primary/60 resize-none"
              />

              {error && (
                <p className="font-mono text-xs text-destructive mt-3 flex items-center gap-2" data-testid="admin-error">
                  <AlertCircle className="w-3.5 h-3.5" /> {error}
                </p>
              )}

              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-4">
                tip: edit the JSON above and hit save. invalid JSON will be rejected.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
