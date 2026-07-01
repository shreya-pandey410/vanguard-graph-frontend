import { Module } from '@nestjs/common';
import { DeviceFingerprintService } from './device-fingerprint.service';
import { IpRiskService } from './ip-risk.service';
import { EmailPatternService } from './email-pattern.service';
import { MockKycService } from './mock-kyc.service';

@Module({
  providers: [
    DeviceFingerprintService,
    IpRiskService,
    EmailPatternService,
    MockKycService,
  ],
  exports: [
    DeviceFingerprintService,
    IpRiskService,
    EmailPatternService,
    MockKycService,
  ],
})
export class EnrichmentModule {}
