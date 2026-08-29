"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Lock, ShieldCheck } from "lucide-react";
import AdminSidebar from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginBusy, setLoginBusy] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      fetch("/api/auth/verify?token=" + encodeURIComponent(token))
        .then((r) => r.json())
        .then((d) => {
          if (d.valid) setAuthed(true);
          else localStorage.removeItem("admin_token");
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.body.classList.add("admin-mode");
    return () => document.body.classList.remove("admin-mode");
  }, []);

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault();
    setLoginBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_role", data.role || "");
        localStorage.setItem("admin_username", data.username || "");
        setAuthed(true);
        setPassword("");
      } else {
        setError(data.error || "Error de autenticación");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoginBusy(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_role");
    localStorage.removeItem("admin_username");
    setAuthed(false);
    setSidebarOpen(false);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#081320", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#6d88a3", fontSize: "0.9rem" }}>Cargando...</div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundImage: "url(/fondo.avif)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(105deg, rgba(0,0,0,0.9), rgba(0,0,0,0.72) 55%, rgba(0,0,0,0.55))",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: "400px",
            backgroundColor: "rgba(15,31,51,0.92)",
            border: "1px solid var(--admin-border)",
            borderRadius: "1.25rem",
            padding: "2.25rem",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid #fff",
                backgroundColor: "#fff",
                margin: "0 auto 1rem",
                boxShadow: "0 14px 34px rgba(0,0,0,0.45)",
              }}
            >
              <Image src="/logo-square.jpg" alt="USB" width={84} height={84} style={{ objectFit: "cover" }} />
            </div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", fontFamily: "var(--font-display)", margin: "0 0 0.25rem" }}>
              Universidad Superior Bajío
            </h1>
            <p style={{ color: "var(--admin-text-muted)", fontSize: "0.8rem", margin: 0 }}>
              Panel de administración
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.78rem", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
              Usuario
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tu usuario"
                className="input-field"
                autoFocus
                autoComplete="username"
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.78rem", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
              Contraseña
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="input-field"
                autoComplete="current-password"
              />
            </label>
            {error && (
              <p style={{ color: "#e08b8b", fontSize: "0.8rem", margin: 0, backgroundColor: "rgba(224,139,139,0.1)", border: "1px solid rgba(224,139,139,0.3)", borderRadius: "0.5rem", padding: "0.6rem 0.75rem" }}>{error}</p>
            )}
            <button
              type="submit"
              disabled={loginBusy || !username || !password}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.75rem",
                borderRadius: "0.75rem",
                border: "none",
                backgroundColor: "var(--brand-gold)",
                color: "#1a1408",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                opacity: loginBusy || !username || !password ? 0.6 : 1,
                marginTop: "0.25rem",
              }}
            >
              <Lock size={16} /> {loginBusy ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              color: "var(--admin-text-muted)",
              fontSize: "0.7rem",
            }}
          >
            <ShieldCheck size={13} /> Acceso restringido al personal autorizado
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--admin-bg)", color: "var(--admin-text)" }}>
      <AdminSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
      <main style={{ flex: 1, minWidth: 0 }}>
        <div
          className="md:hidden"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            backgroundColor: "var(--admin-bg-secondary)",
            borderBottom: "1px solid var(--admin-border)",
            padding: "0.6rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>USB · Admin</div>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: "var(--admin-bg-tertiary)", border: "1px solid var(--admin-border)", color: "var(--admin-text)", borderRadius: "0.5rem", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div style={{ padding: "1.5rem" }}>{children}</div>
      </main>
    </div>
  );
}
