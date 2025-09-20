"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // ✅ Setup axios interceptor once
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      const stored = localStorage.getItem("token");
      if (stored) {
        config.headers.Authorization = stored;
      }
      return config;
    });
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // ✅ Restore token from localStorage + validate with backend
  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (saved) {
      axios
        .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/me`, {
          headers: { Authorization: saved },
        })
        .then(() => setToken(saved))
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
          router.push("/login");
        });
    }
  }, [router]);

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
