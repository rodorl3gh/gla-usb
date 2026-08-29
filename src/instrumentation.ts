// Auto-iniciar WhatsApp al arrancar el servidor si hay sesión previa
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const fs = await import("fs");
    const path = await import("path");
    const authDir = path.join(process.cwd(), "data", "auth");
    const credsFile = path.join(authDir, "creds.json");

    if (fs.existsSync(credsFile)) {
      console.log("[Startup] Sesión WhatsApp previa detectada, auto-reconectando...");
      try {
        const { startWhatsApp } = await import("@/lib/whatsapp");
        startWhatsApp();
      } catch (err) {
        console.error("[Startup] Error al auto-reconectar WhatsApp:", err);
      }
    } else {
      console.log("[Startup] Sin sesión previa de WhatsApp. Usa el panel admin para conectar.");
    }
  }
}
