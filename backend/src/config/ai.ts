import Anthropic from "@anthropic-ai/sdk";

export const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const AI_MODEL = "claude-3-5-haiku-20241022";
export const AI_PROVIDER = (process.env.AI_PROVIDER || "anthropic") as "anthropic" | "mock";
