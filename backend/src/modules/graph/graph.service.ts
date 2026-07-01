import { GraphRepository } from './graph.repository';
import { mapNode, mapRelationship } from './graph.mapper';
import {
  GraphResult,
  GraphNode,
  GraphRelationship,
  FraudRing,
  NodeType,
} from './graph.types';

export class GraphService {
  constructor(private readonly repo: GraphRepository) {}

  async getTransactionSubgraph(transactionId: string, depth = 2): Promise<GraphResult> {
    const result = await this.repo.getTransactionSubgraph(transactionId, depth);
    return this.pathsToGraph(result);
  }

  async findFraudRings(minAccounts = 2): Promise<FraudRing[]> {
    const result = await this.repo.findFraudRingsBySharedDevice(minAccounts);
    return result.records.map((r) => ({
      sharedEntityId: r.get('sharedEntityId'),
      sharedEntityType: NodeType.DEVICE,
      connectedAccounts: r.get('connectedAccounts'),
      accountCount: Number(r.get('accountCount')),
    }));
  }

  async findConnectionPath(accountIdA: string, accountIdB: string): Promise<GraphResult> {
    const result = await this.repo.findConnectionPath(accountIdA, accountIdB);
    return this.pathsToGraph(result);
  }

  // Neo4j path records ko deduplicated nodes + relationships mein flatten kar
  private pathsToGraph(result: any): GraphResult {
    const nodeMap = new Map<string, GraphNode>();
    const relMap = new Map<string, GraphRelationship>();

    for (const record of result.records) {
      const path = record.get('path');
      if (!path) continue;

      for (const segment of path.segments) {
        const start = mapNode(segment.start);
        const end = mapNode(segment.end);
        const rel = mapRelationship(segment.relationship);

        nodeMap.set(start.id, start);
        nodeMap.set(end.id, end);
        relMap.set(rel.id, rel);
      }
    }

    return {
      nodes: [...nodeMap.values()],
      relationships: [...relMap.values()],
    };
  }
}