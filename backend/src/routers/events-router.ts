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

eventsRouter.get('/create', authMiddleware, async (req, res, next) => {
    try {
        res.status(404)
    } catch(error) {
        next(error);
    }
})

eventsRouter.get('/join', authMiddleware, async (req, res, next) => {
    try {
        res.status(404)
    } catch(error) {
        next(error);
    }
})  

eventsRouter.get('/:id', authMiddleware, async (req, res, next) => {
    try {
        res.status(404)
    } catch(error) {
        next(error);
    }
})
