import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

// Submit a report
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { targetType, targetId, reason, details } = req.body;
    if (!['recipe', 'comment', 'user'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid target type' });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: req.user!.id,
        targetType,
        targetId,
        reason,
        details,
      },
    });

    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
});

export default router;
