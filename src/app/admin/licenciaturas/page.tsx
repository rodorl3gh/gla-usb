"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ChevronDown, ChevronRight, GraduationCap } from "lucide-react";
import { ToggleActive, EditButton, DeleteButton, Modal } from "@/components/admin/crud";

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

export default function LicenciaturasPage() {
  const [items, setItems] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [draft, setDraft] = useState({ nombre: "", duracion: "", rvoe: "", descripcion: "" });
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ nombre: "", duracion: "", rvoe: "", descripcion: "" });
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    const res = await fetch("/api/licenciaturas", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setItems((await res.json()) || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openEdit(s: any) {
    setExpandedId(s.id);
    setDraft({ nombre: s.nombre, duracion: s.duracion || "", rvoe: s.rvoe || "", descripcion: s.descripcion || "" });
  }

  async function toggleActive(s: any) {
    await api(`/api/licenciaturas/${s.id}`, "PUT", { activo: s.activo ? 0 : 1 });
    load();
  }

  async function remove(id: number) {
    if (!confirm("¿Eliminar esta licenciatura?")) return;
    await api(`/api/licenciaturas/${id}`, "DELETE");
    if (expandedId === id) setExpandedId(null);
    load();
  }

  async function saveEdit() {
    if (!expandedId || !draft.nombre.trim()) return;
    await api(`/api/licenciaturas/${expandedId}`, "PUT", draft);
    setExpandedId(null);
    load();
  }

  async function create() {
    if (!newForm.nombre.trim()) return;
    await api("/api/licenciaturas", "POST", newForm);
    setShowNew(false);
    setNewForm({ nombre: "", duracion: "", rvoe: "", descripcion: "" });
    load();
  }

  return (
    <div style={{ animation: "page-in 0.35s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, fontFamily: "var(--font-display)" }}>Licenciaturas e Ingeniería</h1>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>
            {items.length} programas · haz clic en uno para editar su información
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {msg && <span style={{ color: "#10B981", fontSize: "0.8rem", fontWeight: 600 }}>{msg}</span>}
          <button onClick={() => setShowNew(true)} className="btn-primary" style={{ padding: "0.55rem 1.25rem", fontSize: "0.85rem" }}>
            <Plus size={16} /> Agregar licenciatura
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {items.map((s) => {
          const expanded = expandedId === s.id;
          const active = !!s.activo;
          return (
            <div
              key={s.id}
              style={{
                backgroundColor: "var(--admin-bg-secondary)",
                border: "1px solid var(--admin-border)",
                borderRadius: "0.875rem",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.75rem" }}>
                <button
                  onClick={() => (expanded ? setExpandedId(null) : openEdit(s))}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.55rem 0.25rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--admin-text)",
                    textAlign: "left",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: "2.25rem",
                      height: "2.25rem",
                      borderRadius: "0.6rem",
                      backgroundColor: active ? "rgba(198,161,91,0.14)" : "rgba(148,163,184,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <GraduationCap size={17} color={active ? "var(--admin-accent)" : "var(--admin-text-muted)"} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          color: active ? "var(--admin-text)" : "var(--admin-text-muted)",
                          textDecoration: active ? "none" : "line-through",
                        }}
                      >
                        {s.nombre}
                      </span>
                      {s.duracion && (
                        <span style={{ fontWeight: 600, fontSize: "0.78rem", color: "var(--admin-accent)", whiteSpace: "nowrap" }}>
                          {s.duracion}
                        </span>
                      )}
                    </div>
                    {s.rvoe && (
                      <div style={{ fontSize: "0.72rem", color: "var(--admin-text-muted)", marginTop: "0.1rem" }}>
                        {s.rvoe}
                      </div>
                    )}
                  </div>
                </button>
                <ToggleActive active={active} onToggle={() => toggleActive(s)} />
                <EditButton onClick={() => openEdit(s)} />
                <DeleteButton onClick={() => remove(s.id)} />
                {expanded ? <ChevronDown size={18} color="var(--admin-text-muted)" /> : <ChevronRight size={18} color="var(--admin-text-muted)" />}
              </div>

              {expanded && (
                <div style={{ borderTop: "1px solid var(--admin-border)", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
                      Nombre
                      <input value={draft.nombre} onChange={(e) => setDraft({ ...draft, nombre: e.target.value })} style={inputStyle} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
                      Duración
                      <input value={draft.duracion} onChange={(e) => setDraft({ ...draft, duracion: e.target.value })} placeholder="Ej. 3 años 4 meses" style={inputStyle} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
                      RVOE
                      <input value={draft.rvoe} onChange={(e) => setDraft({ ...draft, rvoe: e.target.value })} placeholder="Ej. R.V.O.E NO 20110104" style={inputStyle} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--admin-text-secondary)", gridColumn: "1 / -1" }}>
                      Descripción
                      <input value={draft.descripcion} onChange={(e) => setDraft({ ...draft, descripcion: e.target.value })} style={inputStyle} />
                    </label>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={saveEdit} className="btn-primary" style={{ padding: "0.5rem 1.5rem", fontSize: "0.8125rem" }}>Guardar</button>
                    <button onClick={() => setExpandedId(null)} className="btn-outline" style={{ padding: "0.5rem 1.5rem", fontSize: "0.8125rem" }}>Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showNew && (
        <Modal title="Agregar licenciatura" onClose={() => setShowNew(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
              Nombre
              <input value={newForm.nombre} onChange={(e) => setNewForm({ ...newForm, nombre: e.target.value })} style={inputStyle} placeholder="Ej. Psicología" autoFocus />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
              Duración
              <input value={newForm.duracion} onChange={(e) => setNewForm({ ...newForm, duracion: e.target.value })} style={inputStyle} placeholder="Ej. 3 años 4 meses" />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
              RVOE
              <input value={newForm.rvoe} onChange={(e) => setNewForm({ ...newForm, rvoe: e.target.value })} style={inputStyle} placeholder="Ej. R.V.O.E NO 20110104" />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--admin-text-secondary)" }}>
              Descripción
              <input value={newForm.descripcion} onChange={(e) => setNewForm({ ...newForm, descripcion: e.target.value })} style={inputStyle} placeholder="Breve descripción" />
            </label>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
              <button onClick={create} className="btn-primary" style={{ padding: "0.55rem 1.5rem", fontSize: "0.85rem" }}>Guardar licenciatura</button>
              <button onClick={() => setShowNew(false)} className="btn-outline" style={{ padding: "0.55rem 1.5rem", fontSize: "0.85rem" }}>Cancelar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
