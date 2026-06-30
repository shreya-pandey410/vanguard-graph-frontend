import { sharedBankacountrule } from "../../fraud-core/detection/shared-bank-account.rule";
import { riskyIpRule } from "../../fraud-core/detection/risky-ip.rule";
import { sharedDevicerule } from "../../fraud-core/detection/shared-device.rule";

export async function calculateRisk(
    data: RiskEngineRequest
): Promise<RiskEngineResponse> {

    const triggeredRules: string[] = [];

    const recommendations: string[] = [];

    let totalScore = 0;

    const ipResult =
        await riskyIpRule(data.ip);

    if (ipResult.triggered) {

        totalScore += ipResult.score;

        triggeredRules.push("Risky IP");

        recommendations.push(
            "Review merchant IP address."
        );

    }

    const deviceResult =
        await sharedDevicerule(data.deviceId);

    if (deviceResult.triggered) {

        totalScore += deviceResult.score;

        triggeredRules.push("Shared Device");

        recommendations.push(
            "Verify device ownership."
        );

    }

    const velocityResult =
        await velocityRule(data.merchantId);

    if (velocityResult.triggered) {

        totalScore += velocityResult.score;

        triggeredRules.push("High Velocity");

        recommendations.push(
            "Temporarily slow transaction rate."
        );

    }

    const bankResult =
        await sharedBankAccountRule(
            data.accountNumber
        );

    if (bankResult.triggered) {

        totalScore += bankResult.score;

        triggeredRules.push(
            "Shared Bank Account"
        );

        recommendations.push(
            "Verify bank account."
        );

    }

    const graphResult =
        await graphProximityRule(
            data.merchantId
        );

    if (graphResult.triggered) {

        totalScore += graphResult.score;

        triggeredRules.push(
            "Graph Proximity"
        );

        recommendations.push(
            "Investigate connected merchants."
        );

    }

    totalScore = Math.min(totalScore,100);

    return {

        totalScore,

        riskLevel:

            totalScore >= 80

                ? "CRITICAL"

            : totalScore >= 60

                ? "HIGH"

            : totalScore >= 30

                ? "MEDIUM"

            : "LOW",

        triggeredRules,

        recommendations

    };

}