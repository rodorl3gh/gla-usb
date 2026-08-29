import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { getAgentPrompt, setAgentPrompt } from "@/lib/db";
import { DEFAULT_AGENT_PROMPT } from "@/lib/agent-prompt";

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.json({ prompt: getAgentPrompt() || DEFAULT_AGENT_PROMPT });
}

export async function POST(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth.valid) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json();
  if (typeof body.prompt === "string") {
    setAgentPrompt(body.prompt);
  }
  return NextResponse.json({ saved: true });
}
