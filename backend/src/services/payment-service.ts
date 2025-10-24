import { db } from "../db/db";
import { ServerError, ValidationError } from "../middleware/errors";
import { ChargeBalanceResponse } from "../../../shared/types";

export async function chargeBalance(p_UserId: number, p_Amount: number): Promise<ChargeBalanceResponse> {
    if (p_Amount >= 1000000) {
        throw new ValidationError("El monto máximo por recarga es $1000000");
    }
    const user = await db.user.findUnique({
        where: {
            id: p_UserId,
        },
        select: {
            balance: true,
        }
    });

    if (!user) {
        throw new ValidationError("Invalid user");
    }

    const new_balance = user?.balance + p_Amount;
    const updatedUser = await db.user.update({
        where: {
            id: p_UserId,
        },

        data: {
            balance: new_balance,
        }
    });

    if (!updatedUser) {
        throw new ServerError("Error while updating balance")
    }

    return {
        success: true,
        newBalance: new_balance,
    } as ChargeBalanceResponse;
}

export async function getBalance(p_UserId: number): Promise<number> {
    const user = await db.user.findUnique({
        where: {
            id: p_UserId,
        },
        select: {
            balance: true,
        }
    });

    if (!user) {
        throw new ValidationError("Invalid user");
    }

    return user.balance;
}