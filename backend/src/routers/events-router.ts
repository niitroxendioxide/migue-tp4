import { Router } from 'express'
import { CancelEventRequest, CreateEventRequest, JoinEventRequest } from '../../../shared/types'
import { getAllEvents, createEvent, joinEvent, getEventById, getCreatedEvents, cancelEvent, getJoinedEvents } from '../services/event-service'
import { authMiddleware } from '../middleware/auth'
import { ServerError } from '../middleware/errors'

export const eventsRouter = Router()

eventsRouter.get('/', async (req, res, next) => {
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
        console.log("Create event req: ", body);
        const event = await createEvent({userId: req.user.id, ...body});

        res.status(200).json(event);
    } catch(error) {
        next(error);
    }
})

eventsRouter.get('/created', authMiddleware, async (req, res, next) => {
    try {
        const createdEvents = await getCreatedEvents(req.user.id)
        res.status(200).json(createdEvents)
    } catch(err) {
        next(err)
    }
})

eventsRouter.post('/join', authMiddleware, async (req, res, next) => {
    try {

        const body = req.body as JoinEventRequest;
        console.log("Join event req: ", body);
        if (!body.eventId) {
            throw new ServerError('Malformed JSON: Event id is required');
        }

        const response = await joinEvent(body.eventId, req.user.id);

        res.status(200).json(response);

    } catch(error) {
        next(error);
    }
})  

eventsRouter.get("/joined", authMiddleware, async (req, res, next) => {
    try {
        
        const joinedEvents = await getJoinedEvents(req.user.id)
        res.status(200).json(joinedEvents)
    } catch(err) {
        next(err)
    }
})

eventsRouter.post('/cancel', authMiddleware, async (req, res, next) => {
    try {
        const body = req.body as CancelEventRequest;
        const response = await cancelEvent(body.eventId, req.user.id);

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
