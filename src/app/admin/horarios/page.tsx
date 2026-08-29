"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, CheckCircle2 } from "lucide-react";

const DIAS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

interface Horario {
  id: number;
  dia: number;
  apertura: string;
  cierre: string;
  duracion_min: number;
  activo: number;
}

const inputStyle: React.CSSProperties = {
  padding: "0.55rem 0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid var(--admin-border)",
  backgroundColor: "var(--admin-bg)",
  color: "var(--admin-text)",
  fontSize: "0.875rem",
  outline: "none",
};

export default function HorariosPage() {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    const res = await fetch("/api/horarios", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setHorarios(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(id: number, data: Partial<Horario>) {
    const token = localStorage.getItem("admin_token");
    await fetch("/api/horarios", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, ...data }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return <div style={{ color: "var(--admin-text-muted)" }}>Cargando horarios...</div>;
  }

  return (
    <div style={{ animation: "page-in 0.35s ease-out", maxWidth: 800 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, fontFamily: "var(--font-display)" }}>Horarios de pláticas</h1>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>
            Disponibilidad para agendar pláticas informativas. Los cambios se reflejan en el wizard público.
          </p>
        </div>
        {saved && (
          <span style={{ color: "#10B981", fontSize: "0.8rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            <CheckCircle2 size={15} /> Guardado
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {horarios.map((h) => {
          const dia = DIAS.find((d) => d.value === h.dia);
          const esFinDeSemana = h.dia === 0 || h.dia === 6;
          return (
            <div
              key={h.id}
              style={{
                backgroundColor: "var(--admin-bg-secondary)",
                border: "1px solid var(--admin-border)",
                borderRadius: "0.875rem",
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
                opacity: h.activo ? 1 : 0.55,
              }}
            >
              <div style={{ minWidth: 110 }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--admin-text)" }}>{dia?.label}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", color: "var(--admin-text-muted)" }}>
                  <Clock size={12} />
                  {h.activo ? "Disponible" : "Cerrado"}
                </div>
              </div>

              <label style={{ display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.72rem", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
                Apertura
                <input
                  type="time"
                  value={h.apertura}
                  disabled={!h.activo}
                  onChange={(e) => {
                    setHorarios((prev) => prev.map((x) => (x.id === h.id ? { ...x, apertura: e.target.value } : x)));
                    save(h.id, { apertura: e.target.value });
                  }}
                  style={inputStyle}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.72rem", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
                Cierre
                <input
                  type="time"
                  value={h.cierre}
                  disabled={!h.activo}
                  onChange={(e) => {
                    setHorarios((prev) => prev.map((x) => (x.id === h.id ? { ...x, cierre: e.target.value } : x)));
                    save(h.id, { cierre: e.target.value });
                  }}
                  style={inputStyle}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.72rem", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
                Duración (min)
                <select
                  value={h.duracion_min}
                  disabled={!h.activo}
                  onChange={(e) => {
                    setHorarios((prev) => prev.map((x) => (x.id === h.id ? { ...x, duracion_min: Number(e.target.value) } : x)));
                    save(h.id, { duracion_min: Number(e.target.value) });
                  }}
                  style={inputStyle}
                >
                  <option value={30}>30</option>
                  <option value={45}>45</option>
                  <option value={60}>60</option>
                </select>
              </label>

              <button
                onClick={() => {
                  const next = h.activo ? 0 : 1;
                  setHorarios((prev) => prev.map((x) => (x.id === h.id ? { ...x, activo: next } : x)));
                  save(h.id, { activo: next });
                }}
                style={{
                  marginLeft: "auto",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "2rem",
                  border: h.activo ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(224,86,86,0.4)",
                  background: h.activo ? "rgba(16,185,129,0.1)" : "rgba(224,86,86,0.1)",
                  color: h.activo ? "#10B981" : "#e05656",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                {h.activo ? "Abierto" : "Cerrado"}
              </button>
            </div>
          );
        })}
      </div>

      {horarios.some((h) => h.activo && (h.dia === 0 || h.dia === 6)) === false && (
        <p style={{ fontSize: "0.78rem", color: "var(--admin-text-muted)", marginTop: "1rem" }}>
          Los fines de semana están cerrados por defecto. Puedes activarlos si lo necesitas.
        </p>
      )}
    </div>
  );
}
