import driver from '../../config/neo4j';
import { Workflow } from './workflows.types';

export class WorkflowsRepository {
  async save(workflow: Workflow): Promise<Workflow> {
    const session = driver.session();
    try {
      await session.run(
        `MERGE (w:Workflow { id: $id })
         SET w.transactionId = $transactionId,
             w.riskScore      = $riskScore,
             w.triggeredRules = $triggeredRules,
             w.status         = $status,
             w.steps          = $steps,
             w.createdAt       = $createdAt,
             w.updatedAt       = $updatedAt`,
        {
          ...workflow,
          // Neo4j nested objects store nahi kar sakta — steps ko JSON string bana ke rakh
          steps: JSON.stringify(workflow.steps),
        },
      );
      return workflow;
    } finally {
      await session.close();
    }
  }

  async findById(id: string): Promise<Workflow | null> {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (w:Workflow { id: $id }) RETURN w LIMIT 1`,
        { id },
      );
      if (result.records.length === 0) return null;
      return this.mapWorkflow(result.records[0].get('w'));
    } finally {
      await session.close();
    }
  }

  async findByTransactionId(transactionId: string): Promise<Workflow | null> {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (w:Workflow { transactionId: $transactionId })
         RETURN w ORDER BY w.createdAt DESC LIMIT 1`,
        { transactionId },
      );
      if (result.records.length === 0) return null;
      return this.mapWorkflow(result.records[0].get('w'));
    } finally {
      await session.close();
    }
  }

  private mapWorkflow(node: any): Workflow {
    return {
      id: node.properties.id,
      transactionId: node.properties.transactionId,
      riskScore: Number(node.properties.riskScore),
      triggeredRules: node.properties.triggeredRules,
      status: node.properties.status,
      steps: JSON.parse(node.properties.steps ?? '[]'),
      createdAt: node.properties.createdAt,
      updatedAt: node.properties.updatedAt,
    };
  }
}