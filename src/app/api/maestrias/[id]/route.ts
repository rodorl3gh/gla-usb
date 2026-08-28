import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { getMaestriaById, updateMaestria, deleteMaestria } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const m = getMaestriaById(Number(id));
  if (!m) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json(m);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthFromRequest(req);
  if (!auth.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  updateMaestria(Number(id), body);
  return NextResponse.json(getMaestriaById(Number(id)));
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthFromRequest(req);
  if (!auth.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  deleteMaestria(Number(id));
  return NextResponse.json({ ok: true });
}
