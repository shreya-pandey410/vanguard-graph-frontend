import { Node } from "neo4j-driver";
import { Transaction } from "./transactions.types";

export function mapTransaction(
  node: Node
): Transaction { 
  return {
  id: node.properties.id,
  accountId: node.properties.accountId,
  transactionId: node.properties.transactionId,
  merchantId: node.properties.merchantId,
  bankAccountId: node.properties.bankAccountId,
  deviceId: node.properties.deviceId,
  ipAddress: node.properties.ipAddress,
  amount: Number(node.properties.amount),
  currency: node.properties.currency,
  timestamp: node.properties.timestamp,
  createdAt: node.properties.createdAt,
  transaction: node.properties.transaction, 
};}
  