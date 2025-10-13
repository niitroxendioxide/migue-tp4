import { db } from '../db/db'
import { CreateEventRequest, Event } from '../../../shared/types'
import { BadRequestError, ServerError } from '../middleware/errors'

export async function getAllEvents() {
  const events = await db.event.findMany({
    select: {
        id: true,
        title: true,
        description: true,
        date: true,
        location: true,
        image_url: true,
    }
  })

  return events
}

export async function getEventById(p_EventId: number): Promise<Event> {
  const event = await db.event.findUnique({
    where: {
      id: p_EventId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      date: true,
      location: true,
      image_url: true,
      price: true,
    }
  })

  if (!event) {
    throw new BadRequestError('Event not found');
  }

  const event_data = {
    id: event.id,
    title: event.title,
    description: event.description,
    description_extended: event.description,
    date: event.date,
    location: event.location,
    image_url: event.image_url,
    is_paid: event.price > 0,
    price: event.price,
    is_cancelled: false, // Placeholder, implement cancellation logic if needed
  } as Event;

  return event_data;
}

export async function createEvent(p_EventRequest: CreateEventRequest) {
  const event = await db.event.create({
    data: {
      title: p_EventRequest.title,
      description: p_EventRequest.description,
      date: p_EventRequest.date,
      location: p_EventRequest.location,
      image_url: p_EventRequest.image_url,
      price: p_EventRequest.price,
    }
  })

  return event
}