import {
  getDb,
  getAgentConfig,
  getAgentPrompt,
  findOrCreateConversation,
  insertMessage,
  getRecentMessages,
  setConversationEmail,
  buildSchoolContext,
} from "./db";
import { generateAIResponse, type ChatTurn } from "./agent-ai";
import { DEFAULT_AGENT_PROMPT } from "./agent-prompt";

interface IncomingMessage {
  phone: string;
  pushName?: string;
  text: string;
  timestamp: number;
  remoteJid?: string;
}

// Detecta si el mensaje contiene un correo electrónico
function extractEmail(text: string): string | null {
  const m = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return m ? m[0] : null;
}

// Procesa un mensaje entrante de WhatsApp. Devuelve el texto de respuesta o null.
export async function processMessage(msg: IncomingMessage): Promise<string | null> {
  const db = getDb();
  const conv = findOrCreateConversation(msg.phone, msg.pushName, msg.remoteJid);

  // Guardar mensaje entrante
  insertMessage(conv.id, "user", msg.text);

  // Guardar email si viene en el mensaje
  const email = extractEmail(msg.text);
  if (email && !conv.email) {
    setConversationEmail(conv.id, email);
    conv.email = email;
  }

  // Si está en modo HUMANO, no responder automáticamente
  if (conv.mode === "HUMAN") {
    return null;
  }

  const config = getAgentConfig();
  const schoolContext = buildSchoolContext();
  const customPrompt = getAgentPrompt();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const portalInfo = baseUrl
    ? `\n\n=== PORTAL WEB DE AGENDAMIENTO ===\nEl prospecto agenda su plática informativa en: ${baseUrl}/agendar\nEn ese portal debe hacer clic en "Agendar plática informativa" y seguir los pasos (elegir programa, fecha y hora). Comparte este enlace cuando invites a agendar.`
    : "";
  const systemPrompt =
    (customPrompt || DEFAULT_AGENT_PROMPT) +
    "\n\n" +
    "INFORMACIÓN OFICIAL DE LA UNIVERSIDAD (fuente única, usa estos datos exactos):\n" +
    schoolContext +
    portalInfo;

  // Historial reciente (ahorro de tokens)
  const maxHistory = config.max_history || 10;
  const historyRows = getRecentMessages(conv.id, maxHistory + 1);
  // Excluye el último mensaje (el que acabamos de insertar) del historial
  const history: ChatTurn[] = historyRows
    .slice(0, -1)
    .filter((h: any) => h.role === "user" || h.role === "assistant")
    .map((h: any) => ({ role: h.role as "user" | "assistant", content: h.content }));

  const reply = await generateAIResponse(
    systemPrompt,
    history,
    msg.text,
    config.temperature || 0.7,
    config.ia_model
  );

  if (reply) {
    insertMessage(conv.id, "assistant", reply);
  }

  return reply;
}

export function addManualMessage(convId: number, content: string) {
  insertMessage(convId, "human", content);
}
