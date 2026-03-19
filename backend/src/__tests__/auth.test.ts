import { authService } from '../services/authService';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock Prisma
jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import prisma from '../lib/prisma';

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user and return tokens', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        createdAt: new Date(),
      });

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw 409 if email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-user' });

      await expect(
        authService.register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Existing User',
        })
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should return user and tokens on valid credentials', async () => {
      const passwordHash = await bcrypt.hash('password123', 12);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        passwordHash,
        emailVerified: true,
        avatar: null,
      });

      const result = await authService.login('test@example.com', 'password123');

      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBeDefined();
    });

    it('should throw 401 on invalid password', async () => {
      const passwordHash = await bcrypt.hash('password123', 12);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash,
      });

      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw 401 on non-existent email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login('notfound@example.com', 'password123')
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('generateTokens', () => {
    it('should generate valid JWT tokens', () => {
      const user = { id: 'user-1', email: 'test@example.com', role: 'USER', name: 'Test' };
      const tokens = authService.generateTokens(user);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();

      const decoded = jwt.decode(tokens.accessToken) as any;
      expect(decoded.id).toBe('user-1');
      expect(decoded.email).toBe('test@example.com');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 'user-1' });
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const result = await authService.verifyEmail('valid-token');
      expect(result.message).toBe('Email verified successfully');
    });

    it('should throw 400 on invalid token', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(authService.verifyEmail('invalid-token')).rejects.toThrow(
        'Invalid verification token'
      );
    });
  });
});
