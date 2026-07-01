import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Neo4jService } from '../../database/neo4j/neo4j.service';
import { IpRiskService } from '../../services/enrichment/ip-risk.service';
import { DeviceFingerprintService } from '../../services/enrichment/device-fingerprint.service';
import { AiService } from '../../services/ai/ai.service';
import { SlackService } from '../../services/notifications/slack.service';
import { WebhookService } from '../../services/notifications/webhook.service';
import { RiskLevel, WorkflowStatus } from '@prisma/client';
import { ActivityContext } from '../shared/activity-context';
import { withRetry, ENRICHMENT_RETRY_POLICY } from '../shared/retry-policy';
import { PayoutChangeInput, PayoutChangeRiskScore } from './payout-change.types';
import { RiskMemoOutput, RingSummaryOutput, NextActionOutput } from '../../services/ai/ai.schemas';

@Injectable()
export class PayoutChangeActivities {
  private readonly logger = new Logger(PayoutChangeActivities.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly neo4j: Neo4jService,
    private readonly ipRiskService: IpRiskService,
    private readonly deviceFingerprintService: DeviceFingerprintService,
    private readonly aiService: AiService,
    private readonly slackService: SlackService,
    private readonly webhookService: WebhookService,
  ) {}

  async validateMerchantExists(
    merchantId: string,
    ctx: ActivityContext,
  ): Promise<void> {
    ctx.logger.log(`Validating merchant exists [id=${merchantId}]`);
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });
    if (!merchant) {
      throw Object.assign(
        new Error(`Merchant ${merchantId} not found`),
        { retryable: false },
      );
    }
  }

  async enrichPayoutChangeRequest(
    input: PayoutChangeInput,
    ctx: ActivityContext,
  ): Promise<{ ipRisk: Awaited<ReturnType<IpRiskService['analyze']>>; deviceFingerprint: Awaited<ReturnType<DeviceFingerprintService['analyze']>> }> {
    ctx.logger.log('Enriching payout change request');

    const [ipRisk, deviceFingerprint] = await Promise.all([
      withRetry(
        () => this.ipRiskService.analyze(input.requestedByIp ?? ''),
        ENRICHMENT_RETRY_POLICY,
        'ip-risk',
      ),
      withRetry(
        () => this.deviceFingerprintService.analyze(input.requestedByDeviceId ?? ''),
        ENRICHMENT_RETRY_POLICY,
        'device-fingerprint',
      ),
    ]);

    return { ipRisk, deviceFingerprint };
  }

  async updateGraphForPayoutChange(
    input: PayoutChangeInput,
    ctx: ActivityContext,
  ): Promise<{ sharedBankAccountCount: number }> {
    ctx.logger.log('Updating graph for payout change');

    // Link new bank account to merchant
    await this.neo4j.run(
      `MERGE (b:BankAccount {hash: $newHash})
       SET b.addedAt = datetime()
       MERGE (m:Merchant {id: $merchantId})
       MERGE (m)-[:USES_BANK_ACCOUNT]->(b)`,
      {
        newHash: input.newBankAccountHash,
        merchantId: input.merchantId,
      },
    );

    // Check how many other merchants use the same new bank account
    const result = await this.neo4j.run(
      `MATCH (m:Merchant)-[:USES_BANK_ACCOUNT]->(b:BankAccount {hash: $newHash})
       WHERE m.id <> $merchantId
       RETURN count(m) AS count`,
      {
        newHash: input.newBankAccountHash,
        merchantId: input.merchantId,
      },
    );

    const sharedBankAccountCount =
      result.records[0]?.get('count').toNumber() ?? 0;

    return { sharedBankAccountCount };
  }

  computePayoutRiskScore(
    enrichment: { ipRisk: Awaited<ReturnType<IpRiskService['analyze']>>; deviceFingerprint: Awaited<ReturnType<DeviceFingerprintService['analyze']>> },
    sharedBankAccountCount: number,
  ): PayoutChangeRiskScore {
    const signals: string[] = [];
    let score = 0;

    if (enrichment.ipRisk.isProxy || enrichment.ipRisk.isTor) {
      score += 25;
      signals.push('Request from proxy/TOR IP');
    }

    if (enrichment.ipRisk.abuseConfidenceScore > 80) {
      score += 20;
      signals.push('High-abuse IP on payout change request');
    }

    if (enrichment.deviceFingerprint.isKnownFraudDevice) {
      score += 30;
      signals.push('Request from known fraud device');
    }

    if (sharedBankAccountCount > 0) {
      const bonus = Math.min(sharedBankAccountCount * 15, 30);
      score += bonus;
      signals.push(
        `New bank account shared with ${sharedBankAccountCount} other merchant(s)`,
      );
    }

    const clamped = Math.min(score, 100);
    return { score: clamped, level: this.scoreToLevel(clamped), signals };
  }

  async generateAiContent(
    input: PayoutChangeInput,
    enrichment: { ipRisk: Awaited<ReturnType<IpRiskService['analyze']>>; deviceFingerprint: Awaited<ReturnType<DeviceFingerprintService['analyze']>> },
    riskScore: PayoutChangeRiskScore,
    sharedBankAccountCount: number,
  ): Promise<{ riskMemo: RiskMemoOutput; ringSummary: RingSummaryOutput | null; nextAction: NextActionOutput }> {
    const merchant = await this.prisma.merchant.findUniqueOrThrow({
      where: { id: input.merchantId },
    });

    const riskMemo = await this.aiService.generateRiskMemo({
      merchantId: input.merchantId,
      businessName: merchant.businessName,
      email: merchant.email,
      ipRisk: { ...enrichment.ipRisk, context: 'payout_change_request' } as unknown as Record<string, unknown>,
      deviceFingerprint: enrichment.deviceFingerprint as unknown as Record<string, unknown>,
      emailPattern: {} as Record<string, unknown>,
      kycResult: {} as Record<string, unknown>,
      graphNeighborhood: {
        sharedBankAccountCount,
        signals: riskScore.signals,
      } as unknown as Record<string, unknown>,
    });

    let ringSummary: RingSummaryOutput | null = null;
    if (sharedBankAccountCount > 0) {
      ringSummary = await this.aiService.generateRingSummary({
        merchantId: input.merchantId,
        ringNodes: [
          { id: input.merchantId, type: 'Merchant', properties: { businessName: merchant.businessName } },
        ],
        ringEdges: [],
        sharedAttributes: [`bankAccountHash:${input.newBankAccountHash}`],
      });
    }

    const nextAction = await this.aiService.generateNextAction(
      input.merchantId,
      riskMemo,
      ringSummary,
    );

    return { riskMemo, ringSummary, nextAction };
  }

  async saveInvestigation(
    input: PayoutChangeInput,
    workflowRunId: string,
    riskScore: PayoutChangeRiskScore,
    riskMemo: RiskMemoOutput,
    ringSummary: RingSummaryOutput | null,
    nextAction: NextActionOutput,
  ): Promise<string> {
    const investigation = await this.prisma.investigation.create({
      data: {
        merchantId: input.merchantId,
        workflowRunId,
        riskLevel: riskScore.level,
        riskScore: riskScore.score,
        riskMemo: JSON.stringify(riskMemo),
        ringSummary: ringSummary ? JSON.stringify(ringSummary) : null,
        recommendedAction: JSON.stringify(nextAction),
        enrichmentData: { context: 'payout_change' },
      },
    });
    return investigation.id;
  }

  async sendNotifications(
    input: PayoutChangeInput,
    investigationId: string,
    riskScore: PayoutChangeRiskScore,
    recommendation: string,
    ctx: ActivityContext,
  ): Promise<void> {
    const merchant = await this.prisma.merchant.findUniqueOrThrow({
      where: { id: input.merchantId },
    });

    await Promise.allSettled([
      this.slackService.sendFraudAlert({
        merchantId: input.merchantId,
        businessName: merchant.businessName,
        riskLevel: riskScore.level,
        riskScore: riskScore.score,
        recommendation,
        investigationId,
      }),
      input.webhookUrl
        ? this.webhookService.dispatch(input.webhookUrl, {
            eventType: 'payout_change.investigation_created',
            merchantId: input.merchantId,
            investigationId,
            riskLevel: riskScore.level,
            riskScore: riskScore.score,
            recommendation,
            occurredAt: new Date().toISOString(),
          })
        : Promise.resolve(),
    ]);
  }

  async markWorkflowRunCompleted(
    workflowRunId: string,
    output: Record<string, unknown>,
  ): Promise<void> {
    await this.prisma.workflowRun.update({
      where: { id: workflowRunId },
      data: { status: WorkflowStatus.COMPLETED, outputPayload: output, completedAt: new Date() },
    });
  }

  async markWorkflowRunFailed(
    workflowRunId: string,
    errorMessage: string,
  ): Promise<void> {
    await this.prisma.workflowRun.update({
      where: { id: workflowRunId },
      data: { status: WorkflowStatus.FAILED, errorMessage, completedAt: new Date() },
    });
  }

  private scoreToLevel(score: number): RiskLevel {
    if (score >= 80) return RiskLevel.CRITICAL;
    if (score >= 60) return RiskLevel.HIGH;
    if (score >= 35) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }
}
