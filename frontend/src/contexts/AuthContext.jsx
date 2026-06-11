import React, { createContext, useContext, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, formatApiErrorDetail } from "@/lib/api";

const AuthContext = createContext(null);

async function fetchMe() {
  try {
    const { data } = await api.get("/auth/me");
    return data;
  } catch (_e) {
    return false;
  }
}

export function AuthProvider({ children }) {
  const qc = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth-me"],
    queryFn: fetchMe,
    staleTime: 60_000,
    retry: false,
  });

  const [overrideUser, setOverrideUser] = useState(undefined);
  const current = overrideUser !== undefined ? overrideUser : (user ?? null);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      qc.setQueryData(["auth-me"], data);
      setOverrideUser(undefined);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: formatApiErrorDetail(e.response?.data?.detail) || e.message };
    }
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch (_e) { /* ignore */ }
    qc.setQueryData(["auth-me"], false);
    setOverrideUser(false);
  };

  return (
    <AuthContext.Provider value={{ user: current, loading: isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
