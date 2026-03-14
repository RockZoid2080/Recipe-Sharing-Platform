import { Router } from 'express';
import { searchService } from '../services/searchService';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await searchService.search({
      q: (req.query.q as string) || '',
      cuisine: req.query.cuisine as string,
      difficulty: req.query.difficulty as string,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      maxTime: req.query.maxTime ? parseInt(req.query.maxTime as string) : undefined,
      minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 12,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
