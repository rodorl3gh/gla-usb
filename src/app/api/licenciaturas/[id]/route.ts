import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { getLicenciaturaById, updateLicenciatura, deleteLicenciatura } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const l = getLicenciaturaById(Number(id));
  if (!l) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json(l);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthFromRequest(req);
  if (!auth.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  updateLicenciatura(Number(id), body);
  return NextResponse.json(getLicenciaturaById(Number(id)));
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthFromRequest(req);
  if (!auth.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  deleteLicenciatura(Number(id));
  return NextResponse.json({ ok: true });
}
