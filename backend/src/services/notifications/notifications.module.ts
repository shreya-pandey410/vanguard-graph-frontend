import { Module } from '@nestjs/common';
import { SlackService } from './slack.service';
import { WebhookService } from './webhook.service';

@Module({
  providers: [SlackService, WebhookService],
  exports: [SlackService, WebhookService],
})
export class NotificationsModule {}
