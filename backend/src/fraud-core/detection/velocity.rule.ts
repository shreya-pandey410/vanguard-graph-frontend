import driver from "../../config/neo4j";

export async function velocityRule(accountId: string) {
  const session = driver.session();

  // ── tunable thresholds ──
  const WINDOW_MINUTES = 10;
  const MAX_COUNT = 5;            // more than this many txns = suspicious
  const CRITICAL_COUNT = 12;     // almost certainly automated
  const MAX_AMOUNT = 50000;      // more than this total = suspicious
  const CRITICAL_AMOUNT = 200000;

  try {
    const result = await session.run(
      `
      MATCH (a:Account {id: $accountId})-[:MADE]->(t:Transaction)
      WITH a, t
      ORDER BY t.timestamp DESC
      WITH a, collect(t) AS txns, max(t.timestamp) AS anchor
      UNWIND txns AS t
      WITH t, anchor
      WHERE t.timestamp >= anchor - duration({minutes: $window})
      RETURN count(t) AS txnCount, coalesce(sum(t.amount), 0) AS totalAmount
      `,
      { accountId, window: WINDOW_MINUTES }
    );

    // no rows / no transactions → not triggered
    if (result.records.length === 0) {
      return {
        triggered: false,
        score: 0,
        riskLevel: "LOW",
        reasons: ["No recent transactions found"],
        txnCount: 0,
        totalAmount: 0,
      };
    }

    const txnCount = result.records[0].get("txnCount").toNumber();
    const totalAmount = Number(result.records[0].get("totalAmount"));

    const countBreached = txnCount > MAX_COUNT;
    const amountBreached = totalAmount > MAX_AMOUNT;

    // neither dimension breached → safe
    if (!countBreached && !amountBreached) {
      return {
        triggered: false,
        score: 0,
        riskLevel: "LOW",
        reasons: [`Normal velocity: ${txnCount} txns, ${totalAmount} in ${WINDOW_MINUTES}m`],
        txnCount,
        totalAmount,
      };
    }

   
    const isCritical = txnCount >= CRITICAL_COUNT || totalAmount >= CRITICAL_AMOUNT;
    const score = isCritical ? 35 : 25;
    const riskLevel = isCritical ? "HIGH" : "MEDIUM";

    const reasons: string[] = [];
    if (countBreached) {
      reasons.push(`${txnCount} transactions in ${WINDOW_MINUTES}m (limit ${MAX_COUNT})`);
    }
    if (amountBreached) {
      reasons.push(`${totalAmount} moved in ${WINDOW_MINUTES}m (limit ${MAX_AMOUNT})`);
    }

    return {
      triggered: true,
      score,
      riskLevel,
      reasons,
      txnCount,
      totalAmount,
    };
  } finally {
    await session.close();
  }
}