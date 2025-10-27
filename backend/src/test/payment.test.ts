import request from 'supertest';
import express from 'express';
import * as paymentService from '../services/payment-service';
import { ValidationError, ServerError, errorHandlerMiddleware } from '../middleware/errors';
import { paymentRouter } from '../routers/payment-router';

// Mock del service completo
jest.mock('../services/payment-service');

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
const app = express();
app.use(express.json());
app.use('/payment', paymentRouter);
app.use(errorHandlerMiddleware); // Agregar el middleware de manejo de errores
describe('Payment Router Tests', () => {
  const mockUserId = 123;
  let validToken: string;

  beforeEach(() => {
    validToken = 'valid_test_token_123';
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /payment/charge - Endpoint Tests', () => {
    const mockChargeResponse = {
      success: true,
      newBalance: 15000,
    };

    beforeEach(() => {
      (paymentService.chargeBalance as jest.Mock).mockResolvedValue(mockChargeResponse);
    });

    describe('Casos exitosos', () => {
      it('debería retornar 200 y el nuevo balance al cargar saldo', async () => {
        const chargeRequest = { amount: 5000 };

        const response = await request(app).post('/payment/charge')
          .set('Authorization', `Bearer ${validToken}`)
          .send(chargeRequest)
          .expect(200);

        expect(response.body).toEqual(mockChargeResponse);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('newBalance');
      });


    });


    describe('Manejo de errores del service', () => {
      it('debería retornar 401 si el monto excede el máximo permitido', async () => {
        const chargeRequest = { amount: 1000000 };
        const error = new ValidationError('El monto máximo por recarga es $1000000');
        
        (paymentService.chargeBalance as jest.Mock).mockRejectedValueOnce(error);

        const response = await request(app)
          .post('/payment/charge')
          .set('Authorization', `Bearer ${validToken}`)
          .send(chargeRequest)
          .expect(401);

        expect(response.body).toHaveProperty('message', 'El monto máximo por recarga es $1000000');
      });

      it('debería retornar 401 si el usuario es inválido', async () => {
        const chargeRequest = { amount: 5000 };
        const error = new ValidationError('Invalid user');
        
        (paymentService.chargeBalance as jest.Mock).mockRejectedValueOnce(error);

        const response = await request(app)
          .post('/payment/charge')
          .set('Authorization', `Bearer ${validToken}`)
          .send(chargeRequest)
          .expect(401);

        expect(response.body).toHaveProperty('message', 'Invalid user');
      });

      it('debería retornar 500 si hay error al actualizar el balance', async () => {
        const chargeRequest = { amount: 5000 };
        const error = new ServerError('Error while updating balance');
        
        (paymentService.chargeBalance as jest.Mock).mockRejectedValueOnce(error);

        const response = await request(app)
          .post('/payment/charge')
          .set('Authorization', `Bearer ${validToken}`)
          .send(chargeRequest)
          .expect(500);

        expect(response.body).toHaveProperty('message', 'Error while updating balance');
      });

 
    });
  });

  describe('GET /payment/balance - Endpoint Tests', () => {
    const mockBalance = 10000;

    beforeEach(() => {
      (paymentService.getBalance as jest.Mock).mockResolvedValue(mockBalance);
    });

    describe('Casos exitosos', () => {
      it('debería retornar 200 y el balance del usuario', async () => {
        const response = await request(app)
          .get('/payment/balance')
          .set('Authorization', `Bearer ${validToken}`)
          .expect(200);

        expect(response.body).toBe(mockBalance);
      });

      it('debería llamar a getBalance con el userId correcto', async () => {
        await request(app)
          .get('/payment/balance')
          .set('Authorization', `Bearer ${validToken}`)
          .expect(200);

        expect(paymentService.getBalance).toHaveBeenCalledTimes(1);
        expect(paymentService.getBalance).toHaveBeenCalledWith(mockUserId);
      });

      it('debería retornar 0 si el usuario tiene balance cero', async () => {
        (paymentService.getBalance as jest.Mock).mockResolvedValueOnce(0);

        const response = await request(app)
          .get('/payment/balance')
          .set('Authorization', `Bearer ${validToken}`)
          .expect(200);

        expect(response.body).toBe(0);
      });

    });

  });
});

// Cerrar conexiones después de todos los tests
afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
});