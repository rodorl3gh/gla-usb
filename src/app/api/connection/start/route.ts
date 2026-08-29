import { NextResponse } from "next/server";
import { restartWhatsApp } from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function POST() {
  try {
    restartWhatsApp().catch((err) => console.error("[start] Error:", err));
    return NextResponse.json({ status: "connecting" });
  } catch (err) {
    return NextResponse.json({ error: "Error al iniciar conexión" }, { status: 500 });
  }
}
