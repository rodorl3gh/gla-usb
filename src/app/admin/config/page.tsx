"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, CheckCircle2 } from "lucide-react";

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
  padding: "0.6rem 0.8rem",
  borderRadius: "0.5rem",
  border: "1px solid var(--admin-border)",
  backgroundColor: "var(--admin-bg)",
  color: "var(--admin-text)",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
};

const FIELDS: { key: string; label: string; type?: string; hint?: string }[] = [
  { key: "universidad", label: "Nombre completo de la universidad" },
  { key: "marca", label: "Marca (siglas)", hint: "Ej. USB" },
  { key: "eslogan", label: "Eslogan" },
  { key: "tagline", label: "Descripción (hero)", type: "textarea" },
  { key: "telefono", label: "Teléfono" },
  { key: "whatsapp", label: "WhatsApp (con lada)", hint: "Ej. 524111364713" },
  { key: "email", label: "Email" },
  { key: "direccion", label: "Dirección (calle y número)" },
  { key: "colonia", label: "Colonia" },
  { key: "ciudad", label: "Ciudad" },
  { key: "estado", label: "Estado" },
  { key: "cp", label: "Código postal" },
  { key: "facebook", label: "Facebook (nombre)" },
  { key: "facebook_url", label: "Facebook (URL completa)" },
  { key: "horarios", label: "Horarios (texto)", hint: "Ej. Lun–Vie 9:00–18:00 · Sábado 9:00–14:00" },
];

export default function ConfigPage() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/config");
    if (res.ok) setConfig(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    const res = await api("/api/config", "PUT", config);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  function setField(key: string, value: string) {
    setConfig((c) => ({ ...c, [key]: value }));
  }

  if (loading) {
    return <div style={{ color: "var(--admin-text-muted)" }}>Cargando configuración...</div>;
  }

  return (
    <div style={{ animation: "page-in 0.35s ease-out", maxWidth: 720 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, fontFamily: "var(--font-display)" }}>Configuración</h1>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>
            Datos de contacto y contenido que se muestran en la web pública
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {saved && (
            <span style={{ color: "#10B981", fontSize: "0.8rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <CheckCircle2 size={15} /> Guardado
            </span>
          )}
          <button onClick={save} className="btn-primary" style={{ padding: "0.55rem 1.25rem", fontSize: "0.85rem" }}>
            <Save size={16} /> Guardar cambios
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
        {FIELDS.map((f) => (
          <label key={f.key} style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
            {f.label}
            {f.type === "textarea" ? (
              <textarea
                value={config[f.key] || ""}
                onChange={(e) => setField(f.key, e.target.value)}
                style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
              />
            ) : (
              <input
                value={config[f.key] || ""}
                onChange={(e) => setField(f.key, e.target.value)}
                style={inputStyle}
              />
            )}
            {f.hint && <span style={{ fontSize: "0.68rem", fontWeight: 400, color: "var(--admin-text-muted)" }}>{f.hint}</span>}
          </label>
        ))}
      </div>
    </div>
  );
}
