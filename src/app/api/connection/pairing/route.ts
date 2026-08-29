import { NextRequest, NextResponse } from "next/server";
import { requestPairingCode } from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phoneNumber = String(body.phoneNumber || "").trim();
    if (!phoneNumber) {
      return NextResponse.json({ error: "Número requerido" }, { status: 400 });
    }
    const code = await requestPairingCode(phoneNumber);
    if (code) {
      return NextResponse.json({ pairingCode: code });
    }
    return NextResponse.json({ error: "No se pudo generar el código" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Error al solicitar código" }, { status: 500 });
  }
}
