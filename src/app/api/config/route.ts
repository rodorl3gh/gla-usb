import { NextResponse } from "next/server";
import { getConfig } from "@/lib/db";

export async function GET() {
  return NextResponse.json(getConfig());
}
