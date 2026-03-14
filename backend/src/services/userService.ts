import prisma from '../lib/prisma';

export const userService = {
  async getProfile(userId: string, currentUserId?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatar: true,
        location: true,
        createdAt: true,
        _count: {
          select: {
            recipes: { where: { status: 'PUBLISHED' } },
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: currentUserId, followingId: userId } },
      });
      isFollowing = !!follow;
    }

    return { ...user, isFollowing };
  },

  async updateProfile(userId: string, data: { name?: string; bio?: string; avatar?: string; location?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, bio: true, avatar: true, location: true, email: true },
    });
  },

  async toggleFollow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw Object.assign(new Error('Cannot follow yourself'), { statusCode: 400 });
    }

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      return { following: false };
    }

    await prisma.follow.create({ data: { followerId, followingId } });

    // Notification
    await prisma.notification.create({
      data: {
        userId: followingId,
        type: 'FOLLOW',
        data: { actorId: followerId },
      },
    });

    return { following: true };
  },

  async getFollowers(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: userId },
        include: { follower: { select: { id: true, name: true, avatar: true, bio: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.follow.count({ where: { followingId: userId } }),
    ]);

    return {
      users: followers.map((f) => f.follower),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getFollowing(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [following, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        include: { following: { select: { id: true, name: true, avatar: true, bio: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);

    return {
      users: following.map((f) => f.following),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getUserBookmarks(userId: string, page = 1, limit = 12) {
    const skip = (page - 1) * limit;
    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId },
        include: {
          recipe: {
            include: {
              author: { select: { id: true, name: true, avatar: true } },
              images: { where: { isPrimary: true }, take: 1 },
              _count: { select: { comments: true, likes: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.bookmark.count({ where: { userId } }),
    ]);

    return {
      recipes: bookmarks.map((b) => b.recipe),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },
};
