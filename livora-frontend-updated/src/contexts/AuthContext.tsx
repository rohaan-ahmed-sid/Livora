// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "@/lib/api";

interface User {
  id: number;
  email: string;
  name: string;
  diabetes_type?: string;
  target_glucose_min?: number;
  target_glucose_max?: number;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Record<string, unknown>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: rehydrate from localStorage
  useEffect(() => {
    const token = localStorage.getItem("livora_token");
    if (!token) { setLoading(false); return; }
    authApi.getMe()
      .then((res) => setUser(res.data))
      .catch(() => { localStorage.removeItem("livora_token"); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    localStorage.setItem("livora_token", data.access_token);
    const me = await authApi.getMe();
    setUser(me.data);
  };

  const register = async (email: string, name: string, password: string) => {
    const { data } = await authApi.register(email, name, password);
    localStorage.setItem("livora_token", data.access_token);
    const me = await authApi.getMe();
    setUser(me.data);
  };

  const logout = () => {
    localStorage.removeItem("livora_token");
    setUser(null);
  };

  const updateUser = async (data: Record<string, unknown>) => {
    // Remove undefined values but keep empty strings and nulls
    const cleaned = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );
    const res = await authApi.updateMe(cleaned);
    setUser(res.data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
