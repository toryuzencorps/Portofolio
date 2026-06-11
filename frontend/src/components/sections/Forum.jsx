import React, { useEffect, useRef, useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { api, wsUrl } from "@/lib/api";
import { Send, Trash2 } from "lucide-react";
import SectionShape from "@/components/SectionShape";

function fmtTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

export default function Forum() {
  const { t } = useLang();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [nickname, setNickname] = useState(() => localStorage.getItem("forum_nick") || "");
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const wsRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    api.get("/forum/messages").then((r) => setMessages(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    function connect() {
      try {
        const ws = new WebSocket(wsUrl("/api/ws/forum"));
        wsRef.current = ws;
        ws.onopen = () => { if (alive) setConnected(true); };
        ws.onclose = () => {
          if (alive) {
            setConnected(false);
            setTimeout(connect, 2000);
          }
        };
        ws.onerror = () => {
          try { ws.close(); } catch (_e) { /* ignore */ }
        };
        ws.onmessage = (ev) => {
          try {
            const msg = JSON.parse(ev.data);
            if (msg.type === "message") {
              setMessages((prev) => [...prev, msg.data]);
            } else if (msg.type === "delete") {
              setMessages((prev) => prev.filter((m) => m.id !== msg.id));
            }
          } catch (_e) { /* ignore */ }
        };
      } catch (_e) {
        setTimeout(connect, 2000);
      }
    }
    connect();
    return () => {
      alive = false;
      try { wsRef.current?.close(); } catch (_e) { /* ignore */ }
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => { localStorage.setItem("forum_nick", nickname); }, [nickname]);

  const send = async (e) => {
    e?.preventDefault();
    if (!nickname.trim() || !text.trim() || sending) return;
    setSending(true);
    try {
      await api.post("/forum/messages", { nickname: nickname.trim(), message: text.trim() });
      setText("");
    } catch (_e) {
      /* ignore */
    } finally { setSending(false); }
  };

  const remove = async (id) => {
    if (!user || user.role !== "admin") return;
    try { await api.delete(`/forum/messages/${id}`); } catch (_e) { /* ignore */ }
  };

  return (
    <section id="forum" className="relative py-24 px-6 lg:px-10 overflow-hidden" data-testid="section-forum">
      <SectionShape variant="hexagon" />
      <div className="max-w-7xl mx-auto relative">
        <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">{t.sections.forum.eyebrow}</p>
            <div className="flex items-baseline gap-3 flex-wrap mt-2">
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter">{t.sections.forum.title}</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary"><span className="text-primary">$</span> chat --live</span>
            </div>
          </div>
          <span
            className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border ${connected ? "border-primary/60 text-primary" : "border-border text-muted-foreground"}`}
            data-testid="forum-status"
          >
            {connected ? t.forum.connected : t.forum.disconnected}
          </span>
        </div>

        <div className="terminal rounded-md overflow-hidden" data-testid="forum-window">
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-primary/30 bg-background/40">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#00FF9D" }} />
            <span className="ml-2 font-mono text-[10px] text-muted-foreground">~/forum/realtime --anon</span>
          </div>

          <div ref={scrollRef} className="h-[420px] overflow-y-auto p-5 space-y-2 text-xs sm:text-sm" data-testid="forum-messages">
            {messages.length === 0 ? (
              <p className="text-muted-foreground">{t.forum.empty}</p>
            ) : messages.map((m) => (
              <div key={m.id} className="font-mono group flex items-start gap-2" data-testid={`forum-msg-${m.id}`}>
                <span className="text-muted-foreground shrink-0">[{fmtTime(m.created_at)}]</span>
                <span className="text-primary shrink-0">{m.nickname}</span>
                <span className="text-muted-foreground shrink-0">$</span>
                <span className="text-foreground break-words">{m.message}</span>
                {user && user.role === "admin" && (
                  <button
                    onClick={() => remove(m.id)}
                    data-testid={`forum-delete-${m.id}`}
                    className="opacity-0 group-hover:opacity-100 text-destructive ml-auto shrink-0"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={send} className="border-t border-primary/30 p-3 flex items-center gap-2 bg-background/40" data-testid="forum-form">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, 40))}
              placeholder={t.forum.placeholder_name}
              data-testid="forum-input-nickname"
              className="font-mono text-xs bg-transparent border border-border px-3 py-2 w-32 sm:w-40 focus:outline-none focus:border-primary"
              required
            />
            <span className="font-mono text-xs text-primary">$</span>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 500))}
              placeholder={t.forum.placeholder_message}
              data-testid="forum-input-message"
              className="font-mono text-xs bg-transparent border border-border px-3 py-2 flex-1 min-w-0 focus:outline-none focus:border-primary"
              required
            />
            <button
              type="submit"
              data-testid="forum-send-button"
              disabled={sending || !nickname.trim() || !text.trim()}
              className="font-mono text-xs uppercase tracking-widest px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.forum.send}</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
