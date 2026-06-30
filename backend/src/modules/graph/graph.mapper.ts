import { NodeType, GraphNode, GraphRelationship } from './graph.types';

// Neo4j node ko GraphNode mein map kar
export function mapNode(node: any): GraphNode {
  // Neo4j node ke labels ek array hote hain — pehla label le
  const type = (node.labels?.[0] ?? 'Unknown') as NodeType;

  return {
    id: node.properties.id,
    type,
    label: pickLabel(type, node.properties),
    properties: node.properties,
  };
}

// Neo4j relationship ko GraphRelationship mein map kar
export function mapRelationship(rel: any): GraphRelationship {
  return {
    id: rel.identity?.toString() ?? rel.elementId,
    type: rel.type,
    source: rel.startNodeElementId ?? rel.start?.toString(),
    target: rel.endNodeElementId ?? rel.end?.toString(),
  };
}

// Har node type ke liye sensible display label chun
function pickLabel(type: NodeType, props: Record<string, any>): string {
  switch (type) {
    case NodeType.ACCOUNT:
      return props.email ?? props.accountId ?? props.id;
    case NodeType.DEVICE:
      return props.deviceId ?? props.id;
    case NodeType.IP:
      return props.ipAddress ?? props.id;
    case NodeType.MERCHANT:
      return props.merchantId ?? props.name ?? props.id;
    case NodeType.TRANSACTION:
      return props.transactionId ?? props.id;
    default:
      return props.id;
  }
}