import { db } from '../db/db'
import { CancelEventResponse, CreateEventRequest, Event, JoinEventRequest, JoinEventResponse } from '../../../shared/types'
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
  if (!p_EventRequest.title) {
    throw new BadRequestError('Title is required');
  }

  if (!p_EventRequest.description) {
    throw new BadRequestError('Description is required');
  }

  if (!p_EventRequest.date) {
    throw new BadRequestError('Date is required');
  }

  if (!p_EventRequest.location) {
    throw new BadRequestError('Location is required');
  }

  if (!p_EventRequest.image_url) {
    throw new BadRequestError('Image url is required');
  }

  if (p_EventRequest.price === undefined || p_EventRequest.price === null) {
    throw new BadRequestError('Price is required');
  }

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

  if (!event) {
    throw new ServerError('Error creating event');
  }

  return event
}

export async function joinEvent(p_EventId: number, p_UserId: number): Promise<JoinEventResponse> {
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

  const user = await db.user.findUnique({
    where: {
      id: p_UserId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      balance: true,
      isAdmin: true,
      dni: true,
      full_name: true,
    }
  })

  if (!user) {
    throw new BadRequestError('User not found');
  }

  const userAlreadyJoined = await db.eventUser.findFirst({
    where: {
      id_event: event.id,
      id_user: user.id,
    }
  })

  if (userAlreadyJoined) {
    throw new BadRequestError('User already joined event');
  }

  const eventUser = await db.eventUser.create({
    data: {
      id_user: user.id,
      id_event: event.id,
    }
  })

  const updateBalanceResult = await db.user.update({
    data: {
      balance: user.balance - event.price,
    },

    where: {
      id: user.id,
    }
  })

  if (!eventUser || !updateBalanceResult) {
    throw new ServerError('Error joining event');
  }

  return {
    success: true,
    eventUser: eventUser,
    message: 'Event joined successfully',
  } as JoinEventResponse
}

export async function viewJoinedEvents(p_UserId: number) {
  const userJoinedEvents = await db.eventUser.findMany({
    where: {
      id_user: p_UserId,
    },

    select: {
      event: true,
    }
  })

  if (!userJoinedEvents) {
    return {
      success: true,
      events: [],
    }
  }

  

  return {
    success: true,
    events: userJoinedEvents,
  }
}

export async function cancelEvent(p_EventId: number, p_UserId: number): Promise<CancelEventResponse> {
  if (!p_EventId) {
    throw new BadRequestError('Event id is required');
  }
  
  const event = await db.event.findUnique({
    where: {
      id: p_EventId,
    },
  })

  if (!event) {
    throw new BadRequestError('Event not found');
  }

  const eventUser = await db.eventUser.findFirst({
    where: {
      id_event: event.id,
      id_user : p_UserId,
    },

    select: {
      id: true,
      id_user: true,
    }
  })

  if (!eventUser) {
    throw new BadRequestError('User is not registered to this event');
  }

  const removeEventUserResult = await db.eventUser.delete({
    where: {
      id: eventUser.id
    }
  })

  if (!removeEventUserResult) {
    throw new ServerError('Error cancelling event');
  }

  return {
    success: true,
    message: 'Event cancelled successfully',
  }
}