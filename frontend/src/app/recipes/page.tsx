'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { RecipeCard, RecipeCardProps } from '@/components/RecipeCard';
import { Loader2, Search } from 'lucide-react';

export default function RecipesFeed() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const res = await api.get('/recipes');
      return res.data;
    },
  });

  return (
    <div className="py-8 animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Discover Recipes</h1>
          <p className="text-[var(--color-text-muted)] mt-2">Explore the best culinary creations from our community.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
             type="text"
             className="input-field pl-10 h-10 text-sm"
             placeholder="Search recipes..."
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : error ? (
        <div className="glass-card border-red-500/30 p-8 text-center bg-red-500/5">
          <p className="text-red-400">Failed to load recipes. Please try again later.</p>
        </div>
      ) : data?.recipes?.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <h3 className="text-xl font-bold mb-2">No recipes found</h3>
          <p className="text-[var(--color-text-muted)]">Be the first to share a masterpiece!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.recipes?.map((recipe: any) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              author={{ name: recipe.author.name, avatar: recipe.author.avatar }}
              imageUrl={recipe.images?.[0]?.url || null}
              prepTime={recipe.prepTime}
              cookTime={recipe.cookTime}
              servings={recipe.servings}
              difficulty={recipe.difficulty}
              averageRating={recipe.averageRating}
            />
          ))}
        </div>
      )}
    </div>
  );
}
