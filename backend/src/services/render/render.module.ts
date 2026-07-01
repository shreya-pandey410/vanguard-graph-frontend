import { Module } from '@nestjs/common';
import { RenderClient } from './render-client';
import { WorkflowTriggerService } from './workflow-trigger';
import { WorkflowStatusService } from './workflow-status';

@Module({
  providers: [RenderClient, WorkflowTriggerService, WorkflowStatusService],
  exports: [WorkflowTriggerService, WorkflowStatusService],
})
export class RenderModule {}
