import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

const SALT_ROUNDS = 12;

export const authService = {
  async register(data: { email: string; password: string; name: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const verifyToken = uuidv4();

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        verifyToken,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    // TODO: Send verification email when SMTP is configured
    console.log(`[DEV] Verification token for ${user.email}: ${verifyToken}`);

    const tokens = this.generateTokens(user);
    return { user, ...tokens };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true, email: true, name: true, role: true,
        passwordHash: true, emailVerified: true, avatar: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    const { passwordHash, ...userData } = user;
    const tokens = this.generateTokens(userData);
    return { user: userData, ...tokens };
  },

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { id: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true, role: true },
      });

      if (!user) {
        throw Object.assign(new Error('User not found'), { statusCode: 401 });
      }

      return this.generateTokens(user);
    } catch {
      throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
    }
  },

  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({ where: { verifyToken: token } });
    if (!user) {
      throw Object.assign(new Error('Invalid verification token'), { statusCode: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verifyToken: null },
    });

    return { message: 'Email verified successfully' };
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetExpires },
    });

    // TODO: Send reset email when SMTP is configured
    console.log(`[DEV] Reset token for ${email}: ${resetToken}`);

    return { message: 'If the email exists, a reset link has been sent' };
  },

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw Object.assign(new Error('Invalid or expired reset token'), { statusCode: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetExpires: null },
    });

    return { message: 'Password reset successfully' };
  },

  generateTokens(user: { id: string; email: string; role: string; name: string }) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'] }
    );

    return { accessToken, refreshToken };
  },
};
