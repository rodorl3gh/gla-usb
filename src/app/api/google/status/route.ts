import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { isGoogleConfigured, isGoogleConnected, disconnectGoogle } from "@/lib/google";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!getAuthFromRequest(request).valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json({ configured: isGoogleConfigured(), connected: isGoogleConnected() });
}

export async function DELETE(request: NextRequest) {
  if (!getAuthFromRequest(request).valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  disconnectGoogle();
  return NextResponse.json({ ok: true });
}
