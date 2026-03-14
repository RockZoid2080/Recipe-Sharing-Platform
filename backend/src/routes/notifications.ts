import { Router } from 'express';
import { notificationService } from '../services/notificationService';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const result = await notificationService.getUserNotifications(req.user!.id, page);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/read', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user!.id);
    res.json(notification);
  } catch (err) {
    next(err);
  }
});

router.patch('/read-all', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
