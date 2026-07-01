import { CreateTransactionInput } from "./transactions.types";
import { createTransaction } from "./transactions.repository";

export async function createTransactionService(transanction:CreateTransactionInput) {
    return await createTransaction(transanction);
    
}