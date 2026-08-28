import { NextRequest, NextResponse } from "next/server";
import { getHorasDisponibles } from "@/lib/db";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const fecha = url.searchParams.get("fecha");
  if (!fecha) return NextResponse.json([]);
  return NextResponse.json(getHorasDisponibles(fecha));
}
