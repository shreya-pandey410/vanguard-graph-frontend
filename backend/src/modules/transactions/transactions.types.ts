/**
 * transactions.types.ts
 *
 * Type contracts for the Transaction module.
 * Pure shapes — no logic.
 */

// What the client sends us (note: NO id — backend generates it)
export interface CreateTransactionInput {
  accountId: string;
  merchantId: string;
  amount: number;
  currency: string;
  ipAddress: string;
  deviceId: string;
  bankAccountId: string;
  timestamp?: string; // optional — if not sent, backend uses "now"
}

// A full Transaction as stored in the graph
export interface Transaction {
  id: string;
  accountId: string;
  merchantId: string;
  amount: number;
  currency: string;
  ipAddress: string;
  deviceId: string;
  bankAccountId: string;
  timestamp: string; // ISO 8601
  createdAt: string;
  transactionId:string;
  transaction: string;
}

// What we return after creating
export interface CreateTransactionResult {
  transactionId: string;
  accountId: string;
  amount: number;
  timestamp: string;
  relationshipsCreated: string[]; // which edges we wired up
}