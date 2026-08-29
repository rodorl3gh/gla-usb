import { NextResponse } from "next/server";
import { getConnectionState } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    getConnectionState() || { status: "disconnected", qrString: null, pairingCode: null, phone: null }
  );
}
