import { Router } from 'express';
import { collectionService, mealPlanService } from '../services/collectionService';
import { authenticate, AuthRequest } from '../middleware/auth';

const collectionRouter = Router();
const mealPlanRouter = Router();

// ─── Collections ────────────────────────────────────

collectionRouter.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const collections = await collectionService.getUserCollections(req.user!.id);
    res.json(collections);
  } catch (err) {
    next(err);
  }
});

collectionRouter.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const collection = await collectionService.create(req.user!.id, req.body);
    res.status(201).json(collection);
  } catch (err) {
    next(err);
  }
});

collectionRouter.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const collection = await collectionService.update(req.params.id, req.user!.id, req.body);
    res.json(collection);
  } catch (err) {
    next(err);
  }
});

collectionRouter.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await collectionService.delete(req.params.id, req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

collectionRouter.post('/:id/recipes', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await collectionService.addRecipe(req.params.id, req.body.recipeId, req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

collectionRouter.delete('/:id/recipes/:recipeId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await collectionService.removeRecipe(req.params.id, req.params.recipeId, req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── Meal Plans ─────────────────────────────────────

mealPlanRouter.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const startDate = new Date(req.query.startDate as string || new Date());
    const endDate = new Date(req.query.endDate as string || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    const plans = await mealPlanService.getByDateRange(req.user!.id, startDate, endDate);
    res.json(plans);
  } catch (err) {
    next(err);
  }
});

mealPlanRouter.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const plan = await mealPlanService.add(req.user!.id, {
      ...req.body,
      date: new Date(req.body.date),
    });
    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
});

mealPlanRouter.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await mealPlanService.remove(req.params.id, req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export { collectionRouter, mealPlanRouter };
