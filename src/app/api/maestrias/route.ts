import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { getMaestrias, getMaestriasAll, createMaestria } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (auth.valid) return NextResponse.json(getMaestriasAll());
  return NextResponse.json(getMaestrias());
}

export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const body = await req.json();
    if (!body.nombre) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }
    const id = createMaestria(body);
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[maestrias] Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
