import { Module } from '@nestjs/common';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { WorkflowsRepository } from './workflows.repository';

// Workflow orchestrators
import { MerchantOnboardingWorkflow } from '../../workflows/merchant-onboarding/merchant-onboarding.workflow';
import { MerchantOnboardingActivities } from '../../workflows/merchant-onboarding/merchant-onboarding.activities';
import { PayoutChangeWorkflow } from '../../workflows/payout-change/payout-change.workflow';
import { PayoutChangeActivities } from '../../workflows/payout-change/payout-change.activities';

// Service modules
import { AiModule } from '../../services/ai/ai.module';
import { EnrichmentModule } from '../../services/enrichment/enrichment.module';
import { NotificationsModule } from '../../services/notifications/notifications.module';

@Module({
  imports: [AiModule, EnrichmentModule, NotificationsModule],
  controllers: [WorkflowsController],
  providers: [
    WorkflowsService,
    WorkflowsRepository,
    MerchantOnboardingWorkflow,
    MerchantOnboardingActivities,
    PayoutChangeWorkflow,
    PayoutChangeActivities,
  ],
})
export class WorkflowsModule {}
