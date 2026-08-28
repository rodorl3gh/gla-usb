"use client";

import { CheckCircle2, XCircle, Pencil, Trash2, X } from "lucide-react";

export function ToggleActive({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      title={active ? "Desactivar" : "Activar"}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0.3rem",
        borderRadius: "0.4rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {active ? <CheckCircle2 size={20} color="#10B981" /> : <XCircle size={20} color="#e05656" />}
    </button>
  );
}

export function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title="Editar"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0.3rem",
        borderRadius: "0.4rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--admin-text-muted)",
      }}
    >
      <Pencil size={17} />
    </button>
  );
}

export function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title="Eliminar"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0.3rem",
        borderRadius: "0.4rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#e08b8b",
      }}
    >
      <Trash2 size={17} />
    </button>
  );
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 100 }}
        onClick={onClose}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 101,
          width: "90%",
          maxWidth: "34rem",
          maxHeight: "90vh",
          overflowY: "auto",
          backgroundColor: "var(--admin-bg-secondary)",
          border: "1px solid var(--admin-border)",
          borderRadius: "0.875rem",
          padding: "1.5rem",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          animation: "scale-in 0.18s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--admin-text)", margin: 0, fontFamily: "var(--font-display)" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--admin-text-muted)", cursor: "pointer", padding: "0.25rem" }}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
