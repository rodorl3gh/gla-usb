// Servicio WhatsApp Baileys para la Universidad Superior Bajío (USB)
import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  type WASocket,
  type BaileysEventMap,
  type ConnectionState as WAConnectionState,
} from "@whiskeysockets/baileys";
import pino from "pino";
import path from "path";
import fs from "fs";
import { setConnectionState } from "./db";
import { processMessage } from "./chat-engine";

const AUTH_DIR = path.join(process.cwd(), "data", "auth");
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

let sock: WASocket | null = null;
let shouldReconnect = true;
const logger = pino({ level: "silent" });

if (typeof globalThis !== "undefined") {
  (globalThis as any).__usbWaSock = null;
}

function setSock(s: WASocket | null) {
  sock = s;
  try {
    (globalThis as any).__usbWaSock = s;
  } catch {}
}

function getGlobalSock(): WASocket | null {
  return (globalThis as any)?.__usbWaSock ?? sock;
}

export async function startWhatsApp(): Promise<void> {
  shouldReconnect = true;
  console.log("[WA] Iniciando conexión...");

  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  const newSock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: ["USB Bajío", "Chrome", "20.0.04"],
    logger,
    printQRInTerminal: false,
  });
  setSock(newSock);

  newSock.ev.on("creds.update", saveCreds);

  newSock.ev.on("connection.update", (update: Partial<WAConnectionState>) => {
    const { qr, connection, lastDisconnect } = update;
    const pairingCode = (update as any).pairingCode;

    if (pairingCode && !qr) {
      setConnectionState({ status: "pairing", qrString: null, pairingCode });
    }

    if (qr) {
      setConnectionState({ status: "qr", qrString: qr });
    }

    if (connection === "connecting") {
      setConnectionState({ status: "connecting" });
    }

    if (connection === "open") {
      const phone = newSock?.user?.id?.split(":")[0] ?? null;
      console.log("[WA] Conectado: " + phone);
      setConnectionState({ status: "connected", qrString: null, phone });
    }

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
      console.log("[WA] Cerrado. Código: " + statusCode);

      if (statusCode === DisconnectReason.loggedOut) {
        shouldReconnect = false;
        setSock(null);
        setConnectionState({ status: "disconnected", qrString: null });
        clearAuthDir();
        return;
      }

      setConnectionState({ status: "disconnected", qrString: null });

      if (shouldReconnect) {
        if (statusCode === 440) {
          clearAuthDir();
        }
        setTimeout(() => startWhatsApp(), 3000);
      }
    }
  });

  newSock.ev.on("messages.upsert", async (msg: BaileysEventMap["messages.upsert"]) => {
    const { messages, type } = msg;
    if (type !== "notify") return;
    for (const message of messages) {
      if (!message.key || !message.message) continue;
      if (message.key.fromMe) continue;
      const remoteJid = message.key.remoteJid;
      if (!remoteJid || remoteJid === "status@broadcast") continue;
      const textMessage =
        message.message.conversation ||
        message.message.extendedTextMessage?.text ||
        message.message.imageMessage?.caption ||
        message.message.videoMessage?.caption ||
        message.message.buttonsResponseMessage?.selectedButtonId ||
        "";
      if (!textMessage) continue;
      const phone = remoteJid.split("@")[0];
      const pushName = message.pushName || undefined;
      console.log("[WA] Msg de " + phone + ": " + textMessage.slice(0, 60));

      try {
        const reply = await processMessage({ phone, pushName, text: textMessage, timestamp: Date.now(), remoteJid });
        const currentSock = getGlobalSock();
        if (reply && currentSock) {
          await currentSock.sendMessage(remoteJid, { text: reply });
          console.log("[WA] Respuesta enviada a " + phone);
        }
      } catch (err) {
        console.error("[WA] Error procesando mensaje:", err);
      }
    }
  });
}

export async function disconnectWhatsApp(): Promise<void> {
  shouldReconnect = false;
  if (sock) {
    try {
      await sock.logout();
    } catch {}
    setSock(null);
  }
  setConnectionState({ status: "disconnected", qrString: null });
  console.log("[WA] Desconectado");
}

export async function restartWhatsApp(): Promise<void> {
  shouldReconnect = false;
  if (sock) {
    try {
      await sock.logout();
    } catch {}
    setSock(null);
  }
  clearAuthDir();
  setConnectionState({ status: "disconnected", qrString: null });
  setTimeout(() => startWhatsApp(), 500);
}

function clearAuthDir() {
  try {
    if (fs.existsSync(AUTH_DIR)) {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  } catch (err) {
    console.error("[WA] Error limpiando auth:", err);
  }
}

export function isConnected(): boolean {
  const s = getGlobalSock();
  return s !== null && s.user !== undefined;
}

export async function sendManualMessage(phoneOrJid: string, text: string): Promise<boolean> {
  const s = getGlobalSock();
  if (!s || !s.user) return false;
  const candidates: string[] = [];
  if (phoneOrJid.includes("@")) {
    candidates.push(phoneOrJid);
  } else {
    candidates.push(phoneOrJid + "@s.whatsapp.net");
    candidates.push(phoneOrJid + "@c.us");
  }
  for (const jid of candidates) {
    try {
      await s.sendMessage(jid, { text });
      return true;
    } catch {
      /* intenta siguiente */
    }
  }
  return false;
}

export async function requestPairingCode(phoneNumber: string): Promise<string | null> {
  const s = getGlobalSock();
  if (!s) return null;
  try {
    const code = await (s as any).requestPairingCode(phoneNumber);
    return typeof code === "string" ? code : null;
  } catch {
    return null;
  }
}
