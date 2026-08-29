import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/google";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const base = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

  if (error || !code) {
    return NextResponse.redirect(`${base}/admin/citas?google=error`);
  }

  try {
    await exchangeCode(code);
    return NextResponse.redirect(`${base}/admin/citas?google=connected`);
  } catch {
    return NextResponse.redirect(`${base}/admin/citas?google=error`);
  }
}
