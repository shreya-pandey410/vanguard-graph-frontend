// Graph mein kaunse entity types hain
export enum NodeType {
  TRANSACTION = 'Transaction',
  ACCOUNT = 'Account',
  DEVICE = 'Device',
  IP = 'IpAddress',
  MERCHANT = 'Merchant',
  BANK_ACCOUNT = 'BankAccount',
}

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;            // display name (e.g. account email, device id)
  properties: Record<string, any>;
}

export interface GraphRelationship {
  id: string;
  type: string;             // e.g. 'USED_DEVICE', 'FROM_IP', 'PAID_TO'
  source: string;           // source node id
  target: string;           // target node id
}

// Ek subgraph — controller isko UI/visualization ko return karega
export interface GraphResult {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

// Fraud ring detection ka output
export interface FraudRing {
  sharedEntityId: string;
  sharedEntityType: NodeType;
  connectedAccounts: string[];
  accountCount: number;
}

export interface ConnectionPath {
  length: number;
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}