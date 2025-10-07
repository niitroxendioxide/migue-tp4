import { Router } from 'express'
import { getAllEvents } from '../services/event-service'
import { authMiddleware } from '../middleware/auth'

export const eventsRouter = Router()

eventsRouter.get('/', authMiddleware, async (req, res, next) => {
    try {
        const events = await getAllEvents()

        res.status(200).json(events)
    } catch(error) {
        next(error);
    }
})

