import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient(): OpenAI | null {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey || apiKey.length < 5) return null;
  if (!client) {
    client = new OpenAI({
      apiKey,
      baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    });
  }
  return client;
}

export function getAgentModel(): string {
  return process.env.DEEPSEEK_MODEL || "deepseek-chat";
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

// Genera una respuesta conversacional breve. Devuelve null si no hay API key.
export async function generateAIResponse(
  systemPrompt: string,
  history: ChatTurn[],
  userMessage: string,
  temperature: number,
  model?: string
): Promise<string | null> {
  const c = getClient();
  if (!c) {
    console.error("[agent] No hay DEEPSEEK_API_KEY configurada. El agente no puede responder.");
    return null;
  }

  try {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history.map((h) => ({ role: h.role, content: h.content }) as OpenAI.Chat.Completions.ChatCompletionMessageParam),
      { role: "user", content: userMessage },
    ];

    const response = await c.chat.completions.create({
      model: model || getAgentModel(),
      messages,
      temperature,
      max_tokens: 2000,
    });

    return response.choices[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error("[agent] Error generando respuesta:", err);
    return null;
  }
}
