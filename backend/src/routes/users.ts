import { Router } from 'express';
import { userService } from '../services/userService';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Get user profile
router.get('/:id', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const profile = await userService.getProfile(req.params.id, req.user?.id);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

// Update own profile
router.patch('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { name, bio, avatar, location } = req.body;
    const user = await userService.updateProfile(req.user!.id, { name, bio, avatar, location });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Follow/unfollow user
router.post('/:id/follow', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await userService.toggleFollow(req.user!.id, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get followers
router.get('/:id/followers', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const result = await userService.getFollowers(req.params.id, page);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get following
router.get('/:id/following', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const result = await userService.getFollowing(req.params.id, page);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get user bookmarks
router.get('/me/bookmarks', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const result = await userService.getUserBookmarks(req.user!.id, page);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
