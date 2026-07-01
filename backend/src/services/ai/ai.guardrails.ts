// Guardrails: sanitize inputs before sending to AI to avoid prompt injection

export function sanitizeForPrompt(input: string, maxLength = 200): string {
  return input
    .replace(/[`"\\]/g, "") // strip backticks, quotes, backslashes
    .replace(/\n{3,}/g, "\n\n") // collapse excessive newlines
    .trim()
    .slice(0, maxLength);
}

export function sanitizeMerchantData(data: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    result[key] = sanitizeForPrompt(value);
  }
  return result;
}
