import driver from '../../config/neo4j';

export class GraphRepository {
  
  async getTransactionSubgraph(transactionId: string, depth = 2) {
    const session = driver.session();
    try {
     
      const safeDepth = Number.isInteger(depth) && depth > 0 && depth <= 5 ? depth : 2;

      const result = await session.run(
        `MATCH path = (t:Transaction { transactionId: $transactionId })-[*1..${safeDepth}]-(connected)
         RETURN path`,
        { transactionId },
      );
      return result;
    } finally {
      await session.close();
    }
  }

  
  async findFraudRingsBySharedDevice(minAccounts = 2) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (a:Account)-[:USED_DEVICE]->(d:Device)<-[:USED_DEVICE]-(other:Account)
         WHERE a <> other
         WITH d, collect(DISTINCT a.id) + collect(DISTINCT other.id) AS accountIds
         WITH d, [x IN accountIds | x] AS accs
         WITH d, accs, size(accs) AS cnt
         WHERE cnt >= $minAccounts
         RETURN d.id AS sharedEntityId, accs AS connectedAccounts, cnt AS accountCount
         ORDER BY accountCount DESC`,
        { minAccounts },
      );
      return result;
    } finally {
      await session.close();
    }
  }

  // Do accounts ke beech shortest connection path — kaise related hain?
  async findConnectionPath(accountIdA: string, accountIdB: string) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (a:Account { id: $accountIdA }), (b:Account { id: $accountIdB }),
               path = shortestPath((a)-[*1..6]-(b))
         RETURN path`,
        { accountIdA, accountIdB },
      );
      return result;
    } finally {
      await session.close();
    }
  }
}