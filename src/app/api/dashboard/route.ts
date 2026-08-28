import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { getDashboardStats } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json(getDashboardStats());
}
