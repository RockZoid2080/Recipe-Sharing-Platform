import prisma from '../lib/prisma';

export const interactionService = {
  async toggleLike(recipeId: string, userId: string) {
    const existing = await prisma.like.findUnique({
      where: { recipeId_userId: { recipeId, userId } },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.like.delete({ where: { id: existing.id } }),
        prisma.recipe.update({ where: { id: recipeId }, data: { likesCount: { decrement: 1 } } }),
      ]);
      return { liked: false };
    }

    await prisma.$transaction([
      prisma.like.create({ data: { recipeId, userId } }),
      prisma.recipe.update({ where: { id: recipeId }, data: { likesCount: { increment: 1 } } }),
    ]);

    // Create notification for recipe author
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId }, select: { authorId: true } });
    if (recipe && recipe.authorId !== userId) {
      await prisma.notification.create({
        data: {
          userId: recipe.authorId,
          type: 'LIKE',
          data: { actorId: userId, recipeId },
        },
      });
    }

    return { liked: true };
  },

  async toggleBookmark(recipeId: string, userId: string) {
    const existing = await prisma.bookmark.findUnique({
      where: { recipeId_userId: { recipeId, userId } },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    }

    await prisma.bookmark.create({ data: { recipeId, userId } });
    return { bookmarked: true };
  },

  async addComment(recipeId: string, userId: string, content: string, parentId?: string) {
    // Validate parent comment exists and belongs to same recipe
    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parent || parent.recipeId !== recipeId) {
        throw Object.assign(new Error('Parent comment not found'), { statusCode: 404 });
      }
      // Only allow 1 level of nesting
      if (parent.parentId) {
        throw Object.assign(new Error('Cannot nest replies more than 1 level'), { statusCode: 400 });
      }
    }

    const comment = await prisma.comment.create({
      data: { recipeId, userId, content, parentId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Update comments count
    await prisma.recipe.update({
      where: { id: recipeId },
      data: { commentsCount: { increment: 1 } },
    });

    // Notification
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId }, select: { authorId: true } });
    if (recipe && recipe.authorId !== userId) {
      await prisma.notification.create({
        data: {
          userId: recipe.authorId,
          type: 'COMMENT',
          data: { actorId: userId, recipeId, commentId: comment.id },
        },
      });
    }

    return comment;
  },

  async deleteComment(commentId: string, userId: string) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw Object.assign(new Error('Comment not found'), { statusCode: 404 });
    if (comment.userId !== userId) throw Object.assign(new Error('Not authorized'), { statusCode: 403 });

    await prisma.comment.delete({ where: { id: commentId } });
    await prisma.recipe.update({
      where: { id: comment.recipeId },
      data: { commentsCount: { decrement: 1 } },
    });

    return { message: 'Comment deleted' };
  },

  async rate(recipeId: string, userId: string, value: number) {
    if (value < 1 || value > 5) {
      throw Object.assign(new Error('Rating must be between 1 and 5'), { statusCode: 400 });
    }

    await prisma.rating.upsert({
      where: { recipeId_userId: { recipeId, userId } },
      create: { recipeId, userId, value },
      update: { value },
    });

    // Recalculate average rating
    const avg = await prisma.rating.aggregate({
      where: { recipeId },
      _avg: { value: true },
    });

    await prisma.recipe.update({
      where: { id: recipeId },
      data: { averageRating: avg._avg.value || 0 },
    });

    return { averageRating: avg._avg.value || 0 };
  },
};
