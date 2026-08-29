import { NextResponse } from "next/server";
import { disconnectWhatsApp } from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function POST() {
  try {
    await disconnectWhatsApp();
    return NextResponse.json({ status: "disconnected" });
  } catch (err) {
    return NextResponse.json({ error: "Error al desconectar" }, { status: 500 });
  }
}
