import request from 'supertest';
import express from 'express';
import { eventsRouter } from '../routers/events-router';
import * as eventService from '../services/event-service';
import { authMiddleware } from '../middleware/auth';
import { BadRequestError } from '../middleware/errors';

jest.mock('../middleware/auth');
jest.mock('../services/event-service');

const app = express();
app.use(express.json());
app.use('/events', eventsRouter);

describe('Pruebas unitarias del router de eventos', () => {
  const mockUser = { id: 1, name: 'Juan' };

  beforeEach(() => {
    jest.clearAllMocks();
    (authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
      req.user = mockUser;
      next();
    });
  });

  describe('GET /events', () => {
    it('debería devolver todos los eventos (200)', async () => {
      const mockEvents = [{ id: 1, title: 'Evento 1' }];
      (eventService.getAllEvents as jest.Mock).mockResolvedValue(mockEvents);

      const res = await request(app).get('/events');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockEvents);
      expect(eventService.getAllEvents).toHaveBeenCalled();
    });

    it('debería manejar errores internos (500)', async () => {
      (eventService.getAllEvents as jest.Mock).mockRejectedValue(new Error('Error interno'));

      const res = await request(app).get('/events');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /events/create', () => {
    it('debería crear un evento correctamente (200)', async () => {
      const newEvent = { title: 'Nuevo evento' };
      const mockResponse = { id: 10, title: 'Nuevo evento' };
      (eventService.createEvent as jest.Mock).mockResolvedValue(mockResponse);

      const res = await request(app)
        .post('/events/create')
        .send(newEvent);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResponse);
      expect(eventService.createEvent).toHaveBeenCalledWith({ userId: 1, ...newEvent });
    });

    it('debería manejar errores si createEvent lanza excepción', async () => {
      (eventService.createEvent as jest.Mock).mockRejectedValue(new Error('Falla al crear'));
      const res = await request(app)
        .post('/events/create')
        .send({ title: 'Evento' });

      expect(res.status).toBe(500);
    });
  });

  describe('GET /events/created', () => {
    it('debería devolver los eventos creados por el usuario (200)', async () => {
      const mockCreated = [{ id: 1, title: 'Evento mío' }];
      (eventService.getCreatedEvents as jest.Mock).mockResolvedValue(mockCreated);

      const res = await request(app).get('/events/created');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockCreated);
      expect(eventService.getCreatedEvents).toHaveBeenCalledWith(1);
    });
  });

  describe('POST /events/join', () => {
    it('debería lanzar BadRequestError si falta el eventId', async () => {
      const res = await request(app).post('/events/join').send({});
      expect(res.status).toBe(400);
    });

    it('debería permitir unirse a un evento correctamente', async () => {
      const mockResponse = { success: true };
      (eventService.joinEvent as jest.Mock).mockResolvedValue(mockResponse);

      const res = await request(app)
        .post('/events/join')
        .send({ eventId: 99 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResponse);
      expect(eventService.joinEvent).toHaveBeenCalledWith(99, 1);
    });
  });

  describe('GET /events/joined', () => {
    it('debería devolver los eventos a los que el usuario se unió', async () => {
      const mockJoined = [{ id: 3, title: 'Evento unido' }];
      (eventService.getJoinedEvents as jest.Mock).mockResolvedValue(mockJoined);

      const res = await request(app).get('/events/joined');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockJoined);
      expect(eventService.getJoinedEvents).toHaveBeenCalledWith(1);
    });
  });

  describe('POST /events/unjoin', () => {
    it('debería desinscribir al usuario correctamente', async () => {
      const mockResponse = { success: true };
      (eventService.unJoinEvent as jest.Mock).mockResolvedValue(mockResponse);

      const res = await request(app)
        .post('/events/unjoin')
        .send({ eventId: 1 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResponse);
      expect(eventService.unJoinEvent).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('POST /events/cancel', () => {
    it('debería lanzar error si falta el eventId', async () => {
      const res = await request(app).post('/events/cancel').send({});
      expect(res.status).toBe(400);
    });

    it('debería cancelar un evento correctamente', async () => {
      const mockResponse = { success: true };
      (eventService.cancelEvent as jest.Mock).mockResolvedValue(mockResponse);

      const res = await request(app)
        .post('/events/cancel')
        .send({ eventId: 2 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResponse);
      expect(eventService.cancelEvent).toHaveBeenCalledWith(2, 1);
    });
  });

  describe('GET /events/:id', () => {
    it('debería devolver un evento existente', async () => {
      const mockEvent = { id: 5, title: 'Evento especial' };
      (eventService.getEventById as jest.Mock).mockResolvedValue(mockEvent);

      const res = await request(app).get('/events/5');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockEvent);
      expect(eventService.getEventById).toHaveBeenCalledWith(5);
    });

    it('debería manejar errores cuando el servicio falla', async () => {
      (eventService.getEventById as jest.Mock).mockRejectedValue(new Error('No encontrado'));
      const res = await request(app).get('/events/5');
      expect(res.status).toBe(500);
    });
  });
});
