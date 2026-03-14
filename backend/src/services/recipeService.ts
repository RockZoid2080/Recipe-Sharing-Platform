import prisma from '../lib/prisma';
import { Prisma, RecipeStatus } from '@prisma/client';

interface CreateRecipeData {
  title: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  cuisine?: string;
  privacy?: boolean;
  status?: RecipeStatus;
  ingredients?: Array<{ name: string; quantity?: number; unit?: string; notes?: string; orderIndex?: number }>;
  steps?: Array<{ instruction: string; imageUrl?: string; timerMinutes?: number; orderIndex?: number }>;
  tags?: string[];
  categories?: string[];
}

export const recipeService = {
  async create(authorId: string, data: CreateRecipeData) {
    const recipe = await prisma.recipe.create({
      data: {
        authorId,
        title: data.title,
        description: data.description,
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        servings: data.servings || 4,
        difficulty: data.difficulty || 'EASY',
        cuisine: data.cuisine,
        privacy: data.privacy || false,
        status: data.status || 'DRAFT',
        ingredients: data.ingredients
          ? { create: data.ingredients.map((ing, i) => ({ ...ing, orderIndex: ing.orderIndex ?? i })) }
          : undefined,
        steps: data.steps
          ? { create: data.steps.map((step, i) => ({ ...step, orderIndex: step.orderIndex ?? i })) }
          : undefined,
        tags: data.tags
          ? {
              create: await Promise.all(
                data.tags.map(async (tagName) => {
                  const tag = await prisma.tag.upsert({
                    where: { name: tagName.toLowerCase() },
                    create: { name: tagName.toLowerCase() },
                    update: {},
                  });
                  return { tagId: tag.id };
                })
              ),
            }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        ingredients: { orderBy: { orderIndex: 'asc' } },
        steps: { orderBy: { orderIndex: 'asc' } },
        images: { orderBy: { orderIndex: 'asc' } },
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
        _count: { select: { comments: true, likes: true, bookmarks: true } },
      },
    });

    // Create initial version snapshot
    await prisma.recipeVersion.create({
      data: {
        recipeId: recipe.id,
        version: 1,
        data: recipe as unknown as Prisma.JsonObject,
      },
    });

    return recipe;
  },

  async update(recipeId: string, userId: string, data: CreateRecipeData) {
    const existing = await prisma.recipe.findUnique({ where: { id: recipeId } });
    if (!existing) throw Object.assign(new Error('Recipe not found'), { statusCode: 404 });
    if (existing.authorId !== userId) throw Object.assign(new Error('Not authorized'), { statusCode: 403 });

    // Increment version
    const newVersion = existing.version + 1;

    const recipe = await prisma.$transaction(async (tx) => {
      // Delete old ingredients and steps if new ones provided
      if (data.ingredients) {
        await tx.ingredient.deleteMany({ where: { recipeId } });
      }
      if (data.steps) {
        await tx.step.deleteMany({ where: { recipeId } });
      }
      if (data.tags) {
        await tx.recipeTag.deleteMany({ where: { recipeId } });
      }

      const updated = await tx.recipe.update({
        where: { id: recipeId },
        data: {
          title: data.title,
          description: data.description,
          prepTime: data.prepTime,
          cookTime: data.cookTime,
          servings: data.servings,
          difficulty: data.difficulty,
          cuisine: data.cuisine,
          privacy: data.privacy,
          status: data.status,
          version: newVersion,
          ingredients: data.ingredients
            ? { create: data.ingredients.map((ing, i) => ({ ...ing, orderIndex: ing.orderIndex ?? i })) }
            : undefined,
          steps: data.steps
            ? { create: data.steps.map((step, i) => ({ ...step, orderIndex: step.orderIndex ?? i })) }
            : undefined,
        },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          ingredients: { orderBy: { orderIndex: 'asc' } },
          steps: { orderBy: { orderIndex: 'asc' } },
          images: { orderBy: { orderIndex: 'asc' } },
          tags: { include: { tag: true } },
          categories: { include: { category: true } },
          _count: { select: { comments: true, likes: true, bookmarks: true } },
        },
      });

      // Save version snapshot
      await tx.recipeVersion.create({
        data: {
          recipeId,
          version: newVersion,
          data: updated as unknown as Prisma.JsonObject,
        },
      });

      return updated;
    });

    return recipe;
  },

  async getById(recipeId: string, userId?: string) {
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        author: { select: { id: true, name: true, avatar: true, bio: true } },
        ingredients: { orderBy: { orderIndex: 'asc' } },
        steps: { orderBy: { orderIndex: 'asc' } },
        images: { orderBy: { orderIndex: 'asc' } },
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
        comments: {
          where: { parentId: null },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
            replies: {
              include: { user: { select: { id: true, name: true, avatar: true } } },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: { select: { comments: true, likes: true, bookmarks: true, ratings: true } },
      },
    });

    if (!recipe) throw Object.assign(new Error('Recipe not found'), { statusCode: 404 });

    // Increment view count
    await prisma.recipe.update({
      where: { id: recipeId },
      data: { viewCount: { increment: 1 } },
    });

    // Check if current user liked/bookmarked
    let userInteraction = null;
    if (userId) {
      const [liked, bookmarked, userRating] = await Promise.all([
        prisma.like.findUnique({ where: { recipeId_userId: { recipeId, userId } } }),
        prisma.bookmark.findUnique({ where: { recipeId_userId: { recipeId, userId } } }),
        prisma.rating.findUnique({ where: { recipeId_userId: { recipeId, userId } } }),
      ]);
      userInteraction = {
        liked: !!liked,
        bookmarked: !!bookmarked,
        userRating: userRating?.value || null,
      };
    }

    return { ...recipe, userInteraction };
  },

  async list(params: {
    page?: number;
    limit?: number;
    cuisine?: string;
    difficulty?: string;
    tags?: string[];
    sort?: string;
    authorId?: string;
    status?: RecipeStatus;
  }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 12, 50);
    const skip = (page - 1) * limit;

    const where: Prisma.RecipeWhereInput = {
      status: params.status || 'PUBLISHED',
      privacy: false,
      ...(params.cuisine && { cuisine: { equals: params.cuisine, mode: 'insensitive' as Prisma.QueryMode } }),
      ...(params.difficulty && { difficulty: params.difficulty as any }),
      ...(params.authorId && { authorId: params.authorId }),
      ...(params.tags?.length && {
        tags: { some: { tag: { name: { in: params.tags.map((t) => t.toLowerCase()) } } } },
      }),
    };

    let orderBy: Prisma.RecipeOrderByWithRelationInput = { createdAt: 'desc' };
    switch (params.sort) {
      case 'popular':
        orderBy = { likesCount: 'desc' };
        break;
      case 'rating':
        orderBy = { averageRating: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
    }

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          images: { where: { isPrimary: true }, take: 1 },
          tags: { include: { tag: true } },
          _count: { select: { comments: true, likes: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ]);

    return {
      recipes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async delete(recipeId: string, userId: string) {
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
    if (!recipe) throw Object.assign(new Error('Recipe not found'), { statusCode: 404 });
    if (recipe.authorId !== userId) throw Object.assign(new Error('Not authorized'), { statusCode: 403 });

    await prisma.recipe.delete({ where: { id: recipeId } });
    return { message: 'Recipe deleted successfully' };
  },

  async getVersions(recipeId: string) {
    return prisma.recipeVersion.findMany({
      where: { recipeId },
      orderBy: { version: 'desc' },
      select: { id: true, version: true, changelog: true, createdAt: true },
    });
  },
};
