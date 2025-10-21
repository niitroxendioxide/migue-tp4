import express from 'express'
import { authMiddleware } from '../middleware/auth'
import { chargeBalance, getBalance } from '../services/payment-service'
import { ChargeBalanceRequest } from '../../../shared/types'

export const paymentRouter = express.Router()

paymentRouter.post('/charge', authMiddleware, async (req, res, next) => {
    try {
        const body = req.body as ChargeBalanceRequest;
        console.log("Charge balance req: ", body);
        const response = await chargeBalance(req.user.id, body.amount);
        
        res.status(200).json(response);
    } catch (err) {
        next(err)
    }
})

paymentRouter.get('/balance', authMiddleware, async (req, res,next) => {
    try {
        console.log("Get balance for user: ", req.user.id);
        const response = await getBalance(req.user.id);
        console.log("Balance is: ", response);
        res.status(200).json(response);
    } catch (err) {
        next(err);
    }
});