import { handleLoginRequest, handleRegisterRequest } from '../services/user-service';
import { db } from '../db/db';
import { BadRequestError, NotFoundError } from '../middleware/errors';
import { generateToken } from '../middleware/auth';
import type { User, LoginRequest, RegisterRequest } from '../../../shared/types';
// Mock correcto para Prisma Client
jest.mock('../db/db', () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    tokens: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('../middleware/auth', () => ({
  generateToken: jest.fn(),
}));

// Importaciones después de los mocks
describe('Auth Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleLoginRequest', () => {
    const mockLoginRequest: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUserFromDB = {
      id: 1,
      name: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      balance: 1000,
      isAdmin: false,
      dni: 12345678,
      full_name: 'Test User',
    };

    const mockTokenString = 'mock.jwt.token';
    const mockTokenFromDB = {
      token: mockTokenString,
    };

    beforeEach(() => {
      // Setup por defecto para cada test
      (generateToken as jest.Mock).mockReturnValue(mockTokenString);
    });

    it('debería hacer login correctamente con credenciales válidas', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUserFromDB);
      (db.tokens.create as jest.Mock).mockResolvedValue(mockTokenFromDB);

      const result = await handleLoginRequest(mockLoginRequest);

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockLoginRequest.email },
        select: {
          id: true,
          name: true,
          email: true,
          balance: true,
          isAdmin: true,
          password: true,
          dni: true,
          full_name: true,
        },
      });

      expect(db.tokens.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserFromDB.id,
          token: mockTokenString,
          expiresAt: expect.any(Date),
        },
        select: {
          token: true,
        },
      });

      expect(result).toEqual({
        success: true,
        user: {
          id: mockUserFromDB.id,
          name: mockUserFromDB.name,
          email: mockUserFromDB.email,
          balance: mockUserFromDB.balance,
          isAdmin: mockUserFromDB.isAdmin,
          dni: mockUserFromDB.dni,
          full_name: mockUserFromDB.full_name,
        },
        token: mockTokenString,
      });
    });

    it('debería lanzar NotFoundError si el usuario no existe', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(handleLoginRequest(mockLoginRequest)).rejects.toThrow(
        new NotFoundError('User not found')
      );

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockLoginRequest.email },
        select: {
          id: true,
          name: true,
          email: true,
          balance: true,
          isAdmin: true,
          password: true,
          dni: true,
          full_name: true,
        },
      });

      expect(db.tokens.create).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestError si la contraseña es incorrecta', async () => {
      const wrongPasswordRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUserFromDB);

      await expect(handleLoginRequest(wrongPasswordRequest)).rejects.toThrow(
        new BadRequestError('Invalid password')
      );

      expect(db.user.findUnique).toHaveBeenCalled();
      expect(db.tokens.create).not.toHaveBeenCalled();
    });

    it('debería generar un token después de login exitoso', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUserFromDB);
      (db.tokens.create as jest.Mock).mockResolvedValue(mockTokenFromDB);

      const result = await handleLoginRequest(mockLoginRequest);

      expect(generateToken).toHaveBeenCalled();
      expect(db.tokens.create).toHaveBeenCalled();
      expect(result.token).toBe(mockTokenString);
    });

    it('debería no incluir la contraseña en la respuesta del usuario', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUserFromDB);
      (db.tokens.create as jest.Mock).mockResolvedValue(mockTokenFromDB);

      const result = await handleLoginRequest(mockLoginRequest);

      expect(result.user).not.toHaveProperty('password');
    });

    it('debería crear un token con fecha de expiración', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(mockUserFromDB);
      (db.tokens.create as jest.Mock).mockResolvedValue(mockTokenFromDB);

      await handleLoginRequest(mockLoginRequest);

      expect(db.tokens.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            expiresAt: expect.any(Date),
          }),
        })
      );
    });
  });

  describe('handleRegisterRequest', () => {
    const mockRegisterRequest: RegisterRequest = {
      email: 'newuser@example.com',
      password: 'password123',
      username: 'newuser',
      full_name: 'New User',
      DNI: 12345678,
    };

    const mockNewUser = {
      id: 1,
      name: 'newuser',
      email: 'newuser@example.com',
      balance: 0,
      isAdmin: false,
      dni: 12345678,
      full_name: 'New User',
    };

    const mockTokenString = 'mock.jwt.token';
    const mockTokenFromDB = {
      token: mockTokenString,
    };

    beforeEach(() => {
      (generateToken as jest.Mock).mockReturnValue(mockTokenString);
    });

    it('debería registrar un nuevo usuario correctamente', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);
      (db.user.create as jest.Mock).mockResolvedValue(mockNewUser);
      (db.tokens.create as jest.Mock).mockResolvedValue(mockTokenFromDB);

      const result = await handleRegisterRequest(mockRegisterRequest);

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockRegisterRequest.email },
        select: {
          id: true,
          name: true,
          email: true,
          balance: true,
          isAdmin: true,
          password: true,
          dni: true,
          full_name: true,
        },
      });

      expect(db.user.create).toHaveBeenCalledWith({
        data: {
          name: mockRegisterRequest.username,
          email: mockRegisterRequest.email,
          password: mockRegisterRequest.password,
          isAdmin: false,
          full_name: mockRegisterRequest.full_name,
          dni: mockRegisterRequest.DNI,
        },
      });

      expect(result).toEqual({
        success: true,
        user: mockNewUser,
        token: mockTokenString,
      });
    });

    it('debería lanzar BadRequestError si falta el email', async () => {
      const invalidRequest = {
        ...mockRegisterRequest,
        email: '',
      };

      await expect(handleRegisterRequest(invalidRequest)).rejects.toThrow(
        new BadRequestError('Missing required fields')
      );

      expect(db.user.findUnique).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestError si falta la contraseña', async () => {
      const invalidRequest = {
        ...mockRegisterRequest,
        password: '',
      };

      await expect(handleRegisterRequest(invalidRequest)).rejects.toThrow(
        new BadRequestError('Missing required fields')
      );
    });

    it('debería lanzar BadRequestError si falta el username', async () => {
      const invalidRequest = {
        ...mockRegisterRequest,
        username: '',
      };

      await expect(handleRegisterRequest(invalidRequest)).rejects.toThrow(
        new BadRequestError('Missing required fields')
      );
    });

    it('debería lanzar BadRequestError si falta el full_name', async () => {
      const invalidRequest = {
        ...mockRegisterRequest,
        full_name: '',
      };

      await expect(handleRegisterRequest(invalidRequest)).rejects.toThrow(
        new BadRequestError('Missing required fields')
      );
    });

    it('debería lanzar BadRequestError si falta el DNI', async () => {
      const invalidRequest = {
        ...mockRegisterRequest,
        DNI: 0,
      };

      await expect(handleRegisterRequest(invalidRequest)).rejects.toThrow(
        new BadRequestError('Missing required fields')
      );
    });

    it('debería lanzar BadRequestError si el DNI es negativo', async () => {
      const invalidRequest = {
        ...mockRegisterRequest,
        DNI: -12345,
      };

      await expect(handleRegisterRequest(invalidRequest)).rejects.toThrow(
        new BadRequestError('DNI Inválido')
      );
    });

    it('debería lanzar BadRequestError si el DNI es cero', async () => {
      const invalidRequest = {
        ...mockRegisterRequest,
        DNI: 0,
      };

      await expect(handleRegisterRequest(invalidRequest)).rejects.toThrow(
        new BadRequestError('Missing required fields')
      );
    });

    it('debería lanzar BadRequestError si el email es inválido', async () => {
      const invalidEmails = [
        'notanemail',
        'missing@domain',
        '@nodomain.com',
        'no-at-sign.com',
        'spaces in@email.com',
      ];

      for (const invalidEmail of invalidEmails) {
        jest.clearAllMocks();
        
        const invalidRequest = {
          ...mockRegisterRequest,
          email: invalidEmail,
        };

        await expect(handleRegisterRequest(invalidRequest)).rejects.toThrow(
          new BadRequestError('Invalid email')
        );
        
        expect(db.user.findUnique).not.toHaveBeenCalled();
      }
    });

    it('debería lanzar BadRequestError si el email ya está en uso', async () => {
      const existingUser = { ...mockNewUser };
      (db.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

      await expect(handleRegisterRequest(mockRegisterRequest)).rejects.toThrow(
        new BadRequestError('Email already in use')
      );

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockRegisterRequest.email },
        select: {
          id: true,
          name: true,
          email: true,
          balance: true,
          isAdmin: true,
          password: true,
          dni: true,
          full_name: true,
        },
      });

      expect(db.user.create).not.toHaveBeenCalled();
    });


    it('debería generar un token después de registro exitoso', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);
      (db.user.create as jest.Mock).mockResolvedValue(mockNewUser);
      (db.tokens.create as jest.Mock).mockResolvedValue(mockTokenFromDB);

      const result = await handleRegisterRequest(mockRegisterRequest);

      expect(generateToken).toHaveBeenCalled();
      expect(db.tokens.create).toHaveBeenCalled();
      expect(result.token).toBe(mockTokenString);
    });

    it('debería crear un usuario con isAdmin en false por defecto', async () => {
      (db.user.findUnique as jest.Mock).mockResolvedValue(null);
      (db.user.create as jest.Mock).mockResolvedValue(mockNewUser);
      (db.tokens.create as jest.Mock).mockResolvedValue(mockTokenFromDB);

      await handleRegisterRequest(mockRegisterRequest);

      expect(db.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isAdmin: false,
          }),
        })
      );
    });
  });
});