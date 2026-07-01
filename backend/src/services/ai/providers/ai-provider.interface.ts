export interface AiCompletionOptions {
  /** System-level instruction that frames the model's role */
  systemPrompt: string;
  /** The fully-rendered user prompt */
  userPrompt: string;
  /** Upper bound on response tokens */
  maxTokens?: number;
  /** 0 = deterministic, 1 = creative */
  temperature?: number;
}

export interface AiCompletionResult {
  /** Raw text returned by the model */
  text: string;
  /** Which model actually served the request */
  model: string;
  /** Token usage for cost tracking */
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export const AI_PROVIDER = Symbol('AI_PROVIDER');

export interface AiProvider {
  /**
   * Send a prompt to the underlying model and return the completion.
   * Implementations are responsible for their own retry/timeout logic.
   */
  complete(options: AiCompletionOptions): Promise<AiCompletionResult>;

  /** Human-readable identifier used in logs */
  readonly providerName: string;
}
