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
      const isSunday = dow === 0;
      cells.push({ day: d, date: ds, enabled: !isPast && !isSunday });
    }
    return cells;
  }

  if (done) {
    return (
      <div style={{ minHeight: "100vh", backgroundImage: "url(/fondo.avif)", backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(0,15,38,0.92), rgba(0,22,55,0.7) 60%, rgba(0,15,38,0.55))" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <Navbar marca={cfg.marca || "USB"} telefono={cfg.telefono || ""} />
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem" }}>
            <div className="glass-card" style={{ maxWidth: 480, width: "100%", padding: "2.5rem", textAlign: "center" }}>
              <CheckCircle2 size={56} style={{ color: "#1e9e6a", margin: "0 auto 1rem" }} />
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, fontFamily: "var(--font-display)", margin: "0 0 0.75rem" }}>
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
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(0,15,38,0.92), rgba(0,22,55,0.72) 55%, rgba(0,15,38,0.55))" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar marca={cfg.marca || "USB"} telefono={cfg.telefono || ""} />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "4.5rem 1.5rem 2rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "-2.75rem", position: "relative", zIndex: 2 }}>
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                overflow: "hidden",
                border: "4px solid #fff",
                boxShadow: "0 14px 34px rgba(0,0,0,0.45)",
                backgroundColor: "#fff",
              }}
            >
              <Image src="/logo-square.jpg" alt="Logo USB" width={96} height={96} style={{ objectFit: "cover" }} />
            </div>
          </div>

          <div className="glass-card" style={{ padding: "3rem 1.5rem 1.5rem" }}>
            {/* Stepper */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
              {[1, 2, 3, 4].map((s) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      backgroundColor: step >= s ? "var(--brand-gold)" : "var(--brand-bg-light)",
                      color: step >= s ? "#1a1408" : "var(--brand-text-muted)",
                      border: step >= s ? "none" : "1px solid var(--brand-border)",
                    }}
                  >
                    {s}
                  </div>
                  {s < 4 && (
                    <div style={{ width: 24, height: 2, backgroundColor: step > s ? "var(--brand-gold)" : "var(--brand-border)" }} />
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div style={{ backgroundColor: "#fdecea", color: "#b42318", padding: "0.75rem 1rem", borderRadius: "0.6rem", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {error}
              </div>
            )}

            {/* STEP 1: Interés */}
            {step === 1 && (
              <div>
                <h2 style={{ fontSize: "1.35rem", fontWeight: 800, fontFamily: "var(--font-display)", margin: "0 0 0.25rem" }}>
                  ¿Qué programa te interesa?
                </h2>
                <p style={{ color: "var(--brand-text-secondary)", fontSize: "0.9rem", margin: "0 0 1rem" }}>
                  Elige la carrera que quieres estudiar y continuaremos automáticamente.
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0 0 0.75rem" }}>
                  <GraduationCap size={16} color="var(--brand-gold-dark)" />
                  <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Licenciaturas e Ingeniería</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.6rem", marginBottom: "1.25rem" }}>
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
                          padding: "0.8rem",
                          borderRadius: "0.85rem",
                          border: selected ? "2px solid var(--brand-gold)" : "1px solid var(--brand-border)",
                          backgroundColor: selected ? "rgba(198,161,91,0.1)" : "#fff",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.3rem",
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: "0.85rem", lineHeight: 1.25 }}>{l.nombre}</div>
                        {l.duracion && <div style={{ fontWeight: 600, color: "var(--brand-gold-dark)", fontSize: "0.72rem" }}>{l.duracion}</div>}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0 0 0.75rem" }}>
                  <BookOpen size={16} color="var(--brand-gold-dark)" />
                  <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Maestrías</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.6rem" }}>
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
                          padding: "0.8rem",
                          borderRadius: "0.85rem",
                          border: selected ? "2px solid var(--brand-gold)" : "1px solid var(--brand-border)",
                          backgroundColor: selected ? "rgba(198,161,91,0.1)" : "#fff",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.3rem",
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: "0.85rem", lineHeight: 1.25 }}>{m.nombre}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Fecha */}
            {step === 2 && (
              <div>
                <h2 style={{ fontSize: "1.35rem", fontWeight: 800, fontFamily: "var(--font-display)", margin: "0 0 0.25rem" }}>
                  Elige la fecha
                </h2>
                <p style={{ color: "var(--brand-text-secondary)", fontSize: "0.9rem", margin: "0 0 1rem" }}>
                  Atendemos de lunes a sábado. Los domingos no están disponibles.
                </p>
                {interes && (
                  <div style={{ backgroundColor: "var(--brand-bg-light)", borderRadius: "0.8rem", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.85rem" }}>
                    <strong>Programa de interés:</strong> {interes}
                  </div>
                )}
                <div className="glass-card" style={{ padding: "1.25rem", boxShadow: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                    <button onClick={prevMonth} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--brand-text)" }}>
                      <ChevronLeft size={20} />
                    </button>
                    <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                      {MESES[calMonth]} {calYear}
                    </div>
                    <button onClick={nextMonth} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--brand-text)" }}>
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.35rem", textAlign: "center" }}>
                    {DIAS_CORTO.map((d) => (
                      <div key={d} style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--brand-text-muted)", padding: "0.25rem 0" }}>
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
                            padding: "0.6rem 0",
                            borderRadius: "0.6rem",
                            border: fecha === c.date ? "2px solid var(--brand-gold)" : "1px solid transparent",
                            backgroundColor: fecha === c.date ? "var(--brand-gold)" : "transparent",
                            color: !c.enabled ? "var(--brand-text-muted)" : fecha === c.date ? "#1a1408" : "var(--brand-text)",
                            fontWeight: 600,
                            fontSize: "0.85rem",
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
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
                  <button className="btn-outline" onClick={() => setStep(1)}>
                    <ChevronLeft size={16} /> Atrás
                  </button>
                  <button className="btn-primary" disabled={!fecha} onClick={() => setStep(3)}>
                    Continuar <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Hora */}
            {step === 3 && (
              <div>
                <h2 style={{ fontSize: "1.35rem", fontWeight: 800, fontFamily: "var(--font-display)", margin: "0 0 0.25rem" }}>
                  Elige la hora
                </h2>
                <p style={{ color: "var(--brand-text-secondary)", fontSize: "0.9rem", margin: "0 0 1rem" }}>
                  {formatFecha(fecha)} · Horarios disponibles
                </p>
                {loadingHoras ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "var(--brand-text-muted)" }}>Cargando horarios...</div>
                ) : horas.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "var(--brand-text-secondary)" }}>
                    No hay horarios disponibles para esta fecha. Elige otro día.
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "0.6rem" }}>
                    {horas.map((h) => (
                      <button
                        key={h}
                        onClick={() => {
                          setHora(h);
                          setStep(4);
                        }}
                        style={{
                          padding: "0.75rem",
                          borderRadius: "0.7rem",
                          border: hora === h ? "2px solid var(--brand-gold)" : "1px solid var(--brand-border)",
                          backgroundColor: hora === h ? "var(--brand-gold)" : "#fff",
                          color: hora === h ? "#1a1408" : "var(--brand-text)",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.35rem",
                        }}
                      >
                        <Clock size={14} /> {h}
                      </button>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
                  <button className="btn-outline" onClick={() => setStep(2)}>
                    <ChevronLeft size={16} /> Atrás
                  </button>
                  <button className="btn-primary" disabled={!hora} onClick={() => setStep(4)}>
                    Continuar <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Datos */}
            {step === 4 && (
              <div>
                <h2 style={{ fontSize: "1.35rem", fontWeight: 800, fontFamily: "var(--font-display)", margin: "0 0 0.25rem" }}>
                  Tus datos
                </h2>
                <p style={{ color: "var(--brand-text-secondary)", fontSize: "0.9rem", margin: "0 0 1rem" }}>
                  Confirma los detalles de tu plática informativa.
                </p>

                <div style={{ backgroundColor: "var(--brand-bg-light)", borderRadius: "0.8rem", padding: "1rem 1.25rem", marginBottom: "1.25rem", fontSize: "0.9rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem" }}>
                    <GraduationCap size={15} color="var(--brand-gold-dark)" />
                    <span><strong>Interés:</strong> {interes || "—"}</span>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem" }}>
                    <CalendarDays size={15} color="var(--brand-gold-dark)" />
                    <span><strong>Fecha:</strong> {formatFecha(fecha)}</span>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Clock size={15} color="var(--brand-gold-dark)" />
                    <span><strong>Hora:</strong> {hora}</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--brand-text-secondary)" }}>
                    Nombre completo *
                    <div style={{ position: "relative", marginTop: "0.3rem" }}>
                      <User size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--brand-text-muted)" }} />
                      <input
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem 0.75rem 0.65rem 2.4rem", borderRadius: "0.6rem", border: "1px solid var(--brand-border)", fontSize: "0.9rem" }}
                        placeholder="Ej. Juan Pérez"
                      />
                    </div>
                  </label>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--brand-text-secondary)" }}>
                    Teléfono *
                    <div style={{ position: "relative", marginTop: "0.3rem" }}>
                      <Phone size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--brand-text-muted)" }} />
                      <input
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        inputMode="numeric"
                        maxLength={10}
                        style={{ width: "100%", padding: "0.65rem 0.75rem 0.65rem 2.4rem", borderRadius: "0.6rem", border: "1px solid var(--brand-border)", fontSize: "0.9rem" }}
                        placeholder="10 dígitos"
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 500,
                        marginTop: "0.3rem",
                        color: telefono.length === 10 ? "#1e9e6a" : telefono.length === 0 ? "var(--brand-text-muted)" : "#e0a800",
                      }}
                    >
                      {telefono.length === 10
                        ? "Número completo"
                        : `Faltan ${10 - telefono.length} dígito${10 - telefono.length !== 1 ? "s" : ""}`}
                    </span>
                  </label>
                </div>

                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--brand-text-secondary)", marginTop: "0.5rem" }}>
                  Notas adicionales (opcional)
                  <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    style={{ width: "100%", marginTop: "0.3rem", padding: "0.6rem 0.75rem", borderRadius: "0.6rem", border: "1px solid var(--brand-border)", fontSize: "0.9rem", minHeight: 48, resize: "vertical" }}
                    placeholder="Cuéntanos brevemente tu situación..."
                  />
                </label>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
                  <button className="btn-outline" onClick={() => setStep(3)}>
                    <ChevronLeft size={16} /> Atrás
                  </button>
                  <button className="btn-primary" disabled={!nombre || telefono.length !== 10 || submitting} onClick={confirmar}>
                    {submitting ? "Agendando..." : "Confirmar plática"} <CheckCircle2 size={16} />
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
