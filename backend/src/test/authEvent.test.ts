import request from 'supertest';
import { app } from '../index';
import * as eventService from '../services/event-service';
import { BadRequestError } from '../middleware/errors'; // Importar tu clase de error real

// Mock del service completo
jest.mock('../services/event-service');

// Mock del authMiddleware ANTES de importar la app
jest.mock('../middleware/auth', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    
    // Si no hay header o está vacío
    if (!authHeader || authHeader === '') {
      return res.status(401).json({ message: 'No token provided' });
    }

    const parts = authHeader.split(' ');
    
    // Si el formato no es "Bearer token"
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const token = parts[1];
    
    // Si el token es inválido
    if (token === 'token_invalido_123' || !token) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Token válido - agregar usuario al request
    req.user = { id: 123 };
    next();
  },
  generateToken: jest.fn(() => 'valid_mock_token_123')
}));

describe('GET /events/created - Endpoint Tests', () => {
  const mockUserId = 123;
  let validToken: string;

  // Datos mock que siempre devuelve el service
  const mockCreatedEvents = [
    {
      id: 1,
      title: 'Evento de Prueba 1',
      description: 'Descripción del evento 1',
      date: '2025-12-01T00:00:00.000Z', // Como string, porque JSON serializa así
      location: 'Buenos Aires',
      image_url: 'https://example.com/image1.jpg',
      price: 1500,
      attendees: 10,
    },
    {
      id: 2,
      title: 'Evento de Prueba 2',
      description: 'Descripción del evento 2',
      date: '2025-12-15T00:00:00.000Z', // Como string
      location: 'Córdoba',
      image_url: null,
      price: 2000,
      attendees: 5,
    },
  ];

  beforeEach(() => {
    // Generar un token válido simple para los tests
    validToken = 'valid_test_token_123';
    (eventService.getCreatedEvents as jest.Mock).mockResolvedValue(mockCreatedEvents);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Casos exitosos', () => {
    it('debería retornar 200 y los eventos creados por el usuario', async () => {
      const response = await request(app)
        .get('/events/created')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toEqual(mockCreatedEvents);
    });

    it('debería llamar a getCreatedEvents con el userId correcto', async () => {
      await request(app)
        .get('/events/created')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(eventService.getCreatedEvents).toHaveBeenCalledTimes(1);
      expect(eventService.getCreatedEvents).toHaveBeenCalledWith(mockUserId);
    });

    it('debería retornar array vacío si el usuario no tiene eventos', async () => {
      (eventService.getCreatedEvents as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/events/created')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('debería retornar los campos correctos en cada evento', async () => {
      const response = await request(app)
        .get('/events/created')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('description');
      expect(response.body[0]).toHaveProperty('date');
      expect(response.body[0]).toHaveProperty('location');
      expect(response.body[0]).toHaveProperty('image_url');
      expect(response.body[0]).toHaveProperty('price');
      expect(response.body[0]).toHaveProperty('attendees');
    });
  });

  describe('Tests de Autenticación', () => {
    it('debería retornar 401 si no se envía token de autenticación', async () => {
      const response = await request(app)
        .get('/events/created')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(eventService.getCreatedEvents).not.toHaveBeenCalled();
    });

    it('debería retornar 401 si el token es inválido', async () => {
      const response = await request(app)
        .get('/events/created')
        .set('Authorization', 'Bearer token_invalido_123')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(eventService.getCreatedEvents).not.toHaveBeenCalled();
    });

    it('debería retornar 401 si el token está mal formateado', async () => {
      const response = await request(app)
        .get('/events/created')
        .set('Authorization', 'InvalidFormat token123')
        .expect(401);

      expect(eventService.getCreatedEvents).not.toHaveBeenCalled();
    });

    it('debería retornar 401 si el header Authorization está vacío', async () => {
      const response = await request(app)
        .get('/events/created')
        .set('Authorization', '')
        .expect(401);

      expect(eventService.getCreatedEvents).not.toHaveBeenCalled();
    });
  });

  describe('Manejo de errores del service', () => {
    it('debería retornar 400 si el service lanza BadRequestError', async () => {
      // Usar tu clase de error REAL
      const error = new BadRequestError('User id is required');
      
      (eventService.getCreatedEvents as jest.Mock).mockRejectedValueOnce(error);

      const response = await request(app)
        .get('/events/created')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'User id is required');
    });

    it('debería retornar 500 si el service lanza un error genérico', async () => {
      const error = new Error('Database connection failed');
      
      (eventService.getCreatedEvents as jest.Mock).mockRejectedValueOnce(error);

      const response = await request(app)
        .get('/events/created')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(500);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Database connection failed');
    });
  });
});

// Cerrar conexiones después de todos los tests
afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
});
