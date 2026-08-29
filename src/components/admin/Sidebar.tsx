"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  CalendarDays,
  MessageCircle,
  Clock,
  ExternalLink,
  LogOut,
  X,
  Sun,
  Moon,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/citas", label: "Pláticas (Citas)", icon: CalendarDays },
  { href: "/admin/horarios", label: "Horarios", icon: Clock },
  { href: "/admin/chat", label: "Chat WhatsApp", icon: MessageCircle },
  { href: "/admin/licenciaturas", label: "Licenciaturas", icon: GraduationCap },
  { href: "/admin/maestrias", label: "Maestrías", icon: BookOpen },
];

export default function AdminSidebar({
  mobileOpen,
  onClose,
  onLogout,
}: {
  mobileOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const [light, setLight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin_theme");
    const isLight = saved === "light";
    setLight(isLight);
    document.body.classList.toggle("admin-light", isLight);
  }, []);

  function toggleTheme() {
    const next = !light;
    setLight(next);
    document.body.classList.toggle("admin-light", next);
    localStorage.setItem("admin_theme", next ? "light" : "dark");
  }

  const content = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          padding: "1.25rem 1.25rem",
          borderBottom: "1px solid var(--admin-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 9,
              overflow: "hidden",
              backgroundColor: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Image src="/logo-square.jpg" alt="Logo" width={38} height={38} style={{ objectFit: "cover" }} />
          </div>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontWeight: 700, fontFamily: "var(--font-display)", fontSize: "0.95rem" }}>
              USB
            </div>
            <div style={{ fontSize: "0.62rem", color: "var(--admin-accent)", letterSpacing: "0.15em", fontWeight: 600 }}>
              PANEL ADMIN
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden"
          style={{
            display: "flex",
            background: "transparent",
            border: "none",
            color: "var(--admin-text-muted)",
            cursor: "pointer",
          }}
        >
          <X size={20} />
        </button>
      </div>

      <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.7rem 0.9rem",
                borderRadius: "0.7rem",
                textDecoration: "none",
                color: active ? "var(--admin-accent)" : "var(--admin-text-secondary)",
                backgroundColor: active ? "rgba(245,188,25,0.12)" : "transparent",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "0.75rem", borderTop: "1px solid var(--admin-border)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.6rem 0.9rem",
            borderRadius: "0.7rem",
            textDecoration: "none",
            color: "var(--admin-text-secondary)",
            fontSize: "0.85rem",
            fontWeight: 500,
          }}
        >
          <ExternalLink size={17} /> Ver sitio web
        </a>
        <button
          onClick={toggleTheme}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.6rem 0.9rem",
            borderRadius: "0.7rem",
            background: "transparent",
            border: "none",
            color: "var(--admin-text-secondary)",
            fontSize: "0.85rem",
            fontWeight: 500,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          {light ? <Moon size={17} /> : <Sun size={17} />} {light ? "Modo oscuro" : "Modo claro"}
        </button>
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.6rem 0.9rem",
            borderRadius: "0.7rem",
            background: "transparent",
            border: "none",
            color: "#e08b8b",
            fontSize: "0.85rem",
            fontWeight: 500,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <LogOut size={17} /> Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        style={{
          width: 250,
          backgroundColor: "var(--admin-bg-secondary)",
          borderRight: "1px solid var(--admin-border)",
          flexShrink: 0,
          height: "100vh",
          position: "sticky",
          top: 0,
        }}
        className="hidden md:block"
      >
        {content}
      </aside>

      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60 }}>
          <div
            style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={onClose}
          />
          <aside
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 260,
              backgroundColor: "var(--admin-bg-secondary)",
              borderRight: "1px solid var(--admin-border)",
              zIndex: 61,
            }}
          >
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
