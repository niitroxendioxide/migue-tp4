import { db } from '../db/db'

export const getAllEvents = async () => {
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