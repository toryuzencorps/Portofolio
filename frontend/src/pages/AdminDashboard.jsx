import React, { useState, useMemo } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { useContent } from "@/hooks/useContent";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import {
  LogOut, Save, ExternalLink, AlertCircle, Check, Sparkles,
  User, Wrench, Briefcase, FolderKanban, GraduationCap, Mail,
  FileJson, Wand2, RotateCcw, ChevronRight, Folder,
} from "lucide-react";
import FileManager from "@/components/admin/FileManager";

const SECTIONS = [
  { id: "summary",    icon: User,          tint: "#00F0FF" },
  { id: "skills",     icon: Wrench,        tint: "#A855F7" },
  { id: "experience", icon: Briefcase,     tint: "#F59E0B" },
  { id: "portfolio",  icon: FolderKanban,  tint: "#10B981" },
  { id: "education",  icon: GraduationCap, tint: "#3B82F6" },
  { id: "contact",    icon: Mail,          tint: "#EC4899" },
];

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const { t } = useLang();
  const { content, loading: cLoading, refresh } = useContent();
  const [active, setActive] = useState("summary");
  const [view, setView] = useState("content"); // 'content' | 'files'
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [drafts, setDrafts] = useState({});

  const baseStr = useMemo(
    () => (content ? JSON.stringify(content[active] || {}, null, 2) : ""),
    [content, active]
  );
  const draft = drafts[active] ?? baseStr;
  const isDirty = drafts[active] !== undefined && drafts[active] !== baseStr;

  const setDraft = (val) => setDrafts((d) => ({ ...d, [active]: val }));
  const changeSection = (s) => { setActive(s); setError(""); };

  // JSON validity status
  const jsonStatus = useMemo(() => {
    if (!draft.trim()) return { ok: false, msg: "Empty document" };
    try { JSON.parse(draft); return { ok: true, msg: "Valid JSON" }; }
    catch (e) { return { ok: false, msg: e.message }; }
  }, [draft]);

  const lineCount = draft.split("\n").length;
  const charCount = draft.length;

  if (loading || cLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="admin-loading">
        <div className="font-mono text-xs uppercase tracking-widest text-primary caret">Authenticating</div>
      </div>
    );
  }
  if (!user || user.role !== "admin") return <Navigate to="/admin/login" replace />;

  const save = async () => {
    setError(""); setSaving(true);
    try {
      const parsed = JSON.parse(draft);
      await api.put(`/content/${active}`, { data: parsed });
      await refresh();
      setDrafts((d) => { const { [active]: _, ...rest } = d; return rest; });
      toast.success(`Saved /${active}`, { description: "Content updated successfully" });
    } catch (e) {
      const msg = e instanceof SyntaxError
        ? `JSON Syntax error: ${e.message}`
        : (e.response?.data?.detail || e.message || "Save failed");
      setError(msg);
      toast.error("Save failed", { description: msg });
    } finally { setSaving(false); }
  };

  const formatJson = () => {
    try {
      const pretty = JSON.stringify(JSON.parse(draft), null, 2);
      setDraft(pretty);
      toast.success("Formatted");
    } catch (e) {
      toast.error("Cannot format invalid JSON");
    }
  };

  const resetDraft = () => {
    setDrafts((d) => { const { [active]: _, ...rest } = d; return rest; });
    toast.info(`Reverted /${active} to saved version`);
  };

  const activeMeta = SECTIONS.find((s) => s.id === active);
  const ActiveIcon = activeMeta?.icon || Sparkles;
  const tint = activeMeta?.tint || "#00F0FF";

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 px-6 lg:px-10 min-h-screen" data-testid="admin-dashboard">
        <div className="max-w-7xl mx-auto">
          {/* Top header */}
          <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-primary">// ADMIN CMS</span>
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tighter">{t.admin.dashboard}</h1>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                Signed in as <span className="text-foreground">{user.email}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/" data-testid="admin-view-site-link">
                <button className="font-mono text-xs uppercase tracking-widest px-4 py-2.5 border border-border hover:border-primary/60 hover:text-primary rounded-md flex items-center gap-2 transition-colors">
                  View site <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </Link>
              <button
                onClick={logout}
                data-testid="admin-logout-button"
                className="font-mono text-xs uppercase tracking-widest px-4 py-2.5 border border-border hover:border-destructive hover:text-destructive rounded-md flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> {t.admin.logout}
              </button>
            </div>
          </div>

          {/* Top tabs: Content / Files */}
          <div className="flex items-center gap-2 mb-6 border-b border-border" data-testid="admin-top-tabs">
            <button
              onClick={() => setView("content")}
              data-testid="admin-tab-content"
              className={`px-4 py-2.5 font-mono text-xs uppercase tracking-widest flex items-center gap-2 border-b-2 transition-colors ${view === "content" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <FileJson className="w-3.5 h-3.5" /> Content
            </button>
            <button
              onClick={() => setView("files")}
              data-testid="admin-tab-files"
              className={`px-4 py-2.5 font-mono text-xs uppercase tracking-widest flex items-center gap-2 border-b-2 transition-colors ${view === "files" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <Folder className="w-3.5 h-3.5" /> Files
            </button>
          </div>

          {view === "files" ? (
            <FileManager />
          ) : (
          <>
          <div className="grid lg:grid-cols-12 gap-4">
            {/* SIDEBAR */}
            <aside className="lg:col-span-3 space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground px-1 mb-2">// SECTIONS</p>
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                const dirty = drafts[s.id] !== undefined && drafts[s.id] !== JSON.stringify(content?.[s.id] || {}, null, 2);
                const isActive = active === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => changeSection(s.id)}
                    data-testid={`admin-section-tab-${s.id}`}
                    className={`w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 border transition-all group ${
                      isActive
                        ? "border-primary/60 bg-primary/5"
                        : "border-border hover:border-primary/30 bg-card/40"
                    }`}
                  >
                    <span
                      className="w-9 h-9 rounded-md flex items-center justify-center border shrink-0"
                      style={{
                        borderColor: isActive ? s.tint : "hsl(var(--border))",
                        background: isActive ? `${s.tint}15` : "hsl(var(--background) / 0.4)",
                        color: isActive ? s.tint : "hsl(var(--muted-foreground))",
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-heading text-sm font-semibold tracking-tight capitalize ${isActive ? "text-foreground" : "text-foreground/80"}`}>
                        {s.id}
                      </p>
                      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                        /{s.id}
                      </p>
                    </div>
                    {dirty && (
                      <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" title="Unsaved changes" />
                    )}
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "text-primary" : "text-muted-foreground opacity-0 group-hover:opacity-100"}`} />
                  </button>
                );
              })}
            </aside>

            {/* EDITOR */}
            <section className="lg:col-span-9 border border-border bg-card/40 backdrop-blur-sm rounded-xl overflow-hidden">
              {/* Editor header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-background/30">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-10 h-10 rounded-md flex items-center justify-center border shrink-0"
                    style={{ borderColor: `${tint}55`, background: `${tint}15`, color: tint }}
                  >
                    <ActiveIcon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-heading text-base font-bold tracking-tight capitalize" data-testid="admin-editor-section-title">
                      {active}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground truncate">
                      /api/content/{active} · {lineCount} lines · {charCount} chars
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={formatJson}
                    data-testid="admin-format-button"
                    className="font-mono text-[10px] uppercase tracking-widest px-3 py-2 border border-border hover:border-primary/60 hover:text-primary rounded-md flex items-center gap-1.5 transition-colors"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Format
                  </button>
                  <button
                    onClick={resetDraft}
                    disabled={!isDirty}
                    data-testid="admin-reset-button"
                    className="font-mono text-[10px] uppercase tracking-widest px-3 py-2 border border-border hover:border-destructive hover:text-destructive rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                  <button
                    onClick={save}
                    disabled={saving || !jsonStatus.ok || !isDirty}
                    data-testid="admin-save-button"
                    className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md flex items-center gap-1.5 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? "Saving…" : t.admin.save}
                  </button>
                </div>
              </div>

              {/* Editor body */}
              <div className="relative">
                <div className="grid grid-cols-[42px_1fr] font-mono text-xs leading-6">
                  {/* line numbers */}
                  <div className="select-none text-right pr-2 py-4 bg-background/40 border-r border-border text-muted-foreground/60 text-[11px]">
                    {Array.from({ length: lineCount }, (_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    spellCheck={false}
                    data-testid="admin-editor-textarea"
                    className="w-full min-h-[60vh] bg-transparent border-0 p-4 font-mono text-xs leading-6 focus:outline-none resize-none"
                    style={{ tabSize: 2 }}
                  />
                </div>
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-background/30 text-xs">
                <div className="flex items-center gap-3">
                  <FileJson className="w-3.5 h-3.5 text-muted-foreground" />
                  <span
                    className={`font-mono uppercase tracking-widest text-[10px] flex items-center gap-1.5 ${jsonStatus.ok ? "text-primary" : "text-destructive"}`}
                    data-testid="admin-json-status"
                  >
                    {jsonStatus.ok ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {jsonStatus.msg}
                  </span>
                  {isDirty && (
                    <span className="font-mono text-[10px] uppercase tracking-widest text-yellow-500 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Unsaved
                    </span>
                  )}
                </div>
                {error && (
                  <p className="font-mono text-[10px] text-destructive truncate max-w-md flex items-center gap-1.5" data-testid="admin-error">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {error}
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Help / Tips */}
          <div className="mt-6 border border-border bg-card/40 rounded-xl p-5 backdrop-blur-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-2">// QUICK TIPS</p>
            <div className="grid sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div>
                <strong className="text-foreground/90">Bilingual content.</strong> Add `i18n: {`{en, id}`}` for any field that needs translation.
              </div>
              <div>
                <strong className="text-foreground/90">Upload images.</strong> Go to the <em>Files</em> tab to upload and get a URL.
              </div>
              <div>
                <strong className="text-foreground/90">Unsaved indicator.</strong> The yellow dot shows which sections still have pending changes.
              </div>
            </div>
          </div>
          </>
          )}
        </div>
      </main>
    </>
  );
}
