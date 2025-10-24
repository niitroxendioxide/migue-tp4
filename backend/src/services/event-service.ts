import { db } from '../db/db'
import { UnJoinEventResponse, CreateEventRequest, Event, JoinEventRequest, JoinEventResponse, CancelEventResponse } from '../../../shared/types'
import { BadRequestError, ServerError } from '../middleware/errors'

async function fillEventsAttendees(p_Events: Event[]) {
  for (const event of p_Events as Event[]) {
    const attendees = await db.eventUser.count({
      where: {
        id_event: event.id,
      },
    })

    event.attendees = attendees
  }

  return p_Events;
}

export async function getAllEvents() {
  const queryevents = await db.event.findMany({
    select: {
        id_user: true,
        id: true,
        is_cancelled: true,
        title: true,
        description: true,
        date: true,
        price: true,
        location: true,
        image_url: true,
    }
  })

  const events = await fillEventsAttendees(queryevents as Event[])

  return events
}


export async function getJoinedEvents(p_UserId: number) {
  if (!p_UserId) {
    throw new BadRequestError('User id is required');
  }

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

  return userJoinedEvents;
}

export async function getCreatedEvents(p_UserId: number) {
  if (!p_UserId) {
    throw new BadRequestError('User id is required');
  }

  const queryevents = await db.event.findMany({
    where: {
      id_user: p_UserId,
    },

    select: {
      id: true,
      title: true,
      description: true,
      date: true,
      is_cancelled: true,
      location: true,
      image_url: true,
      price: true,
    }
  })

  const userCreatedEvents = await fillEventsAttendees(queryevents as Event[])
  
  return userCreatedEvents;
}

export async function getEventById(p_EventId: number): Promise<Event> {
  const event = await db.event.findUnique({
    where: {
      id: p_EventId,
    },
    select: {
      id_user: true,
      id: true,
      title: true,
      description: true,
      date: true,
      is_cancelled: true,
      location: true,
      image_url: true,
      price: true,
    }
  })

  if (!event) {
    throw new BadRequestError('Event not found');
  }

  const attendees = await db.eventUser.count({
    where: {
      id_event: event.id,
    },
  })

  const event_data = {
    id: event.id,
    id_user: event.id_user,
    title: event.title,
    description: event.description,
    description_extended: event.description,
    date: event.date,
    location: event.location,
    image_url: event.image_url,
    is_paid: event.price > 0,
    price: event.price,
    attendees: attendees,
    is_cancelled: event.is_cancelled,
  } as Event;

  return event_data;
}

export async function createEvent(p_EventRequest: CreateEventRequest & { userId: number }) {
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

  if (new Date(p_EventRequest.date) < new Date()) {
    throw new BadRequestError('Event date must be in the future');
  }

  if (p_EventRequest.price < 0) {
    throw new BadRequestError('Price cannot be negative');
  }

  const event = await db.event.create({
    data: {
      id_user: p_EventRequest.userId,
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
      is_cancelled: false,
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
  if (event.date < new Date()) {
    throw new BadRequestError('Cannot join expired event');
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

  if (event.price > user.balance) {
    throw new BadRequestError('Insufficient balance to join event');
  }
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
    newBalance: updateBalanceResult.balance,
  } as JoinEventResponse
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

  if (event?.id_user !== p_UserId) {
    throw new BadRequestError('Only the event creator can cancel the event');
  }

  const canceledEvent = await db.event.update({
    where: {
      id: p_EventId,
    },
    data: {
      is_cancelled: true,
    },
  })

  if (!canceledEvent) {
    throw new ServerError('Error cancelling event');
  }

  return {success: true, message: 'Event cancelled successfully' };

}

export async function unJoinEvent(p_EventId: number, p_UserId: number): Promise<UnJoinEventResponse> {
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
  const user = await db.user.update({
    where: {
      id: p_UserId,
    },
    data: {
      balance: {
        increment: event.price,
      }
    }
  })

  return {
    success: true,
    message: 'Event unjoined successfully',
    newBalance: user.balance,
  }
}