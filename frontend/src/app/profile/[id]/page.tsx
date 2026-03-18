'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2, ChefHat, MapPin, Calendar, BookOpen, Users } from 'lucide-react';
import { RecipeCard } from '@/components/RecipeCard';

export default function ProfilePage({ params }: { params: { id: string } }) {
  // Fetch user profile
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['profile', params.id],
    queryFn: async () => {
      const res = await api.get(`/users/${params.id}`);
      return res.data;
    },
  });

  // Fetch user's recipes separately
  const { data: recipesData } = useQuery({
    queryKey: ['user-recipes', params.id],
    queryFn: async () => {
      const res = await api.get(`/recipes`, { params: { authorId: params.id } });
      return res.data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="glass-card p-12 text-center border-red-500/30 max-w-2xl mx-auto mt-12 bg-red-500/5">
        <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
        <p className="text-[var(--color-text-muted)]">This profile doesn&apos;t exist.</p>
      </div>
    );
  }

  const recipes = recipesData?.recipes || recipesData || [];
  const recipeCount = user._count?.recipes ?? (Array.isArray(recipes) ? recipes.length : 0);
  const followerCount = user._count?.followers ?? 0;
  const followingCount = user._count?.following ?? 0;

  return (
    <div className="max-w-5xl mx-auto py-8 animate-fade-in pb-24 space-y-12">
      {/* Profile Header */}
      <div className="glass-card p-8 relative overflow-hidden">
        {/* Cover ambient glow */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary-500/10 to-transparent" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-3xl object-cover border-4 border-[var(--color-surface)] shadow-2xl shadow-primary-500/20" />
          ) : (
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-hover)] border border-[var(--color-border)] flex items-center justify-center text-primary-500 shadow-2xl">
              <ChefHat className="w-16 h-16" />
            </div>
          )}

          <div className="flex-1 text-center md:text-left space-y-4 pt-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                {user.name}
              </h1>
              {user.bio ? (
                <p className="text-[var(--color-text-muted)] max-w-2xl text-lg">{user.bio}</p>
              ) : (
                <p className="text-[var(--color-text-muted)] italic">This user prefers to keep their bio a mystery.</p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary-400" />
                <span><strong className="text-white">{recipeCount}</strong> Recipes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary-400" />
                <span><strong className="text-white">{followerCount}</strong> Followers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary-400" />
                <span><strong className="text-white">{followingCount}</strong> Following</span>
              </div>
              {user.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary-400" />
                  <span>{user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary-400" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Authored Recipes */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <h2 className="text-2xl font-bold">Recipes by {user.name.split(' ')[0]}</h2>
        </div>

        {!Array.isArray(recipes) || recipes.length === 0 ? (
          <div className="text-center py-12 glass-card">
            <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-gray-300">No recipes yet</h3>
            <p className="text-[var(--color-text-muted)] mt-1">When {user.name} publishes recipes, they will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe: any) => (
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
                title={recipe.title}
                author={{ name: user.name, avatar: user.avatar }}
                imageUrl={recipe.images?.[0]?.url || null}
                prepTime={recipe.prepTime}
                cookTime={recipe.cookTime}
                servings={recipe.servings}
                difficulty={recipe.difficulty}
                averageRating={recipe.averageRating || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
