import { Router } from 'express';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

// All admin routes require authentication + ADMIN/MODERATOR role
router.use(authenticate);
router.use(requireRole('ADMIN', 'MODERATOR'));

// Dashboard metrics
router.get('/metrics', async (_req: AuthRequest, res, next) => {
  try {
    const [userCount, recipeCount, commentCount, reportCount] = await Promise.all([
      prisma.user.count(),
      prisma.recipe.count(),
      prisma.comment.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
    ]);

    const recentUsers = await prisma.user.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    });

    const recentRecipes = await prisma.recipe.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    });

    res.json({
      users: { total: userCount, thisWeek: recentUsers },
      recipes: { total: recipeCount, thisWeek: recentRecipes },
      comments: { total: commentCount },
      reports: { pending: reportCount },
    });
  } catch (err) {
    next(err);
  }
});

// Moderation queue
router.get('/moderation', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string || 'PENDING';

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: { status: status as any },
        include: { reporter: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.report.count({ where: { status: status as any } }),
    ]);

    res.json({
      reports,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// Moderation actions
router.post('/moderation/:id/action', async (req: AuthRequest, res, next) => {
  try {
    const { action, reason } = req.body;
    const reportId = req.params.id;

    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) return res.status(404).json({ error: 'Report not found' });

    // Update report status
    const newStatus = action === 'dismiss' ? 'DISMISSED' : 'ACTION_TAKEN';
    await prisma.report.update({
      where: { id: reportId },
      data: { status: newStatus as any },
    });

    // Take action on target
    if (action === 'remove' && report.targetType === 'recipe') {
      await prisma.recipe.update({
        where: { id: report.targetId },
        data: { status: 'FLAGGED' },
      });
    } else if (action === 'remove' && report.targetType === 'comment') {
      await prisma.comment.delete({ where: { id: report.targetId } }).catch(() => {});
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        action: `moderation_${action}`,
        details: { reportId, targetType: report.targetType, targetId: report.targetId, reason },
      },
    });

    res.json({ message: `Report ${newStatus.toLowerCase()}` });
  } catch (err) {
    next(err);
  }
});

// User management
router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as any } },
            { email: { contains: search, mode: 'insensitive' as any } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, role: true,
          emailVerified: true, createdAt: true,
          _count: { select: { recipes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// Update user role
router.patch('/users/:id/role', async (req: AuthRequest, res, next) => {
  try {
    const { role } = req.body;
    if (!['USER', 'MODERATOR', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        action: 'role_change',
        details: { userId: req.params.id, newRole: role },
      },
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
