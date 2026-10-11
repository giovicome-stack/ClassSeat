import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { formatApiErrorDetail } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null=checking, false=guest, obj=authed
  const [error, setError] = useState("");

  const checkMe = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      setUser(false);
    }
  }, []);

  useEffect(() => {
    checkMe();
  }, [checkMe]);

  const login = async (email, password) => {
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data.token) localStorage.setItem("csm_token", data.token);
      setUser({ id: data.id, email: data.email, name: data.name });
      return true;
    } catch (e) {
      setError(formatApiErrorDetail(e.response?.data?.detail) || e.message);
      return false;
    }
  };

  const register = async (email, password, name) => {
    setError("");
    try {
      const { data } = await api.post("/auth/register", { email, password, name });
      if (data.token) localStorage.setItem("csm_token", data.token);
      setUser({ id: data.id, email: data.email, name: data.name });
      return true;
    } catch (e) {
      setError(formatApiErrorDetail(e.response?.data?.detail) || e.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    localStorage.removeItem("csm_token");
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
