import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  AiProvider,
  AiCompletionOptions,
  AiCompletionResult,
} from './ai-provider.interface';
import { AiConfig } from '../../../config/ai';

@Injectable()
export class OpenAiProvider implements AiProvider {
  readonly providerName = 'openai';
  private readonly logger = new Logger(OpenAiProvider.name);
  private readonly client: OpenAI;
  private readonly model: string;
  private readonly maxTokens: number;

  constructor(private readonly config: ConfigService) {
    const aiConfig = this.config.getOrThrow<AiConfig>('ai');

    this.client = new OpenAI({ apiKey: aiConfig.openai.apiKey });
    this.model = aiConfig.openai.model;
    this.maxTokens = aiConfig.maxTokens;
  }

  async complete(options: AiCompletionOptions): Promise<AiCompletionResult> {
    const { systemPrompt, userPrompt, maxTokens, temperature = 0.3 } = options;

    this.logger.debug(`Sending prompt to OpenAI [model=${this.model}]`);

    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: maxTokens ?? this.maxTokens,
      temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const choice = response.choices[0];
    if (!choice?.message?.content) {
      throw new Error('OpenAI returned no content');
    }

    return {
      text: choice.message.content,
      model: response.model,
      usage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
    };
  }
}
