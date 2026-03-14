import { Router } from 'express';
import { shoppingListService } from '../services/shoppingListService';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/generate', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { recipeIds, servingMultiplier } = req.body;
    if (!recipeIds?.length) {
      return res.status(400).json({ error: 'At least one recipe ID is required' });
    }
    const result = await shoppingListService.generate(req.user!.id, recipeIds, servingMultiplier);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/export', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { recipeIds, servingMultiplier, format } = req.body;
    const result = await shoppingListService.generate(req.user!.id, recipeIds, servingMultiplier);

    if (format === 'text') {
      const text = shoppingListService.formatAsText(result.items);
      res.type('text/plain').send(text);
    } else {
      res.json(result);
    }
  } catch (err) {
    next(err);
  }
});

export default router;
