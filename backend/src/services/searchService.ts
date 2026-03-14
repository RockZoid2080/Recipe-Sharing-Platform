import prisma from '../lib/prisma';

export const searchService = {
  async search(params: {
    q: string;
    cuisine?: string;
    difficulty?: string;
    tags?: string[];
    maxTime?: number;
    minRating?: number;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 12, 50);
    const skip = (page - 1) * limit;
    const query = params.q.trim();

    // Build where clause with text search
    const where: any = {
      status: 'PUBLISHED',
      privacy: false,
    };

    // Full-text search on title and description
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { ingredients: { some: { name: { contains: query, mode: 'insensitive' } } } },
        { tags: { some: { tag: { name: { contains: query.toLowerCase(), mode: 'insensitive' } } } } },
      ];
    }

    if (params.cuisine) {
      where.cuisine = { equals: params.cuisine, mode: 'insensitive' };
    }

    if (params.difficulty) {
      where.difficulty = params.difficulty;
    }

    if (params.tags?.length) {
      where.tags = {
        ...where.tags,
        some: { tag: { name: { in: params.tags.map((t) => t.toLowerCase()) } } },
      };
    }

    if (params.maxTime) {
      where.OR = [
        ...(where.OR || []),
        {
          AND: [
            { prepTime: { not: null } },
            { cookTime: { not: null } },
          ],
        },
      ];
      // Filter by total time (prepTime + cookTime <= maxTime)
      where.prepTime = { lte: params.maxTime };
    }

    if (params.minRating) {
      where.averageRating = { gte: params.minRating };
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
        orderBy: [
          { likesCount: 'desc' },
          { averageRating: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ]);

    // Get facet counts for filters
    const [cuisineFacets, difficultyFacets] = await Promise.all([
      prisma.recipe.groupBy({
        by: ['cuisine'],
        where: { status: 'PUBLISHED', privacy: false, cuisine: { not: null } },
        _count: true,
        orderBy: { _count: { cuisine: 'desc' } },
        take: 20,
      }),
      prisma.recipe.groupBy({
        by: ['difficulty'],
        where: { status: 'PUBLISHED', privacy: false },
        _count: true,
      }),
    ]);

    return {
      recipes,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      facets: {
        cuisines: cuisineFacets
          .filter((f) => f.cuisine)
          .map((f) => ({ name: f.cuisine!, count: f._count })),
        difficulties: difficultyFacets.map((f) => ({ name: f.difficulty, count: f._count })),
      },
    };
  },
};
