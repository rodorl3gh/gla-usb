"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function QRDisplay({ qrString }: { qrString: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && qrString) {
      QRCode.toCanvas(canvasRef.current, qrString, {
        width: 220,
        margin: 2,
        color: { dark: "#0b0d11", light: "#ffffff" },
      }).catch(() => {});
    }
  }, [qrString]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
      <div style={{ background: "#fff", padding: "0.75rem", borderRadius: "0.75rem" }}>
        <canvas ref={canvasRef} style={{ width: "100%", maxWidth: 220, height: "auto" }} />
      </div>
      <p style={{ color: "var(--admin-text-muted)", fontSize: "0.68rem", textAlign: "center", maxWidth: 260, margin: 0 }}>
        Abre WhatsApp &gt; Dispositivos vinculados y escanea este código
      </p>
    </div>
  );
}
