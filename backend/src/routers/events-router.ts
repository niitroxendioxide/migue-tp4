import { Router } from 'express'
import { CreateEventRequest, JoinEventRequest } from '../../../shared/types'
import { getAllEvents, createEvent, joinEvent, getEventById } from '../services/event-service'
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

eventsRouter.post('/create', authMiddleware, async (req, res, next) => {
    try {
        const body = req.body as CreateEventRequest;
        const event = await createEvent(body);

        res.status(200).json(event);
    } catch(error) {
        next(error);
    }
})

eventsRouter.post('/join', authMiddleware, async (req, res, next) => {
    try {

        const body = req.body as JoinEventRequest;
        const response = await joinEvent(body.eventId, req.user.id);

        res.status(200).json(response);

    } catch(error) {
        next(error);
    }
})  

eventsRouter.get('/:id', authMiddleware, async (req, res, next) => {
    try {
        const eventId = parseInt(req.params.id, 10);
        const event = await getEventById(eventId);

        res.status(200).json(event);
    } catch(error) {
        next(error);
    }
})
