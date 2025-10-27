import {
  getAllEvents,
  getJoinedEvents,
  getCreatedEvents,
  getEventById,
  createEvent,
  joinEvent,
  cancelEvent,
  unJoinEvent,
} from '../services/event-service';
import { db } from '../db/db';
import { BadRequestError, ServerError } from '../middleware/errors';
import type { Event, CreateEventRequest } from '../../../shared/types';


// Mock correcto para Prisma Client
jest.mock('../db/db', () => ({
  db: {
    event: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    eventUser: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));


describe('Event Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllEvents', () => {
    const mockEvents = [
      {
        id: 1,
        id_user: 1,
        title: 'Test Event 1',
        description: 'Description 1',
        date: new Date('2025-12-01'),
        price: 100,
        location: 'Location 1',
        image_url: 'http://example.com/image1.jpg',
        is_cancelled: false,
      },
      {
        id: 2,
        id_user: 2,
        title: 'Test Event 2',
        description: 'Description 2',
        date: new Date('2025-12-15'),
        price: 200,
        location: 'Location 2',
        image_url: 'http://example.com/image2.jpg',
        is_cancelled: false,
      },
    ];

    it('debería obtener todos los eventos con attendees', async () => {
      (db.event.findMany as jest.Mock).mockResolvedValue(mockEvents);
      (db.eventUser.count as jest.Mock).mockResolvedValue(5);

      const result = await getAllEvents();

      expect(db.event.findMany).toHaveBeenCalledWith({
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
        },
        orderBy: {
          date: 'desc',
        },
      });

      expect(db.eventUser.count).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('attendees', 5);
    });

    it('debería retornar array vacío si no hay eventos', async () => {
      (db.event.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getAllEvents();

      expect(result).toEqual([]);
      expect(db.eventUser.count).not.toHaveBeenCalled();
    });
  });

  describe('getJoinedEvents', () => {
    const mockUserId = 1;
    const mockJoinedEvents = [
      {
        event: {
          id: 1,
          title: 'Event 1',
          description: 'Description 1',
          date: new Date('2025-12-01'),
        },
      },
      {
        event: {
          id: 2,
          title: 'Event 2',
          description: 'Description 2',
          date: new Date('2025-12-15'),
        },
      },
    ];

    it('debería obtener los eventos a los que se unió el usuario', async () => {
      (db.eventUser.findMany as jest.Mock).mockResolvedValue(mockJoinedEvents);

      const result = await getJoinedEvents(mockUserId);

      expect(db.eventUser.findMany).toHaveBeenCalledWith({
        where: { id_user: mockUserId },
        select: { event: true },
      });

      expect(result).toEqual(mockJoinedEvents);
    });

    it('debería lanzar BadRequestError si no se proporciona userId', async () => {
      await expect(getJoinedEvents(0)).rejects.toThrow(
        new BadRequestError('User id is required')
      );

      expect(db.eventUser.findMany).not.toHaveBeenCalled();
    });
  });

  describe('getCreatedEvents', () => {
    const mockUserId = 1;
    const mockCreatedEvents = [
      {
        id: 1,
        title: 'My Event',
        description: 'Description',
        date: new Date('2025-12-01'),
        is_cancelled: false,
        location: 'Location',
        image_url: 'http://example.com/image.jpg',
        price: 100,
      },
    ];

    it('debería obtener los eventos creados por el usuario', async () => {
      (db.event.findMany as jest.Mock).mockResolvedValue(mockCreatedEvents);
      (db.eventUser.count as jest.Mock).mockResolvedValue(3);

      const result = await getCreatedEvents(mockUserId);

      expect(db.event.findMany).toHaveBeenCalledWith({
        where: { id_user: mockUserId },
        select: {
          id: true,
          title: true,
          description: true,
          date: true,
          is_cancelled: true,
          location: true,
          image_url: true,
          price: true,
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('attendees', 3);
    });

    it('debería lanzar BadRequestError si no se proporciona userId', async () => {
      await expect(getCreatedEvents(0)).rejects.toThrow(
        new BadRequestError('User id is required')
      );
    });
  });

  describe('getEventById', () => {
    const mockEvent = {
      id: 1,
      id_user: 1,
      title: 'Test Event',
      description: 'Description',
      date: new Date('2025-12-01'),
      is_cancelled: false,
      location: 'Location',
      image_url: 'http://example.com/image.jpg',
      price: 100,
    };

    it('debería obtener un evento por su ID', async () => {
      (db.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (db.eventUser.count as jest.Mock).mockResolvedValue(5);

      const result = await getEventById(1);

      expect(db.event.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
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
        },
      });

      expect(result).toMatchObject({
        id: mockEvent.id,
        title: mockEvent.title,
        attendees: 5,
        is_paid: true,
      });
    });

    it('debería lanzar BadRequestError si el evento no existe', async () => {
      (db.event.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getEventById(999)).rejects.toThrow(
        new BadRequestError('Event not found')
      );
    });
  });

  describe('createEvent', () => {
    const mockUserId = 1;
    const validEventRequest: CreateEventRequest & { userId: number } = {
      userId: mockUserId,
      title: 'New Event',
      description: 'Event description',
        // @ts-ignore
      date: new Date('2025-12-01'),
      location: 'Event location',
      image_url: 'http://example.com/image.jpg',
      price: 100,
    };

    const mockCreatedEvent = {
      id: 1,
      ...validEventRequest,
      is_cancelled: false,
    };

    it('debería crear un evento correctamente', async () => {
      (db.event.create as jest.Mock).mockResolvedValue(mockCreatedEvent);

      const result = await createEvent(validEventRequest);

      expect(db.event.create).toHaveBeenCalledWith({
        data: {
          id_user: mockUserId,
          title: validEventRequest.title,
          description: validEventRequest.description,
          date: validEventRequest.date,
          location: validEventRequest.location,
          image_url: validEventRequest.image_url,
          price: validEventRequest.price,
        },
      });

      expect(result).toEqual(mockCreatedEvent);
    });

    it('debería lanzar BadRequestError si falta el título', async () => {
      const invalidRequest = { ...validEventRequest, title: '' };

      await expect(createEvent(invalidRequest)).rejects.toThrow(
        new BadRequestError('Title is required')
      );

      expect(db.event.create).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestError si falta la descripción', async () => {
      const invalidRequest = { ...validEventRequest, description: '' };

      await expect(createEvent(invalidRequest)).rejects.toThrow(
        new BadRequestError('Description is required')
      );
    });

    it('debería lanzar BadRequestError si falta la fecha', async () => {
      const invalidRequest = { ...validEventRequest, date: null as any };

      await expect(createEvent(invalidRequest)).rejects.toThrow(
        new BadRequestError('Date is required')
      );
    });

    it('debería lanzar BadRequestError si falta la ubicación', async () => {
      const invalidRequest = { ...validEventRequest, location: '' };

      await expect(createEvent(invalidRequest)).rejects.toThrow(
        new BadRequestError('Location is required')
      );
    });

    it('debería lanzar BadRequestError si falta la imagen', async () => {
      const invalidRequest = { ...validEventRequest, image_url: '' };

      await expect(createEvent(invalidRequest)).rejects.toThrow(
        new BadRequestError('Image url is required')
      );
    });

    it('debería lanzar BadRequestError si falta el precio', async () => {
      const invalidRequest = { ...validEventRequest, price: undefined as any };

      await expect(createEvent(invalidRequest)).rejects.toThrow(
        new BadRequestError('Price is required')
      );
    });

    it('debería lanzar BadRequestError si la fecha es en el pasado', async () => {
      const pastDate = new Date('2020-01-01');
      const invalidRequest = { ...validEventRequest, date: pastDate };
        // @ts-ignore
      await expect(createEvent(invalidRequest)).rejects.toThrow(
        new BadRequestError('Event date must be in the future')
      );
    });

    it('debería lanzar BadRequestError si el precio es negativo', async () => {
      const invalidRequest = { ...validEventRequest, price: -100 };

      await expect(createEvent(invalidRequest)).rejects.toThrow(
        new BadRequestError('Price cannot be negative')
      );
    });

    it('debería aceptar precio 0 (evento gratuito)', async () => {
      const freeEventRequest = { ...validEventRequest, price: 0 };
      (db.event.create as jest.Mock).mockResolvedValue({
        ...mockCreatedEvent,
        price: 0,
      });

      const result = await createEvent(freeEventRequest);

      expect(result.price).toBe(0);
    });
  });

  describe('joinEvent', () => {
    const mockEventId = 1;
    const mockUserId = 1;
    const mockEvent = {
      id: mockEventId,
      title: 'Test Event',
      description: 'Description',
      date: new Date('2025-12-01'),
      location: 'Location',
      image_url: 'http://example.com/image.jpg',
      price: 100,
    };

    const mockUser = {
      id: mockUserId,
      name: 'testuser',
      email: 'test@example.com',
      balance: 500,
      isAdmin: false,
      dni: 12345678,
      full_name: 'Test User',
    };

    const mockEventUser = {
      id: 1,
      id_user: mockUserId,
      id_event: mockEventId,
    };

    it('debería unirse a un evento correctamente', async () => {
      (db.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (db.eventUser.findFirst as jest.Mock).mockResolvedValue(null);
      (db.eventUser.create as jest.Mock).mockResolvedValue(mockEventUser);
      (db.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        balance: 400,
      });

      const result = await joinEvent(mockEventId, mockUserId);

      expect(db.event.findUnique).toHaveBeenCalledWith({
        where: { id: mockEventId, is_cancelled: false },
        select: {
          id: true,
          title: true,
          description: true,
          date: true,
          location: true,
          image_url: true,
          price: true,
        },
      });

      expect(db.eventUser.create).toHaveBeenCalledWith({
        data: {
          id_user: mockUserId,
          id_event: mockEventId,
        },
      });

      expect(db.user.update).toHaveBeenCalledWith({
        data: { balance: 400 },
        where: { id: mockUserId },
      });

      expect(result).toEqual({
        success: true,
        eventUser: mockEventUser,
        message: 'Event joined successfully',
        newBalance: 400,
      });
    });

    it('debería lanzar BadRequestError si el evento no existe', async () => {
      (db.event.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(joinEvent(999, mockUserId)).rejects.toThrow(
        new BadRequestError('Event not found')
      );

      expect(db.user.findUnique).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestError si el evento ya expiró', async () => {
      const expiredEvent = { ...mockEvent, date: new Date('2020-01-01') };
      (db.event.findUnique as jest.Mock).mockResolvedValue(expiredEvent);

      await expect(joinEvent(mockEventId, mockUserId)).rejects.toThrow(
        new BadRequestError('Cannot join expired event')
      );
    });

    it('debería lanzar BadRequestError si el usuario no existe', async () => {
      (db.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(joinEvent(mockEventId, mockUserId)).rejects.toThrow(
        new BadRequestError('User not found')
      );
    });

    it('debería lanzar BadRequestError si el usuario ya se unió', async () => {
      (db.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (db.eventUser.findFirst as jest.Mock).mockResolvedValue(mockEventUser);

      await expect(joinEvent(mockEventId, mockUserId)).rejects.toThrow(
        new BadRequestError('User already joined event')
      );

      expect(db.eventUser.create).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestError si el saldo es insuficiente', async () => {
      const poorUser = { ...mockUser, balance: 50 };
      (db.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (db.user.findUnique as jest.Mock).mockResolvedValue(poorUser);
      (db.eventUser.findFirst as jest.Mock).mockResolvedValue(null);
      (db.eventUser.create as jest.Mock).mockResolvedValue(mockEventUser);

      await expect(joinEvent(mockEventId, mockUserId)).rejects.toThrow(
        new BadRequestError('Insufficient balance to join event')
      );
    });
  });

  describe('cancelEvent', () => {
    const mockEventId = 1;
    const mockUserId = 1;
    const mockEvent = {
      id: mockEventId,
      id_user: mockUserId,
      title: 'Test Event',
      is_cancelled: false,
    };

    it('debería cancelar un evento correctamente', async () => {
      (db.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (db.event.update as jest.Mock).mockResolvedValue({
        ...mockEvent,
        is_cancelled: true,
      });

      const result = await cancelEvent(mockEventId, mockUserId);

      expect(db.event.update).toHaveBeenCalledWith({
        where: { id: mockEventId },
        data: { is_cancelled: true },
      });

      expect(result).toEqual({
        success: true,
        message: 'Event cancelled successfully',
      });
    });

    it('debería lanzar BadRequestError si falta el eventId', async () => {
      await expect(cancelEvent(0, mockUserId)).rejects.toThrow(
        new BadRequestError('Event id is required')
      );

      expect(db.event.findUnique).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestError si el usuario no es el creador', async () => {
      const otherUserEvent = { ...mockEvent, id_user: 999 };
      (db.event.findUnique as jest.Mock).mockResolvedValue(otherUserEvent);

      await expect(cancelEvent(mockEventId, mockUserId)).rejects.toThrow(
        new BadRequestError('Only the event creator can cancel the event')
      );

      expect(db.event.update).not.toHaveBeenCalled();
    });
  });

  describe('unJoinEvent', () => {
    const mockEventId = 1;
    const mockUserId = 1;
    const mockEvent = {
      id: mockEventId,
      title: 'Test Event',
      price: 100,
    };

    const mockEventUser = {
      id: 1,
      id_user: mockUserId,
      id_event: mockEventId,
    };

    it('debería salir de un evento correctamente', async () => {
      (db.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (db.eventUser.findFirst as jest.Mock).mockResolvedValue(mockEventUser);
      (db.eventUser.delete as jest.Mock).mockResolvedValue(mockEventUser);
      (db.user.update as jest.Mock).mockResolvedValue({
        id: mockUserId,
        balance: 600,
      });

      const result = await unJoinEvent(mockEventId, mockUserId);

      expect(db.eventUser.delete).toHaveBeenCalledWith({
        where: { id: mockEventUser.id },
      });

      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: {
          balance: { increment: mockEvent.price },
        },
      });

      expect(result).toEqual({
        success: true,
        message: 'Event unjoined successfully',
        newBalance: 600,
      });
    });

    it('debería lanzar BadRequestError si falta el eventId', async () => {
      await expect(unJoinEvent(0, mockUserId)).rejects.toThrow(
        new BadRequestError('Event id is required')
      );
    });

    it('debería lanzar BadRequestError si el evento no existe', async () => {
      (db.event.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(unJoinEvent(mockEventId, mockUserId)).rejects.toThrow(
        new BadRequestError('Event not found')
      );
    });

    it('debería lanzar BadRequestError si el usuario no está registrado', async () => {
      (db.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (db.eventUser.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(unJoinEvent(mockEventId, mockUserId)).rejects.toThrow(
        new BadRequestError('User is not registered to this event')
      );

      expect(db.eventUser.delete).not.toHaveBeenCalled();
    });
  });
});