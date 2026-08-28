import { NextRequest, NextResponse } from "next/server";
import { getCitaById, updateCita, updateCitaEstado, deleteCita } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthFromRequest(req);
  if (!auth.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const c = getCitaById(Number(id));
  if (!c) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json(c);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthFromRequest(req);
  if (!auth.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  if (body.estado && !body.nombre) {
    updateCitaEstado(Number(id), body.estado);
  } else {
    updateCita(Number(id), body);
  }
  return NextResponse.json(getCitaById(Number(id)));
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthFromRequest(req);
  if (!auth.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  deleteCita(Number(id));
  return NextResponse.json({ ok: true });
}
