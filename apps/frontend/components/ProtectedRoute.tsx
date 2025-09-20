
"use client";
import {   useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider } from "../app/authContext";
import { LoaderOneDemo } from "./LoaderOneDemo ";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  console.log(token)
  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (!saved) {
      router.push("/login");
    } else {
      setToken(saved);
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return <div><LoaderOneDemo/></div>;
  }

  return <AuthProvider>{children}</AuthProvider>;
}

