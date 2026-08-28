"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  ListChecks,
  GraduationCap,
  BookOpen,
  FileSpreadsheet,
  Database,
} from "lucide-react";

interface Stats {
  citasHoy: number;
  citasPendientes: number;
  totalCitas: number;
  totalLicenciaturas: number;
  totalMaestrias: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    citasHoy: 0,
    citasPendientes: 0,
    totalCitas: 0,
    totalLicenciaturas: 0,
    totalMaestrias: 0,
  });
  const [username, setUsername] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setUsername(localStorage.getItem("admin_username"));
    const token = localStorage.getItem("admin_token");
    fetch("/api/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStats(d))
      .catch(() => {});
  }, []);

  async function descargarExcel() {
    setDownloading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/export", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al descargar");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="?(.+?)"?$/);
      a.download = match ? match[1] : "export.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Error al descargar el archivo.");
    } finally {
      setDownloading(false);
    }
  }

  const cards = [
    { label: "Pláticas hoy", value: stats.citasHoy, icon: CalendarDays },
    { label: "Pláticas pendientes", value: stats.citasPendientes, icon: Clock },
    { label: "Pláticas totales", value: stats.totalCitas, icon: ListChecks },
    { label: "Licenciaturas", value: stats.totalLicenciaturas, icon: GraduationCap },
    { label: "Maestrías", value: stats.totalMaestrias, icon: BookOpen },
  ];

  const links = [
    { href: "/admin/citas", label: "Gestionar pláticas", icon: CalendarDays },
    { href: "/admin/licenciaturas", label: "Licenciaturas", icon: GraduationCap },
    { href: "/admin/maestrias", label: "Maestrías", icon: BookOpen },
    { href: "/admin/config", label: "Configuración", icon: Database },
  ];

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.25rem", fontFamily: "var(--font-display)" }}>
        Dashboard
      </h1>
      <p style={{ color: "var(--admin-text-muted)", fontSize: "0.85rem", margin: "0 0 1.5rem" }}>
        Resumen general de la Universidad Superior Bajío
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              backgroundColor: "var(--admin-bg-secondary)",
              border: "1px solid var(--admin-border)",
              borderRadius: "1rem",
              padding: "1.25rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", fontWeight: 600 }}>{c.label}</span>
              <c.icon size={18} color="var(--admin-accent)" />
            </div>
            <div style={{ fontSize: "1.9rem", fontWeight: 800, marginTop: "0.5rem" }}>{c.value}</div>
          </div>
        ))}
      </div>

      {username === "rodorl3" && (
        <div
          style={{
            marginBottom: "2rem",
            backgroundColor: "var(--admin-bg-secondary)",
            borderRadius: "1rem",
            border: "1px solid var(--admin-border)",
            padding: "1.25rem",
          }}
        >
          <h2 style={{ fontSize: "0.9rem", fontWeight: 600, margin: "0 0 0.75rem", color: "var(--admin-text-secondary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Database size={16} color="var(--admin-accent)" /> Herramientas Agencia
          </h2>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              onClick={descargarExcel}
              disabled={downloading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1.25rem",
                fontSize: "0.8125rem",
                fontWeight: 600,
                borderRadius: "2rem",
                border: "none",
                backgroundColor: "#10B981",
                color: "#fff",
                cursor: downloading ? "wait" : "pointer",
              }}
            >
              <FileSpreadsheet size={15} /> {downloading ? "Generando..." : "Descargar BD (Excel)"}
            </button>
          </div>
        </div>
      )}

      <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 0.75rem" }}>Acceso rápido</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1.1rem 1.25rem",
              backgroundColor: "var(--admin-bg-secondary)",
              border: "1px solid var(--admin-border)",
              borderRadius: "0.9rem",
              textDecoration: "none",
              color: "var(--admin-text)",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            <l.icon size={18} color="var(--admin-accent)" /> {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
