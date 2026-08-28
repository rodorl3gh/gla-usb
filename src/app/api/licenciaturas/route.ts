import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { getLicenciaturas, getLicenciaturasAll, createLicenciatura } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (auth.valid) return NextResponse.json(getLicenciaturasAll());
  return NextResponse.json(getLicenciaturas());
}

export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const body = await req.json();
    if (!body.nombre) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }
    const id = createLicenciatura(body);
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[licenciaturas] Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
