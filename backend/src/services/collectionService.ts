import prisma from '../lib/prisma';

export const collectionService = {
  async create(userId: string, data: { name: string; description?: string; isPublic?: boolean }) {
    return prisma.collection.create({
      data: { userId, ...data },
      include: { _count: { select: { recipes: true } } },
    });
  },

  async update(collectionId: string, userId: string, data: { name?: string; description?: string; isPublic?: boolean }) {
    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection) throw Object.assign(new Error('Collection not found'), { statusCode: 404 });
    if (collection.userId !== userId) throw Object.assign(new Error('Not authorized'), { statusCode: 403 });

    return prisma.collection.update({
      where: { id: collectionId },
      data,
      include: { _count: { select: { recipes: true } } },
    });
  },

  async delete(collectionId: string, userId: string) {
    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection) throw Object.assign(new Error('Collection not found'), { statusCode: 404 });
    if (collection.userId !== userId) throw Object.assign(new Error('Not authorized'), { statusCode: 403 });

    await prisma.collection.delete({ where: { id: collectionId } });
    return { message: 'Collection deleted' };
  },

  async getUserCollections(userId: string) {
    return prisma.collection.findMany({
      where: { userId },
      include: {
        _count: { select: { recipes: true } },
        recipes: {
          take: 4,
          include: {
            recipe: {
              select: { id: true, title: true, images: { where: { isPrimary: true }, take: 1 } },
            },
          },
          orderBy: { addedAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async addRecipe(collectionId: string, recipeId: string, userId: string) {
    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection) throw Object.assign(new Error('Collection not found'), { statusCode: 404 });
    if (collection.userId !== userId) throw Object.assign(new Error('Not authorized'), { statusCode: 403 });

    await prisma.collectionRecipe.create({ data: { collectionId, recipeId } });
    return { message: 'Recipe added to collection' };
  },

  async removeRecipe(collectionId: string, recipeId: string, userId: string) {
    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection) throw Object.assign(new Error('Collection not found'), { statusCode: 404 });
    if (collection.userId !== userId) throw Object.assign(new Error('Not authorized'), { statusCode: 403 });

    await prisma.collectionRecipe.delete({
      where: { collectionId_recipeId: { collectionId, recipeId } },
    });
    return { message: 'Recipe removed from collection' };
  },
};

export const mealPlanService = {
  async getByDateRange(userId: string, startDate: Date, endDate: Date) {
    return prisma.mealPlan.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: {
        recipe: {
          select: {
            id: true, title: true, prepTime: true, cookTime: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
      orderBy: [{ date: 'asc' }, { mealType: 'asc' }],
    });
  },

  async add(userId: string, data: { recipeId: string; date: Date; mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'; servings?: number }) {
    return prisma.mealPlan.create({
      data: { userId, ...data },
      include: {
        recipe: {
          select: { id: true, title: true, images: { where: { isPrimary: true }, take: 1 } },
        },
      },
    });
  },

  async remove(planId: string, userId: string) {
    const plan = await prisma.mealPlan.findUnique({ where: { id: planId } });
    if (!plan) throw Object.assign(new Error('Meal plan entry not found'), { statusCode: 404 });
    if (plan.userId !== userId) throw Object.assign(new Error('Not authorized'), { statusCode: 403 });

    await prisma.mealPlan.delete({ where: { id: planId } });
    return { message: 'Meal plan entry removed' };
  },
};
