import driver from "../../config/neo4j";
import { mapTransaction } from "./transactions.mapper";

import {
    CreateTransactionInput,
    Transaction
} from "./transactions.types";

import { randomUUID } from "crypto";

export async function createTransaction(
    transaction: CreateTransactionInput
): Promise<Transaction> {

    const session = driver.session();

    try {

        const transactionId = randomUUID();

        const result = await session.run(
            `
            MATCH (m:Merchant {merchantId:$merchantId})
            MATCH (b:BankAccount {bankAccountId:$bankAccountId})
            MATCH (d:Device {deviceId:$deviceId})
            MATCH (ip:IPAddress {ip:$ipAddress})

            CREATE (t:Transaction{
                transactionId:$transactionId,
                amount:$amount,
                currency:$currency,
                timestamp:datetime($timestamp),
                createdAt:datetime()
            })

            MERGE (m)-[:MADE_TRANSACTION]->(t)
            MERGE (b)-[:USED_BANK_ACCOUNT]->(t)
            MERGE (d)-[:USED_DEVICE]->(t)
            MERGE (ip)-[:USED_IP]->(t)

            RETURN t
            `,
            {
                transactionId,

                merchantId: transaction.merchantId,

                bankAccountId: transaction.bankAccountId,

                deviceId: transaction.deviceId,

                ipAddress: transaction.ipAddress,

                amount: transaction.amount,

                currency: transaction.currency,

                timestamp:
                    transaction.timestamp ??
                    new Date().toISOString()
            }
        );

       const node = result.records[0].get("t");
       
       return mapTransaction(node);

    } catch (error) {

        console.error(
            "Create Transaction Error:",
            error
        );

        throw error;

    } finally {

        await session.close();

    }

}