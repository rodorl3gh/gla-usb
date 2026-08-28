import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { getCitas, createCita } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json(getCitas());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.nombre || !body.fecha || !body.hora) {
      return NextResponse.json(
        { success: false, error: "Nombre, fecha y hora son requeridos" },
        { status: 400 }
      );
    }
    const id = createCita(body);
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[citas] Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
