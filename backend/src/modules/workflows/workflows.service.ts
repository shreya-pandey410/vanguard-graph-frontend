import { WorkflowsRepository } from './workflows.repository';
import {
  Workflow,
  WorkflowStep,
  WorkflowAction,
  WorkflowStatus,
  StepStatus,
  RiskDecisionInput,
} from './workflows.types';
import { randomUUID } from 'crypto';

export class WorkflowsService {
  constructor(private readonly repo: WorkflowsRepository) {}

  async runForRiskDecision(input: RiskDecisionInput): Promise<Workflow> {
    const now = new Date().toISOString();

    const workflow: Workflow = {
      id: randomUUID(),
      transactionId: input.transactionId,
      riskScore: input.riskScore,
      triggeredRules: input.triggeredRules,
      status: WorkflowStatus.IN_PROGRESS,
      steps: this.buildSteps(input.riskScore),
      createdAt: now,
      updatedAt: now,
    };

    await this.repo.save(workflow);
    return this.execute(workflow);
  }

  private buildSteps(score: number): WorkflowStep[] {
    const actions: WorkflowAction[] = [];

    if (score >= 80) {
      actions.push(WorkflowAction.BLOCK, WorkflowAction.NOTIFY, WorkflowAction.ESCALATE);
    } else if (score >= 50) {
      actions.push(WorkflowAction.STEP_UP_AUTH, WorkflowAction.FLAG_FOR_REVIEW, WorkflowAction.NOTIFY);
    } else if (score >= 30) {
      actions.push(WorkflowAction.FLAG_FOR_REVIEW);
    } else {
      actions.push(WorkflowAction.ALLOW);
    }

    return actions.map((action) => ({ action, status: StepStatus.PENDING }));
  }

  private async execute(workflow: Workflow): Promise<Workflow> {
    for (const step of workflow.steps) {
      try {
        await this.executeAction(step.action, workflow);
        step.status = StepStatus.SUCCESS;
        step.executedAt = new Date().toISOString();
      } catch (err) {
        step.status = StepStatus.FAILED;
        step.error = err instanceof Error ? err.message : 'unknown';
        workflow.status = WorkflowStatus.FAILED;
        workflow.updatedAt = new Date().toISOString();
        await this.repo.save(workflow);
        console.error(`Workflow ${workflow.id} failed at ${step.action}`, err);
        return workflow;
      }
    }

    workflow.status = WorkflowStatus.COMPLETED;
    workflow.updatedAt = new Date().toISOString();
    return this.repo.save(workflow);
  }

  private async executeAction(action: WorkflowAction, wf: Workflow): Promise<void> {
    switch (action) {
      case WorkflowAction.BLOCK:
        console.log(`Blocking txn ${wf.transactionId}`);
        break;
      case WorkflowAction.STEP_UP_AUTH:
        console.log(`Step-up auth required for ${wf.transactionId}`);
        break;
      case WorkflowAction.FLAG_FOR_REVIEW:
        console.log(`Flagged ${wf.transactionId} for manual review`);
        break;
      case WorkflowAction.NOTIFY:
        console.log(`Notifying stakeholders for ${wf.transactionId}`);
        break;
      case WorkflowAction.ESCALATE:
        console.log(`Escalating ${wf.transactionId} to fraud team`);
        break;
      case WorkflowAction.ALLOW:
        console.log(`Allowing ${wf.transactionId}`);
        break;
    }
  }

  async getById(id: string): Promise<Workflow> {
    const wf = await this.repo.findById(id);
    if (!wf) throw new Error(`Workflow ${id} not found`);
    return wf;
  }

  async getByTransaction(transactionId: string): Promise<Workflow> {
    const wf = await this.repo.findByTransactionId(transactionId);
    if (!wf) throw new Error(`No workflow for transaction ${transactionId}`);
    return wf;
  }
}