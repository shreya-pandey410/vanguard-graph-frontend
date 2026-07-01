export interface RetryPolicy {
  maxAttempts: number;
  initialDelayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 30000,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY,
  label = "operation"
): Promise<T> {
  let attempt = 0;
  let delay = policy.initialDelayMs;

  while (attempt < policy.maxAttempts) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= policy.maxAttempts) {
        console.error(`[Retry] ${label} failed after ${attempt} attempts`);
        throw err;
      }
      console.warn(`[Retry] ${label} attempt ${attempt} failed, retrying in ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.min(delay * policy.backoffMultiplier, policy.maxDelayMs);
    }
  }
  throw new Error(`${label} exhausted retries`);
}
