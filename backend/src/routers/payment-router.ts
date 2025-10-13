import express from 'express'
import { authMiddleware } from '../middleware/auth'
import { chargeBalance } from '../services/payment-service'
import { ChargeBalanceRequest } from '../../../shared/types'

export const paymentRouter = express.Router()

paymentRouter.post('/charge', authMiddleware, async (req, res, next) => {
    try {
        const body = req.body as ChargeBalanceRequest;
        const response = await chargeBalance(req.user.id, body.amount);
        
        res.status(200).json(response);
    } catch (err) {
        next(err)
    }
})