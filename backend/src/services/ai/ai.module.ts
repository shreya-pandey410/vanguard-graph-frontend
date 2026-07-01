import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { AI_PROVIDER, AiProvider } from './providers/ai-provider.interface';
import { AnthropicProvider } from './providers/anthropic.provider';
import { OpenAiProvider } from './providers/openai.provider';
import { MockAiProvider } from './providers/mock.provider';
import { AiConfig } from '../../config/ai';

const AiProviderFactory = {
  provide: AI_PROVIDER,
  inject: [ConfigService],
  useFactory: (config: ConfigService): AiProvider => {
    const aiConfig = config.getOrThrow<AiConfig>('ai');

    switch (aiConfig.provider) {
      case 'anthropic':
        return new AnthropicProvider(config);
      case 'openai':
        return new OpenAiProvider(config);
      case 'mock':
      default:
        return new MockAiProvider();
    }
  },
};

@Module({
  providers: [AiProviderFactory, AiService],
  exports: [AiService],
})
export class AiModule {}
