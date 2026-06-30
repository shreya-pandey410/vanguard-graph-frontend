import { Request, Response } from "express";

import { createTransactionSchema } from "./transactions.schemas";

import { createTransactionService } from "./transactions.service";

export async function createTransactionController(

    req: Request,

    res: Response

) {

    try {

        const transaction =
            createTransactionSchema.parse(req.body);

        const result =
            await createTransactionService(transaction);

        return res.status(201).json({

            success: true,

            data: result

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            error

        });

    }

}