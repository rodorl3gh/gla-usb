import { NextResponse } from "next/server";
import { restartWhatsApp } from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function POST() {
  try {
    restartWhatsApp().catch((err) => console.error("[restart] Error:", err));
    return NextResponse.json({ status: "connecting" });
  } catch (err) {
    return NextResponse.json({ error: "Error al reiniciar" }, { status: 500 });
  }
}
