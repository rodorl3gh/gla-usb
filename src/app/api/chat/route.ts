import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import {
  getConversations,
  setConversationMode,
  deleteConversation,
  getMessages,
  getConversationById,
  insertMessage,
} from "@/lib/db";
import { sendManualMessage, isConnected } from "@/lib/whatsapp";
import { processMessage } from "@/lib/chat-engine";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const url = new URL(req.url);
  const conversationId = url.searchParams.get("conversationId");
  if (conversationId) {
    return NextResponse.json(getMessages(Number(conversationId)));
  }
  return NextResponse.json(getConversations());
}

export async function PUT(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { id, mode } = body;
  if (!id || (mode !== "AI" && mode !== "HUMAN")) {
    return NextResponse.json({ error: "id y mode requeridos" }, { status: 400 });
  }
  setConversationMode(Number(id), mode);
  return NextResponse.json({ id: Number(id), mode });
}

export async function DELETE(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });
  deleteConversation(Number(id));
  return NextResponse.json({ ok: true });
}

// Enviar mensaje manual (modo HUMANO) o forzar respuesta IA
export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { conversationId, message, mode } = body;
  if (!conversationId || !message) {
    return NextResponse.json({ error: "conversationId y message requeridos" }, { status: 400 });
  }

  const conv = getConversationById(Number(conversationId));
  if (!conv) return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });

  if (mode === "HUMAN") {
    // Enviar manualmente como humano
    insertMessage(conv.id, "human", message);
    let waEnviado = false;
    if (isConnected()) {
      const jid = conv.remote_jid || conv.phone;
      waEnviado = await sendManualMessage(jid, message);
    }
    return NextResponse.json({ ok: true, waEnviado });
  }

  // Forzar respuesta IA (se guarda el mensaje como user y se procesa)
  const resp = await processMessage({
    phone: conv.phone,
    pushName: conv.name || undefined,
    text: message,
    timestamp: Math.floor(Date.now() / 1000),
    remoteJid: conv.remote_jid || undefined,
  });

  // Enviar la respuesta también por WhatsApp si está conectado
  let waEnviado = false;
  if (resp && isConnected()) {
    const jid = conv.remote_jid || conv.phone;
    waEnviado = await sendManualMessage(jid, resp);
  }

  return NextResponse.json({ ok: true, reply: resp, waEnviado });
}
