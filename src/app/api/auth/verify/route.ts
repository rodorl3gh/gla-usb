import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
  const verified = verifyToken(token || bearer);
  return NextResponse.json({
    valid: verified.valid,
    role: verified.role,
    username: verified.username,
  });
}
