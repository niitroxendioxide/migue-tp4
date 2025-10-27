import { chargeBalance, getBalance } from '../services/payment-service';
import { db } from '../db/db';
import { ValidationError, ServerError } from '../middleware/errors';

// Mockear el módulo db
jest.mock('../db/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Payment Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('chargeBalance', () => {
    const mockUserId = 1;
    const mockUser = { balance: 5000 };

    it('debería recargar el balance correctamente', async () => {
      const amount = 1000;
      const expectedNewBalance = mockUser.balance + amount;

      (db.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (db.user.update as jest.Mock).mockResolvedValueOnce({
        id: mockUserId,
        balance: expectedNewBalance,
      });

      const result = await chargeBalance(mockUserId, amount);

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { balance: true },
      });

      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { balance: expectedNewBalance },
      });

      expect(result).toEqual({
        success: true,
        newBalance: expectedNewBalance,
      });
    });

    it('debería lanzar ValidationError si el monto es mayor o igual a 1000000', async () => {
      const amount = 1000000;

      await expect(chargeBalance(mockUserId, amount)).rejects.toThrow(
        new ValidationError('El monto máximo por recarga es $1000000')
      );

      // No debería llamar a la base de datos
      expect(db.user.findUnique).not.toHaveBeenCalled();
      expect(db.user.update).not.toHaveBeenCalled();
    });

    
 
    it('debería lanzar ValidationError si el monto es negativo', async () => {
      const amount = -100;

      await expect(chargeBalance(mockUserId, amount)).rejects.toThrow(
        new ValidationError("El monto de recarga debe ser mayor a $0")
      );

      // No debería llamar a la base de datos
      expect(db.user.findUnique).not.toHaveBeenCalled();
      expect(db.user.update).not.toHaveBeenCalled();
    });

    it('debería lanzar ValidationError si el usuario no existe', async () => {
      const amount = 500;

      (db.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(chargeBalance(mockUserId, amount)).rejects.toThrow(
        new ValidationError('Invalid user')
      );

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { balance: true },
      });

      // No debería intentar actualizar
      expect(db.user.update).not.toHaveBeenCalled();
    });

    it('debería lanzar ServerError si falla la actualización', async () => {
      const amount = 1000;

      (db.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (db.user.update as jest.Mock).mockResolvedValueOnce(null);

      await expect(chargeBalance(mockUserId, amount)).rejects.toThrow(
        new ServerError('Error while updating balance')
      );

      expect(db.user.update).toHaveBeenCalled();
    });


    it('debería manejar montos válidos justo debajo del máximo', async () => {
      const amount = 999999;
      const expectedNewBalance = mockUser.balance + amount;

      (db.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (db.user.update as jest.Mock).mockResolvedValueOnce({
        id: mockUserId,
        balance: expectedNewBalance,
      });

      const result = await chargeBalance(mockUserId, amount);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(expectedNewBalance);
    });
  });

  describe('getBalance', () => {
    const mockUserId = 1;

    it('debería retornar el balance del usuario correctamente', async () => {
      const mockBalance = 5000;
      const mockUser = { balance: mockBalance };

      (db.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await getBalance(mockUserId);

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { balance: true },
      });

      expect(result).toBe(mockBalance);
    });

    it('debería lanzar ValidationError si el usuario no existe', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(getBalance(mockUserId)).rejects.toThrow(
        new ValidationError('Invalid user')
      );

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { balance: true },
      });
    });

    it('debería manejar balances negativos', async () => {
      const mockBalance = -1000;
      const mockUser = { balance: mockBalance };

      (db.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await getBalance(mockUserId);

      expect(result).toBe(mockBalance);
    });
  });
});