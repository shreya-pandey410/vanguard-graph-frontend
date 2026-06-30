import driver from "../../config/neo4j";

export async function riskyIpRule(ip: string) {

    const session = driver.session();

    try {

        const result = await session.run(
            `
            MATCH (ip:IPAddress {ip:$ip})

            RETURN ip
            `,
            { ip }
        );

        if (result.records.length === 0) {

            return {

                triggered: false,

                score: 0,

                riskLevel: "LOW",

                reasons: [

                    "IP not found"

                ]

            };

        }

        const node = result.records[0].get("ip");

        const properties = node.properties;

        let score = 0;

        const reasons: string[] = [];

        if (properties.blacklisted) {

            score += 60;

            reasons.push("Blacklisted IP");

        }

        if (properties.tor) {

            score += 40;

            reasons.push("TOR Exit Node");

        }

        if (properties.proxy) {

            score += 20;

            reasons.push("Proxy Detected");

        }

        if (properties.vpn) {

            score += 10;

            reasons.push("VPN Detected");

        }

        if (properties.reputationScore >= 80) {

            score += 30;

            reasons.push("High Risk Reputation");

        }

        if (properties.failedLogins >= 20) {

            score += 20;

            reasons.push("Too Many Failed Logins");

        }

        if (properties.merchantCount >= 5) {

            score += 30;

            reasons.push("Shared By Multiple Merchants");

        }

        score = Math.min(score,100);

        return {

            triggered: score >= 40,

            score,

            riskLevel:

                score >= 80
                    ? "CRITICAL"

                : score >= 60
                    ? "HIGH"

                : score >= 30
                    ? "MEDIUM"

                : "LOW",

            reasons

        };

    }

    finally {

        await session.close();

    }

}