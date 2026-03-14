import { Router } from 'express';
import { z } from 'zod';
import { recipeService } from '../services/recipeService';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const createRecipeSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  prepTime: z.number().int().positive().optional(),
  cookTime: z.number().int().positive().optional(),
  servings: z.number().int().positive().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional(),
  cuisine: z.string().optional(),
  privacy: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  ingredients: z.array(z.object({
    name: z.string().min(1),
    quantity: z.number().positive().optional(),
    unit: z.string().optional(),
    notes: z.string().optional(),
    orderIndex: z.number().int().optional(),
  })).optional(),
  steps: z.array(z.object({
    instruction: z.string().min(1),
    imageUrl: z.string().url().optional(),
    timerMinutes: z.number().int().positive().optional(),
    orderIndex: z.number().int().optional(),
  })).optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
});

// Create recipe
router.post('/', authenticate, validate(createRecipeSchema), async (req: AuthRequest, res, next) => {
  try {
    const recipe = await recipeService.create(req.user!.id, req.body);
    res.status(201).json(recipe);
  } catch (err) {
    next(err);
  }
});

// Update recipe
router.put('/:id', authenticate, validate(createRecipeSchema), async (req: AuthRequest, res, next) => {
  try {
    const recipe = await recipeService.update(req.params.id, req.user!.id, req.body);
    res.json(recipe);
  } catch (err) {
    next(err);
  }
});

// Get single recipe
router.get('/:id', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const recipe = await recipeService.getById(req.params.id, req.user?.id);
    res.json(recipe);
  } catch (err) {
    next(err);
  }
});

// List recipes
router.get('/', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const result = await recipeService.list({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 12,
      cuisine: req.query.cuisine as string,
      difficulty: req.query.difficulty as string,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      sort: req.query.sort as string,
      authorId: req.query.authorId as string,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Delete recipe
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await recipeService.delete(req.params.id, req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get recipe versions
router.get('/:id/versions', async (req, res, next) => {
  try {
    const versions = await recipeService.getVersions(req.params.id);
    res.json(versions);
  } catch (err) {
    next(err);
  }
});

export default router;
