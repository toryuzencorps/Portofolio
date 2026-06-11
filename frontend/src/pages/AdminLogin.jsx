import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { Terminal, ArrowRight } from "lucide-react";
import TechBackground from "@/components/TechBackground";

export default function AdminLogin() {
  const { login, user } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.role === "admin") navigate("/admin", { replace: true });
  }, [user, navigate]);

  if (user && user.role === "admin") return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);
    if (!res.ok) setError(res.error);
    else navigate("/admin", { replace: true });
  };

  return (
    <>
      <TechBackground />
      <div className="min-h-screen flex items-center justify-center px-6 py-20" data-testid="admin-login-page">
        <div className="w-full max-w-md">
          <div className="terminal rounded-md p-8 noise relative">
            <div className="flex items-center gap-2 mb-6">
              <Terminal className="w-5 h-5 text-primary" />
              <h1 className="font-heading text-2xl font-bold">{t.admin.login}</h1>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t.admin.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="admin-login-email"
                  required
                  autoFocus
                  className="w-full mt-1.5 bg-transparent border border-border px-3 py-2.5 font-mono text-sm focus:outline-none focus:border-primary"
                  placeholder="admin@portfolio.dev"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t.admin.password}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="admin-login-password"
                  required
                  className="w-full mt-1.5 bg-transparent border border-border px-3 py-2.5 font-mono text-sm focus:outline-none focus:border-primary"
                  placeholder="••••••••"
                />
              </div>
              {error && (
                <p className="font-mono text-xs text-destructive" data-testid="admin-login-error">{error}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                data-testid="admin-login-submit"
                className="w-full font-mono text-xs uppercase tracking-widest px-4 py-3 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? "..." : t.admin.sign_in}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-6">
              hint: admin@portfolio.dev / admin123
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
