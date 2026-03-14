import { Router } from 'express';
import { interactionService } from '../services/interactionService';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Like/unlike recipe
router.post('/:id/like', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await interactionService.toggleLike(req.params.id, req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Bookmark/unbookmark recipe
router.post('/:id/bookmark', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await interactionService.toggleBookmark(req.params.id, req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Add comment
router.post('/:id/comments', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { content, parentId } = req.body;
    const comment = await interactionService.addComment(req.params.id, req.user!.id, content, parentId);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

// Delete comment
router.delete('/comments/:commentId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await interactionService.deleteComment(req.params.commentId, req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Rate recipe
router.post('/:id/rate', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { value } = req.body;
    const result = await interactionService.rate(req.params.id, req.user!.id, value);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
