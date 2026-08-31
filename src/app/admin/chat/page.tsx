"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MessageCircle, Send, RefreshCw, Trash2, Bot, User as UserIcon, Phone, Mail, X, Settings2, ChevronLeft } from "lucide-react";
import QRDisplay from "@/components/admin/QRDisplay";

interface Conversation {
  id: number;
  phone: string;
  name: string | null;
  email: string;
  mode: "AI" | "HUMAN";
  remote_jid: string | null;
  last_message: string | null;
  last_role: string | null;
}

interface Message {
  id: number;
  role: "user" | "assistant" | "human";
  content: string;
  created_at: number;
}

type ConnStatus = "disconnected" | "qr" | "connecting" | "connected" | "pairing";

function api(path: string, method: string, body?: unknown) {
  const token = localStorage.getItem("admin_token");
  return fetch(path, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conn, setConn] = useState<ConnStatus>("disconnected");
  const [connPhone, setConnPhone] = useState<string | null>(null);
  const [qrString, setQrString] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const loadConversations = useCallback(async () => {
    const res = await api("/api/chat", "GET");
    if (res.ok) setConversations(await res.json());
  }, []);

  const fetchConnection = useCallback(async () => {
    const res = await fetch("/api/connection/status");
    if (res.ok) {
      const d = await res.json();
      setConn(d.status as ConnStatus);
      setConnPhone(d.phone);
      setQrString(d.qrString);
      setPairingCode(d.pairingCode);
    }
  }, []);

  useEffect(() => {
    loadConversations();
    fetchConnection();
    const cInt = setInterval(loadConversations, 5000);
    const connInt = setInterval(fetchConnection, 2000);
    return () => {
      clearInterval(cInt);
      clearInterval(connInt);
    };
  }, [loadConversations, fetchConnection]);

  const loadMessages = useCallback(async (id: number) => {
    const res = await api(`/api/chat?conversationId=${id}`, "GET");
    if (res.ok) setMessages(await res.json());
  }, []);

  useEffect(() => {
    if (selectedId !== null) {
      loadMessages(selectedId);
      const int = setInterval(() => loadMessages(selectedId), 3000);
      return () => clearInterval(int);
    }
  }, [selectedId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selected = conversations.find((c) => c.id === selectedId) || null;

  async function sendManual() {
    const text = input.trim();
    if (!text || !selectedId) return;
    setBusy(true);
    setInput("");
    await api("/api/chat", "POST", { conversationId: selectedId, message: text, mode: "HUMAN" });
    await loadMessages(selectedId);
    await loadConversations();
    setBusy(false);
  }

  async function forceAI() {
    const text = input.trim();
    if (!text || !selectedId) return;
    setBusy(true);
    setInput("");
    await api("/api/chat", "POST", { conversationId: selectedId, message: text, mode: "AI" });
    await loadMessages(selectedId);
    await loadConversations();
    setBusy(false);
  }

  async function toggleMode() {
    if (!selected) return;
    const newMode = selected.mode === "AI" ? "HUMAN" : "AI";
    await api("/api/chat", "PUT", { id: selected.id, mode: newMode });
    await loadConversations();
  }

  async function removeConversation() {
    if (!selectedId) return;
    if (!confirm("¿Eliminar esta conversación y todos sus mensajes?")) return;
    await api(`/api/chat?id=${selectedId}`, "DELETE");
    setSelectedId(null);
    setMessages([]);
    loadConversations();
  }

  async function connect() {
    setConn("connecting");
    await fetch("/api/connection/start", { method: "POST" });
    fetchConnection();
  }

  async function disconnect() {
    await fetch("/api/connection/disconnect", { method: "POST" });
    setQrString(null);
    setPairingCode(null);
    fetchConnection();
  }

  async function requestCode() {
    const phone = prompt("Número de WhatsApp a vincular (ej: 521234567890):");
    if (!phone) return;
    const res = await fetch("/api/connection/pairing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: phone }),
    });
    const d = await res.json();
    if (d.pairingCode) setPairingCode(d.pairingCode);
    else alert("Error: " + (d.error || "No se pudo generar el código"));
  }

  return (
    <div style={{ animation: "page-in 0.35s ease-out", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, fontFamily: "var(--font-display)" }}>Chat WhatsApp</h1>
          <p style={{ color: "var(--admin-text-muted)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
            Conversaciones con prospectos y control del agente de IA.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.35rem 0.85rem",
              borderRadius: "2rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              border: "1px solid",
              borderColor: conn === "connected" ? "rgba(16,185,129,0.4)" : conn === "disconnected" ? "rgba(224,86,86,0.4)" : "rgba(245,188,25,0.5)",
              color: conn === "connected" ? "#10B981" : conn === "disconnected" ? "#e05656" : "#f5bc19",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: conn === "connected" ? "#10B981" : conn === "disconnected" ? "#e05656" : "#f5bc19",
              }}
            />
            {conn === "connected" ? "WhatsApp conectado" + (connPhone ? " · " + connPhone : "") : conn === "disconnected" ? "Desconectado" : conn === "qr" ? "Escanea el QR" : conn === "pairing" ? "Código generado" : "Conectando..."}
          </span>
          {conn === "connected" ? (
            <button onClick={disconnect} className="btn-outline" style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}>
              Desconectar
            </button>
          ) : (
            <button onClick={connect} className="btn-primary" style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}>
              Conectar WhatsApp
            </button>
          )}
          <button onClick={() => setShowConfig(!showConfig)} className="btn-outline" style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}>
            <Settings2 size={14} /> Agente
          </button>
        </div>
      </div>

      {/* QR / Pairing modal */}
      {(conn === "qr" || conn === "pairing") && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)" }}>
          <div
            style={{
              background: "var(--admin-bg-secondary)",
              border: "1px solid var(--admin-border)",
              borderRadius: "1rem",
              padding: "1.5rem",
              maxWidth: 320,
              width: "90%",
              position: "relative",
            }}
          >
            <button onClick={disconnect} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", color: "var(--admin-text-muted)", cursor: "pointer" }}>
              <X size={18} />
            </button>
            {conn === "pairing" && pairingCode ? (
              <div style={{ textAlign: "center", paddingTop: "0.5rem" }}>
                <p style={{ color: "var(--admin-text-muted)", fontSize: "0.75rem", marginBottom: "0.75rem" }}>
                  En WhatsApp &gt; Dispositivos vinculados &gt; Vincular con código
                </p>
                <div style={{ background: "var(--admin-bg)", borderRadius: "0.75rem", padding: "0.9rem 1rem", display: "inline-block", border: "1px solid var(--admin-border)" }}>
                  <span style={{ color: "var(--admin-accent)", fontSize: "1.6rem", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.3em" }}>
                    {pairingCode}
                  </span>
                </div>
                <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                  <button onClick={requestCode} className="btn-outline" style={{ fontSize: "0.78rem" }}>Regenerar</button>
                  <button onClick={disconnect} className="btn-outline" style={{ fontSize: "0.78rem", color: "#e05656" }}>Cancelar</button>
                </div>
              </div>
            ) : conn === "qr" && qrString ? (
              <div style={{ paddingTop: "0.5rem" }}>
                <QRDisplay qrString={qrString} />
                <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                  <button onClick={requestCode} className="btn-outline" style={{ fontSize: "0.78rem" }}>Usar código</button>
                  <button onClick={disconnect} className="btn-outline" style={{ fontSize: "0.78rem", color: "#e05656" }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "var(--admin-text-muted)", fontSize: "0.85rem", padding: "1.5rem" }}>
                Conectando...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Config panel */}
      {showConfig && <AgentConfig onClose={() => setShowConfig(false)} />}

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, display: isMobile ? "block" : "grid", gridTemplateColumns: isMobile ? undefined : "300px 1fr", gap: "1rem" }}>
        {/* Lista de conversaciones */}
        <div style={{ backgroundColor: "var(--admin-bg-secondary)", border: "1px solid var(--admin-border)", borderRadius: "0.875rem", overflowY: "auto", display: isMobile && selected ? "none" : "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
          <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--admin-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>Conversaciones</span>
            <button onClick={loadConversations} style={{ background: "none", border: "none", color: "var(--admin-text-muted)", cursor: "pointer" }}>
              <RefreshCw size={14} />
            </button>
          </div>
          {conversations.length === 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--admin-text-muted)", fontSize: "0.8rem", padding: "1.5rem", textAlign: "center" }}>
              Sin conversaciones. Conecta WhatsApp para recibir mensajes.
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                style={{
                  textAlign: "left",
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid var(--admin-border)",
                  background: selectedId === c.id ? "var(--admin-bg-tertiary)" : "transparent",
                  cursor: "pointer",
                  borderLeft: selectedId === c.id ? "3px solid var(--admin-accent)" : "3px solid transparent",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--admin-text)" }}>
                    {c.name || c.phone}
                  </span>
                  <span
                    style={{
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      padding: "0.1rem 0.45rem",
                      borderRadius: "9999px",
                      background: c.mode === "AI" ? "rgba(245,188,25,0.15)" : "rgba(243,116,0,0.15)",
                      color: c.mode === "AI" ? "var(--admin-accent)" : "var(--brand-orange)",
                    }}
                  >
                    {c.mode === "AI" ? "IA" : "Humano"}
                  </span>
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--admin-text-muted)", marginTop: "0.2rem" }}>
                  {c.phone}
                </div>
                {c.last_message && (
                  <div style={{ fontSize: "0.7rem", color: "var(--admin-text-secondary)", marginTop: "0.2rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.last_role === "user" ? "→ " : c.last_role === "assistant" ? "← " : ""}{c.last_message}
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Chat */}
        <div style={{ backgroundColor: "var(--admin-bg-secondary)", border: "1px solid var(--admin-border)", borderRadius: "0.875rem", display: isMobile && !selected ? "none" : "flex", flexDirection: "column", minWidth: 0, height: "100%", minHeight: 0 }}>
          {!selected ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", color: "var(--admin-text-muted)" }}>
              <MessageCircle size={40} style={{ opacity: 0.25 }} />
              <p style={{ fontSize: "0.85rem", margin: 0 }}>Selecciona una conversación para ver los mensajes</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--admin-border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: 0 }}>
                  {isMobile && (
                    <button onClick={() => setSelectedId(null)} style={{ background: "none", border: "none", color: "var(--admin-text-secondary)", cursor: "pointer", padding: "0.25rem", flexShrink: 0 }}>
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: selected.mode === "AI" ? "rgba(245,188,25,0.15)" : "rgba(243,116,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {selected.mode === "AI" ? <Bot size={16} color="var(--admin-accent)" /> : <UserIcon size={16} color="var(--brand-orange)" />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--admin-text)" }}>{selected.name || selected.phone}</div>
                    <div style={{ fontSize: "0.68rem", color: "var(--admin-text-muted)", display: "flex", gap: "0.5rem" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem" }}><Phone size={10} /> {selected.phone}</span>
                      {selected.email && <span style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem" }}><Mail size={10} /> {selected.email}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                  <button
                    onClick={toggleMode}
                    className="btn-outline"
                    style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem", borderColor: selected.mode === "AI" ? "rgba(243,116,0,0.5)" : "rgba(245,188,25,0.5)", color: selected.mode === "AI" ? "var(--brand-orange)" : "var(--admin-accent)" }}
                  >
                    {selected.mode === "AI" ? "Cambiar a Humano" : "Cambiar a IA"}
                  </button>
                  <button onClick={removeConversation} style={{ background: "none", border: "none", color: "#e05656", cursor: "pointer", padding: "0.25rem" }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {messages.length === 0 ? (
                  <div style={{ margin: "auto", color: "var(--admin-text-muted)", fontSize: "0.8rem", textAlign: "center" }}>
                    Sin mensajes aún
                  </div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                      <div
                        className={m.role === "user" ? "chat-bubble-user" : m.role === "human" ? "chat-bubble-human" : "chat-bubble-assistant"}
                        style={{ maxWidth: "78%", padding: "0.6rem 0.9rem", fontSize: "0.85rem", lineHeight: 1.5 }}
                      >
                        <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.content}</div>
                        <div style={{ fontSize: "0.62rem", opacity: 0.6, marginTop: "0.25rem" }}>
                          {new Date(m.created_at * 1000).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                          {m.role === "human" ? " · asesor" : ""}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Composer */}
              <div style={{ padding: "0.75rem", borderTop: "1px solid var(--admin-border)" }}>
                {selected.mode === "HUMAN" ? (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendManual()}
                      placeholder="Escribe como asesor..."
                      className="input-field"
                      style={{ flex: 1 }}
                    />
                    <button onClick={sendManual} disabled={!input.trim() || busy} className="btn-primary" style={{ padding: "0.55rem 1.1rem" }}>
                      <Send size={15} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && forceAI()}
                      placeholder="Simular mensaje del cliente (respuesta IA)..."
                      className="input-field"
                      style={{ flex: 1 }}
                    />
                    <button onClick={forceAI} disabled={!input.trim() || busy} className="btn-primary" style={{ padding: "0.55rem 1.1rem" }}>
                      <Bot size={15} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AgentConfig({ onClose }: { onClose: () => void }) {
  const [config, setConfig] = useState({ delay_ms: 1500, temperature: 0.7, max_history: 10, ia_model: "deepseek-chat" });
  const [prompt, setPrompt] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/config/agent", { headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && d.ia_model && setConfig(d));
    fetch("/api/config/prompt", { headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setPrompt(d.prompt));
  }, []);

  async function saveConfig() {
    const token = localStorage.getItem("admin_token");
    await fetch("/api/config/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(config),
    });
    await fetch("/api/config/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ prompt }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const labelStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "var(--admin-text-secondary)",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex", justifyContent: "flex-end" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} onClick={onClose} />
      <div style={{ position: "relative", width: 340, height: "100%", background: "var(--admin-bg-secondary)", borderLeft: "1px solid var(--admin-border)", padding: "1.25rem", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, fontFamily: "var(--font-display)" }}>Configuración del agente</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--admin-text-muted)", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label style={labelStyle}>
            Tiempo de respuesta: {config.delay_ms} ms
            <input
              type="range"
              min={0}
              max={60000}
              step={500}
              value={config.delay_ms}
              onChange={(e) => setConfig({ ...config, delay_ms: Number(e.target.value) })}
              style={{ accentColor: "var(--brand-orange)" }}
            />
            <span style={{ fontSize: "0.65rem", fontWeight: 400, color: "var(--admin-text-muted)" }}>Retraso antes de responder para simular naturalidad</span>
          </label>

          <label style={labelStyle}>
            Temperatura: {config.temperature}
            <input
              type="range"
              min={0}
              max={1.5}
              step={0.1}
              value={config.temperature}
              onChange={(e) => setConfig({ ...config, temperature: Number(e.target.value) })}
              style={{ accentColor: "var(--brand-orange)" }}
            />
          </label>

          <label style={labelStyle}>
            Historial máximo: {config.max_history} mensajes
            <input
              type="range"
              min={4}
              max={30}
              step={2}
              value={config.max_history}
              onChange={(e) => setConfig({ ...config, max_history: Number(e.target.value) })}
              style={{ accentColor: "var(--brand-orange)" }}
            />
            <span style={{ fontSize: "0.65rem", fontWeight: 400, color: "var(--admin-text-muted)" }}>Menos mensajes = menos tokens consumidos</span>
          </label>

          <label style={labelStyle}>
            Modelo IA
            <input
              value={config.ia_model}
              onChange={(e) => setConfig({ ...config, ia_model: e.target.value })}
              className="input-field"
            />
            <span style={{ fontSize: "0.65rem", fontWeight: 400, color: "var(--admin-text-muted)" }}>deepseek-chat para conversacional</span>
          </label>

          <label style={labelStyle}>
            Prompt del agente
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={10}
              className="input-field"
              style={{ fontFamily: "monospace", fontSize: "0.7rem", resize: "vertical" }}
            />
          </label>

          <button onClick={saveConfig} className="btn-primary" style={{ width: "100%" }}>
            {saved ? "Guardado ✓" : "Guardar configuración"}
          </button>
        </div>
      </div>
    </div>
  );
}
