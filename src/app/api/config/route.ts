import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { getConfig, updateConfig } from "@/lib/db";

export async function GET() {
  return NextResponse.json(getConfig());
}

export async function PUT(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth.valid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const updated = updateConfig(body);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[config] Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
