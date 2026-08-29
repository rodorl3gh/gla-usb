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
  return process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
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
  temperature: number
): Promise<string | null> {
  const c = getClient();
  if (!c) return null;

  try {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history.map((h) => ({ role: h.role, content: h.content }) as OpenAI.Chat.Completions.ChatCompletionMessageParam),
      { role: "user", content: userMessage },
    ];

    const response = await c.chat.completions.create({
      model: getAgentModel(),
      messages,
      temperature,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error("[agent] Error generando respuesta:", err);
    return null;
  }
}
