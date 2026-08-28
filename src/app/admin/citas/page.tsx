"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  CalendarDays,
  Phone,
  Mail,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  GraduationCap,
} from "lucide-react";
import { Modal } from "@/components/admin/crud";

interface Cita {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  interes: string;
  fecha: string;
  hora: string;
  estado: string;
  notas: string;
}

const ESTADOS = ["pendiente", "confirmada", "completada", "cancelada"];
const ESTADO_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
};
const ESTADO_COLORS: Record<string, string> = {
  pendiente: "#e0a800",
  confirmada: "#2f80ed",
  completada: "#10B981",
  cancelada: "#e05656",
};
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS = ["D", "L", "M", "X", "J", "V", "S"];

const ACCENT = "#c6a15b";

function api(path: string, method: string, body?: unknown) {
  const token = localStorage.getItem("admin_token");
  return fetch(path, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.55rem 0.75rem",
  borderRadius: "0.5rem",
  border: "1px solid var(--admin-border)",
  backgroundColor: "var(--admin-bg)",
  color: "var(--admin-text)",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
};

export default function CitasPage() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Cita | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ nombre: "", telefono: "", email: "", interes: "", fecha: "", hora: "", notas: "" });
  const [msg, setMsg] = useState("");

  const monthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;

  const load = useCallback(async () => {
    const res = await api("/api/citas", "GET");
    if (res.ok) setCitas((await res.json()) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const citasDelDia = selectedDate ? citas.filter((c) => c.fecha === selectedDate) : [];
  const citasPorDia: Record<string, number> = {};
  for (const c of citas) {
    if (c.fecha.startsWith(monthKey)) citasPorDia[c.fecha] = (citasPorDia[c.fecha] || 0) + 1;
  }

  function daysInMonth(y: number, m: number) {
    return new Date(y, m + 1, 0).getDate();
  }
  function firstDayOfMonth(y: number, m: number) {
    return new Date(y, m, 1).getDay();
  }
  function dateStr(day: number) {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  function isToday(day: number) {
    return viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
    setSelectedDate(null);
    setDetail(null);
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
    setSelectedDate(null);
    setDetail(null);
  }

  async function changeEstado(id: number, estado: string) {
    await api(`/api/citas/${id}`, "PUT", { estado });
    setDetail((d) => (d && d.id === id ? { ...d, estado } : d));
    load();
  }

  async function remove(id: number) {
    if (!confirm("¿Eliminar esta plática?")) return;
    await api(`/api/citas/${id}`, "DELETE");
    setDetail(null);
    load();
  }

  async function create() {
    if (!form.nombre || !form.fecha || !form.hora) {
      setMsg("Nombre, fecha y hora son requeridos");
      setTimeout(() => setMsg(""), 2500);
      return;
    }
    const res = await api("/api/citas", "POST", form);
    if (res.ok) {
      setShowNew(false);
      setForm({ nombre: "", telefono: "", email: "", interes: "", fecha: "", hora: "", notas: "" });
      setSelectedDate(form.fecha);
      setDetail(null);
      load();
    } else {
      setMsg("Error al crear la plática");
      setTimeout(() => setMsg(""), 2500);
    }
  }

  const total = daysInMonth(viewYear, viewMonth);
  const first = firstDayOfMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  const totalCitasMes = Object.values(citasPorDia).reduce((s, c) => s + c, 0);

  return (
    <div style={{ animation: "page-in 0.35s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, fontFamily: "var(--font-display)" }}>Pláticas informativas</h1>
          <p style={{ color: "var(--admin-text-muted)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
            {totalCitasMes} plática{totalCitasMes !== 1 ? "s" : ""} en {MESES[viewMonth]} {viewYear}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {msg && <span style={{ color: "#10B981", fontSize: "0.8rem", fontWeight: 600 }}>{msg}</span>}
          <button
            onClick={() => {
              setForm((f) => ({ ...f, fecha: selectedDate || `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}` }));
              setShowNew(true);
            }}
            className="btn-primary"
            style={{ padding: "0.55rem 1.25rem", fontSize: "0.85rem" }}
          >
            <Plus size={16} /> Nueva plática
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", alignItems: "start" }}>
        {/* CALENDARIO */}
        <div style={{ backgroundColor: "var(--admin-bg-secondary)", border: "1px solid var(--admin-border)", borderRadius: "0.875rem", padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <button onClick={prevMonth} style={{ background: "none", border: "none", color: "var(--admin-text-muted)", cursor: "pointer", padding: "0.25rem", display: "flex" }}>
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--admin-text)" }}>
              {MESES[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} style={{ background: "none", border: "none", color: "var(--admin-text-muted)", cursor: "pointer", padding: "0.25rem", display: "flex" }}>
              <ChevronRight size={18} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--admin-border)", marginBottom: "0.5rem" }}>
            {DIAS.map((d) => (
              <div key={d} style={{ textAlign: "center", fontSize: "0.7rem", fontWeight: 700, color: "var(--admin-text-muted)", padding: "0.4rem 0" }}>
                {d}
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.2rem" }}>
            {cells.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} style={{ aspectRatio: "1" }} />;
              const ds = dateStr(day);
              const count = citasPorDia[ds] || 0;
              const sel = selectedDate === ds;
              const tdy = isToday(day);
              return (
                <button
                  key={ds}
                  onClick={() => {
                    setSelectedDate(ds);
                    setDetail(null);
                  }}
                  style={{
                    aspectRatio: "1",
                    border: "1px solid transparent",
                    padding: 0,
                    cursor: "pointer",
                    background: sel ? ACCENT : count > 0 ? "rgba(198,161,91,0.14)" : tdy ? "rgba(198,161,91,0.07)" : "transparent",
                    borderRadius: "0.5rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "1px",
                    fontSize: "0.8rem",
                    fontWeight: count > 0 || tdy ? 700 : 400,
                    color: sel ? "#1a1408" : tdy ? ACCENT : "var(--admin-text)",
                  }}
                >
                  {day}
                  {count > 0 && (
                    <span style={{ fontSize: "0.55rem", fontWeight: 700, color: sel ? "#1a1408" : ACCENT, lineHeight: 1 }}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* LISTA / DETALLE */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", minWidth: 0 }}>
          {!selectedDate ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                padding: "3rem 1rem",
                color: "var(--admin-text-muted)",
                backgroundColor: "var(--admin-bg-secondary)",
                border: "1px solid var(--admin-border)",
                borderRadius: "0.875rem",
              }}
            >
              <CalendarDays size={36} style={{ opacity: 0.2 }} />
              <p style={{ fontSize: "0.85rem", margin: 0 }}>Selecciona un día para ver las pláticas</p>
            </div>
          ) : detail ? (
            <div style={{ backgroundColor: "var(--admin-bg-secondary)", border: "1px solid var(--admin-border)", borderRadius: "0.875rem", padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <button
                  onClick={() => setDetail(null)}
                  style={{ background: "none", border: "none", color: "var(--admin-text-muted)", cursor: "pointer", padding: 0, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                >
                  <ChevronLeft size={15} /> Volver
                </button>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "0.25rem 0.6rem",
                    borderRadius: "9999px",
                    color: ESTADO_COLORS[detail.estado],
                    backgroundColor: `${ESTADO_COLORS[detail.estado]}18`,
                    textTransform: "capitalize",
                  }}
                >
                  {ESTADO_LABELS[detail.estado]}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "0.75rem", backgroundColor: "rgba(198,161,91,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Clock size={18} color={ACCENT} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--admin-text)" }}>{detail.nombre}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)" }}>
                    {detail.fecha.split("-").reverse().join("/")} · {detail.hora}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                {detail.interes && (
                  <div style={{ fontSize: "0.85rem", color: "var(--admin-text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <GraduationCap size={13} /> <strong style={{ color: "var(--admin-text-muted)" }}>Interés:</strong> {detail.interes}
                  </div>
                )}
                {detail.telefono && (
                  <div style={{ fontSize: "0.85rem", color: "var(--admin-text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Phone size={13} /> {detail.telefono}
                  </div>
                )}
                {detail.email && (
                  <div style={{ fontSize: "0.85rem", color: "var(--admin-text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Mail size={13} /> {detail.email}
                  </div>
                )}
                {detail.notas && (
                  <div style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", fontStyle: "italic" }}>{detail.notas}</div>
                )}
              </div>

              <div style={{ borderTop: "1px solid var(--admin-border)", paddingTop: "0.9rem", display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                <select
                  className="input-field"
                  style={{ width: "auto", minWidth: 140, textTransform: "capitalize" }}
                  value={detail.estado}
                  onChange={(e) => changeEstado(detail.id, e.target.value)}
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>{ESTADO_LABELS[e]}</option>
                  ))}
                </select>
                <button
                  onClick={() => remove(detail.id)}
                  style={{
                    marginLeft: "auto",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.6rem",
                    border: "1px solid rgba(224,86,86,0.4)",
                    background: "rgba(224,86,86,0.08)",
                    color: "#e05656",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: "var(--admin-bg-secondary)", border: "1px solid var(--admin-border)", borderRadius: "0.875rem", padding: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--admin-text)", margin: 0 }}>
                  {selectedDate.split("-").reverse().join("/")}
                  <span style={{ fontSize: "0.72rem", color: "var(--admin-text-muted)", fontWeight: 400, marginLeft: "0.5rem" }}>
                    {citasDelDia.length} plática{citasDelDia.length !== 1 ? "s" : ""}
                  </span>
                </h2>
              </div>

              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "1.5rem" }}>
                  <div style={{ width: "1rem", height: "1rem", borderRadius: "50%", border: "2px solid var(--admin-border)", borderTopColor: ACCENT, animation: "spin 0.7s linear infinite" }} />
                </div>
              ) : citasDelDia.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--admin-text-muted)", fontSize: "0.85rem" }}>Sin pláticas este día</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {citasDelDia.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setDetail(c)}
                      style={{
                        textAlign: "left",
                        width: "100%",
                        padding: "0.6rem 0.75rem",
                        borderRadius: "0.6rem",
                        backgroundColor: "var(--admin-bg)",
                        border: "1px solid var(--admin-border)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: "0.8rem", color: ACCENT, minWidth: "3rem", textAlign: "center", backgroundColor: "rgba(198,161,91,0.12)", padding: "0.15rem 0.3rem", borderRadius: "0.35rem" }}>
                        {c.hora}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--admin-text)" }}>{c.nombre}</div>
                        {c.interes && <div style={{ fontSize: "0.72rem", color: "var(--admin-text-muted)" }}>{c.interes}</div>}
                      </div>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          padding: "0.15rem 0.45rem",
                          borderRadius: "9999px",
                          color: ESTADO_COLORS[c.estado],
                          backgroundColor: `${ESTADO_COLORS[c.estado]}18`,
                          whiteSpace: "nowrap",
                          textTransform: "capitalize",
                        }}
                      >
                        {ESTADO_LABELS[c.estado]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showNew && (
        <Modal title="Nueva plática informativa" onClose={() => setShowNew(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
              Nombre *
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={inputStyle} autoFocus />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
              Teléfono
              <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} style={inputStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
              Email
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
              Programa de interés
              <input value={form.interes} onChange={(e) => setForm({ ...form, interes: e.target.value })} style={inputStyle} />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
                Fecha *
                <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} style={inputStyle} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
                Hora *
                <input type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} style={inputStyle} />
              </label>
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
              Notas
              <input value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} style={inputStyle} />
            </label>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
              <button onClick={create} className="btn-primary" style={{ padding: "0.55rem 1.5rem", fontSize: "0.85rem" }}>
                <Check size={15} /> Guardar plática
              </button>
              <button onClick={() => setShowNew(false)} className="btn-outline" style={{ padding: "0.55rem 1.5rem", fontSize: "0.85rem" }}>
                <X size={15} /> Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
