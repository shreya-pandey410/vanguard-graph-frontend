import { anthropicClient, AI_MODEL } from "../../../config/ai";

export async function callAnthropic(prompt: string, maxTokens = 512): Promise<string> {
  const response = await anthropicClient.messages.create({
    model: AI_MODEL,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected AI response type");
  return content.text.trim();
}
