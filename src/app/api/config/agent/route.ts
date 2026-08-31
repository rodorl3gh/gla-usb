import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { getAgentConfig, setAgentConfig } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json(
    getAgentConfig() || { delay_ms: 1500, temperature: 0.7, max_history: 10, ia_model: "deepseek-chat" }
  );
}

export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json();
  setAgentConfig({
    delay_ms: body.delay_ms,
    temperature: body.temperature,
    max_history: body.max_history,
    ia_model: body.ia_model,
  });
  return NextResponse.json({ saved: true });
}
