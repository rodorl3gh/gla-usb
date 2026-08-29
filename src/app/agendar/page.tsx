"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/landing/Navbar";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

const todayStr = (() => {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(new Date());
  const y = parts.find((p: any) => p.type === "year")!.value;
  const m = parts.find((p: any) => p.type === "month")!.value;
  const d = parts.find((p: any) => p.type === "day")!.value;
  return `${y}-${m}-${d}`;
})();

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIAS_CORTO = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function ymd(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

interface Programa {
  id: number;
  nombre: string;
  duracion: string;
}

export default function AgendarPage() {
  const [step, setStep] = useState(1);
  const [cfg, setCfg] = useState<{ marca?: string; telefono?: string }>({});
  const [licenciaturas, setLicenciaturas] = useState<Programa[]>([]);
  const [maestrias, setMaestrias] = useState<Programa[]>([]);
  const [interes, setInteres] = useState("");
  const [fecha, setFecha] = useState("");
  const [horas, setHoras] = useState<string[]>([]);
  const [loadingHoras, setLoadingHoras] = useState(false);
  const [hora, setHora] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [notas, setNotas] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const [ty, tm] = todayStr.split("-").map(Number);
  const [calYear, setCalYear] = useState(ty);
  const [calMonth, setCalMonth] = useState(tm - 1);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => setCfg(d || {}))
      .catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/licenciaturas").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/maestrias").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([l, m]) => {
        setLicenciaturas(Array.isArray(l) ? l : []);
        setMaestrias(Array.isArray(m) ? m : []);
        const params = new URLSearchParams(window.location.search);
        const pre = params.get("interes");
        if (pre) {
          setInteres(pre);
          setStep(2);
        }
      })
      .catch(() => {});
  }, []);

  function selectFecha(dayStr: string) {
    setFecha(dayStr);
    setHora("");
    setLoadingHoras(true);
    fetch(`/api/citas/disponibles?fecha=${dayStr}`)
      .then((r) => r.json())
      .then((d) => setHoras(Array.isArray(d) ? d : []))
      .catch(() => setHoras([]))
      .finally(() => setLoadingHoras(false));
    setStep(3);
  }

  function prevMonth() {
    if (calYear === ty && calMonth === tm - 1) return;
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else setCalMonth((m) => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else setCalMonth((m) => m + 1);
  }

  function daysInMonth(y: number, m: number) {
    return new Date(y, m + 1, 0).getDate();
  }

  async function confirmar() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          telefono,
          email,
          interes,
          fecha,
          hora,
          notas,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
      } else {
        setError(data.error || "Error al agendar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  }

  function buildCalendar() {
    const cells: { day: number; date: string; enabled: boolean }[] = [];
    const total = daysInMonth(calYear, calMonth);
    const first = new Date(calYear, calMonth, 1).getDay();
    for (let i = 0; i < first; i++) cells.push({ day: 0, date: "", enabled: false });
    for (let d = 1; d <= total; d++) {
      const ds = ymd(calYear, calMonth, d);
      const dow = new Date(calYear, calMonth, d).getDay();
      const isPast = ds < todayStr;
      cells.push({ day: d, date: ds, enabled: !isPast });
    }
    return cells;
  }

  if (done) {
    return (
      <div style={{ minHeight: "100vh", backgroundImage: "url(/fondo.avif)", backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(0,0,0,0.9), rgba(0,0,0,0.68) 60%, rgba(0,0,0,0.5))" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <Navbar marca={cfg.marca || "USB"} telefono={cfg.telefono || ""} />
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem" }}>
            <div className="glass-card" style={{ maxWidth: 480, width: "100%", padding: "2.25rem", textAlign: "center" }}>
              <CheckCircle2 size={52} style={{ color: "#1e9e6a", margin: "0 auto 1rem" }} />
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-display)", margin: "0 0 0.75rem" }}>
                ¡Plática agendada!
              </h1>
              <p style={{ color: "var(--brand-text-secondary)", lineHeight: 1.6, margin: "0 0 1.5rem" }}>
                Gracias, <strong>{nombre}</strong>. Registramos tu plática informativa para el{" "}
                <strong>{formatFecha(fecha)}</strong> a las <strong>{hora}</strong>.
                {interes && (
                  <>
                    {" "}Programa de interés: <strong>{interes}</strong>.
                  </>
                )}
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--brand-text-muted)", margin: "0 0 1.5rem" }}>
                Te contactaremos para confirmar tu cita. Te esperamos en nuestras instalaciones.
              </p>
              <Link href="/" style={{ color: "var(--brand-gold-dark)", fontWeight: 600, textDecoration: "none" }}>
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundImage: "url(/fondo.avif)", backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(0,0,0,0.9), rgba(0,0,0,0.7) 55%, rgba(0,0,0,0.5))" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar marca={cfg.marca || "USB"} telefono={cfg.telefono || ""} />
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "4.5rem 1rem 1.25rem" }}>
          <div className="glass-card" style={{ padding: "1.25rem 1.25rem 1.25rem" }}>
            {/* Stepper */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              {[1, 2, 3, 4].map((s) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      backgroundColor: step >= s ? "var(--brand-gold)" : "var(--brand-bg-light)",
                      color: step >= s ? "#1a1408" : "var(--brand-text-muted)",
                      border: step >= s ? "none" : "1px solid var(--brand-border)",
                    }}
                  >
                    {s}
                  </div>
                  {s < 4 && (
                    <div style={{ width: 20, height: 2, backgroundColor: step > s ? "var(--brand-gold)" : "var(--brand-border)" }} />
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div style={{ backgroundColor: "#fdecea", color: "#b42318", padding: "0.6rem 1rem", borderRadius: "0.6rem", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                {error}
              </div>
            )}

            {/* STEP 1: Interés */}
            {step === 1 && (
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "var(--font-display)", margin: "0 0 0.25rem" }}>
                  ¿Qué programa te interesa?
                </h2>
                <p style={{ color: "var(--brand-text-secondary)", fontSize: "0.85rem", margin: "0 0 0.75rem" }}>
                  Elige la carrera y continuaremos automáticamente.
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0 0 0.5rem" }}>
                  <GraduationCap size={15} color="var(--brand-gold-dark)" />
                  <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>Licenciaturas e Ingeniería</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  {licenciaturas.map((l) => {
                    const selected = interes === l.nombre;
                    return (
                      <button
                        key={l.id}
                        onClick={() => {
                          setInteres(l.nombre);
                          setStep(2);
                        }}
                        style={{
                          textAlign: "left",
                          padding: "0.6rem 0.7rem",
                          borderRadius: "0.7rem",
                          border: selected ? "2px solid var(--brand-gold)" : "1px solid var(--brand-border)",
                          backgroundColor: selected ? "rgba(245,188,25,0.1)" : "#fff",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.2rem",
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: "0.78rem", lineHeight: 1.25 }}>{l.nombre}</div>
                        {l.duracion && <div style={{ fontWeight: 600, color: "var(--brand-gold-dark)", fontSize: "0.68rem" }}>{l.duracion}</div>}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0 0 0.5rem" }}>
                  <BookOpen size={15} color="var(--brand-gold-dark)" />
                  <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>Maestrías</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.5rem" }}>
                  {maestrias.map((m) => {
                    const selected = interes === m.nombre;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setInteres(m.nombre);
                          setStep(2);
                        }}
                        style={{
                          textAlign: "left",
                          padding: "0.6rem 0.7rem",
                          borderRadius: "0.7rem",
                          border: selected ? "2px solid var(--brand-gold)" : "1px solid var(--brand-border)",
                          backgroundColor: selected ? "rgba(245,188,25,0.1)" : "#fff",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.2rem",
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: "0.78rem", lineHeight: 1.25 }}>{m.nombre}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Fecha */}
            {step === 2 && (
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "var(--font-display)", margin: "0 0 0.25rem" }}>
                  Elige la fecha
                </h2>
                <p style={{ color: "var(--brand-text-secondary)", fontSize: "0.85rem", margin: "0 0 0.75rem" }}>
                  Atendemos de lunes a viernes.
                </p>
                {interes && (
                  <div style={{ backgroundColor: "var(--brand-bg-light)", borderRadius: "0.7rem", padding: "0.6rem 0.9rem", marginBottom: "0.75rem", fontSize: "0.8rem" }}>
                    <strong>Programa de interés:</strong> {interes}
                  </div>
                )}
                <div style={{ border: "1px solid var(--brand-border)", borderRadius: "0.8rem", padding: "0.9rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                    <button onClick={prevMonth} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--brand-text)" }}>
                      <ChevronLeft size={20} />
                    </button>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                      {MESES[calMonth]} {calYear}
                    </div>
                    <button onClick={nextMonth} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--brand-text)" }}>
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.3rem", textAlign: "center" }}>
                    {DIAS_CORTO.map((d) => (
                      <div key={d} style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--brand-text-muted)", padding: "0.2rem 0" }}>
                        {d}
                      </div>
                    ))}
                    {buildCalendar().map((c, i) =>
                      c.day === 0 ? (
                        <div key={i} />
                      ) : (
                        <button
                          key={i}
                          disabled={!c.enabled}
                          onClick={() => selectFecha(c.date)}
                          style={{
                            padding: "0.5rem 0",
                            borderRadius: "0.6rem",
                            border: fecha === c.date ? "2px solid var(--brand-gold)" : "1px solid transparent",
                            backgroundColor: fecha === c.date ? "var(--brand-gold)" : "transparent",
                            color: !c.enabled ? "var(--brand-text-muted)" : fecha === c.date ? "#1a1408" : "var(--brand-text)",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            cursor: c.enabled ? "pointer" : "not-allowed",
                            opacity: c.enabled ? 1 : 0.4,
                          }}
                        >
                          {c.day}
                        </button>
                      )
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem" }}>
                  <button className="btn-outline" onClick={() => setStep(1)} style={{ padding: "0.55rem 1.1rem" }}>
                    <ChevronLeft size={16} /> Atrás
                  </button>
                  <button className="btn-primary" disabled={!fecha} onClick={() => setStep(3)} style={{ padding: "0.55rem 1.1rem" }}>
                    Continuar <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Hora */}
            {step === 3 && (
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "var(--font-display)", margin: "0 0 0.25rem" }}>
                  Elige la hora
                </h2>
                <p style={{ color: "var(--brand-text-secondary)", fontSize: "0.85rem", margin: "0 0 0.75rem" }}>
                  {formatFecha(fecha)} · Horarios disponibles (30 min)
                </p>
                {loadingHoras ? (
                  <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--brand-text-muted)" }}>Cargando horarios...</div>
                ) : horas.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--brand-text-secondary)" }}>
                    No hay horarios disponibles para esta fecha. Elige otro día.
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))", gap: "0.5rem" }}>
                    {horas.map((h) => (
                      <button
                        key={h}
                        onClick={() => {
                          setHora(h);
                          setStep(4);
                        }}
                        style={{
                          padding: "0.6rem",
                          borderRadius: "0.7rem",
                          border: hora === h ? "2px solid var(--brand-gold)" : "1px solid var(--brand-border)",
                          backgroundColor: hora === h ? "var(--brand-gold)" : "#fff",
                          color: hora === h ? "#1a1408" : "var(--brand-text)",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.3rem",
                        }}
                      >
                        <Clock size={13} /> {h}
                      </button>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem" }}>
                  <button className="btn-outline" onClick={() => setStep(2)} style={{ padding: "0.55rem 1.1rem" }}>
                    <ChevronLeft size={16} /> Atrás
                  </button>
                  <button className="btn-primary" disabled={!hora} onClick={() => setStep(4)} style={{ padding: "0.55rem 1.1rem" }}>
                    Continuar <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Datos */}
            {step === 4 && (
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "var(--font-display)", margin: "0 0 0.25rem" }}>
                  Tus datos
                </h2>
                <p style={{ color: "var(--brand-text-secondary)", fontSize: "0.85rem", margin: "0 0 0.75rem" }}>
                  Confirma los detalles de tu plática informativa.
                </p>

                <div style={{ backgroundColor: "var(--brand-bg-light)", borderRadius: "0.7rem", padding: "0.6rem 0.9rem", marginBottom: "0.9rem", fontSize: "0.82rem" }}>
                  <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.25rem" }}>
                    <GraduationCap size={14} color="var(--brand-gold-dark)" />
                    <span><strong>Interés:</strong> {interes || "—"}</span>
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.25rem" }}>
                    <CalendarDays size={14} color="var(--brand-gold-dark)" />
                    <span><strong>Fecha:</strong> {formatFecha(fecha)}</span>
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <Clock size={14} color="var(--brand-gold-dark)" />
                    <span><strong>Hora:</strong> {hora}</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--brand-text-secondary)" }}>
                    Nombre completo *
                    <div style={{ position: "relative", marginTop: "0.25rem" }}>
                      <User size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--brand-text-muted)" }} />
                      <input
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        style={{ width: "100%", padding: "0.55rem 0.65rem 0.55rem 2rem", borderRadius: "0.6rem", border: "1px solid var(--brand-border)", fontSize: "0.85rem" }}
                        placeholder="Ej. Juan Pérez"
                      />
                    </div>
                  </label>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--brand-text-secondary)" }}>
                    Teléfono *
                    <div style={{ position: "relative", marginTop: "0.25rem" }}>
                      <Phone size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--brand-text-muted)" }} />
                      <input
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        inputMode="numeric"
                        maxLength={10}
                        style={{ width: "100%", padding: "0.55rem 0.65rem 0.55rem 2rem", borderRadius: "0.6rem", border: "1px solid var(--brand-border)", fontSize: "0.85rem" }}
                        placeholder="10 dígitos"
                      />
                    </div>
                    <span style={{ fontSize: "0.68rem", fontWeight: 500, color: telefono.length === 10 ? "#1e9e6a" : telefono.length === 0 ? "var(--brand-text-muted)" : "#e0a800" }}>
                      {telefono.length === 10 ? "Número completo" : `Faltan ${10 - telefono.length}`}
                    </span>
                  </label>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--brand-text-secondary)", gridColumn: "1 / -1" }}>
                    Correo electrónico
                    <div style={{ position: "relative", marginTop: "0.25rem" }}>
                      <Mail size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--brand-text-muted)" }} />
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        style={{ width: "100%", padding: "0.55rem 0.65rem 0.55rem 2rem", borderRadius: "0.6rem", border: "1px solid var(--brand-border)", fontSize: "0.85rem" }}
                        placeholder="tucorreo@ejemplo.com"
                      />
                    </div>
                  </label>
                </div>

                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--brand-text-secondary)", marginTop: "0.5rem", display: "block" }}>
                  Notas adicionales (opcional)
                  <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    style={{ width: "100%", marginTop: "0.25rem", padding: "0.5rem 0.65rem", borderRadius: "0.6rem", border: "1px solid var(--brand-border)", fontSize: "0.85rem", minHeight: 40, resize: "vertical" }}
                    placeholder="Cuéntanos brevemente..."
                  />
                </label>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem" }}>
                  <button className="btn-outline" onClick={() => setStep(3)} style={{ padding: "0.55rem 1.1rem" }}>
                    <ChevronLeft size={16} /> Atrás
                  </button>
                  <button className="btn-primary" disabled={!nombre || telefono.length !== 10 || submitting} onClick={confirmar} style={{ padding: "0.55rem 1.1rem" }}>
                    {submitting ? "Agendando..." : "Confirmar plática"} <CheckCircle2 size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatFecha(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} de ${MESES[m - 1]} de ${y}`;
}
