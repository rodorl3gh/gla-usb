import { NextResponse } from "next/server";
import { isGoogleConfigured, getAuthUrl } from "@/lib/google";

export const runtime = "nodejs";

export async function GET() {
  if (!isGoogleConfigured()) {
    return NextResponse.json({ error: "Google no está configurado en el servidor." }, { status: 400 });
  }
  return NextResponse.redirect(getAuthUrl());
}
