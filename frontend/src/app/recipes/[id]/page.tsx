'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2, Clock, Users, Star, ChefHat, Heart, BookmarkPlus } from 'lucide-react';
import Link from 'next/link';

export default function RecipeDetailsPage({ params }: { params: { id: string } }) {
  const { data: recipe, isLoading, error } = useQuery({
    queryKey: ['recipe', params.id],
    queryFn: async () => {
      const res = await api.get(`/recipes/${params.id}`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="glass-card p-12 text-center border-red-500/30 max-w-2xl mx-auto mt-12 bg-red-500/5">
        <h2 className="text-2xl font-bold mb-2">Recipe Not Found</h2>
        <p className="text-[var(--color-text-muted)] mb-6">The recipe you're looking for doesn't exist or has been removed.</p>
        <Link href="/recipes" className="btn-primary inline-flex">Go back to recipes</Link>
      </div>
    );
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="max-w-5xl mx-auto py-8 animate-fade-in pb-24">
      
      {/* Header section */}
      <div className="glass-card overflow-hidden">
        {recipe.images?.[0] ? (
          <div className="w-full h-[400px] relative">
            <img src={recipe.images[0].url} alt={recipe.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-black/40 to-transparent" />
          </div>
        ) : (
          <div className="w-full h-[300px] bg-gradient-to-br from-primary-900/40 to-[var(--color-bg)] relative flex items-center justify-center">
            <ChefHat className="w-24 h-24 text-primary-500/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-transparent" />
          </div>
        )}

        <div className="px-8 pb-8 pt-6 relative top-[-40px]">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="badge">{recipe.difficulty}</span>
            {recipe.cuisine && <span className="badge bg-blue-500/10 text-blue-400">{recipe.cuisine}</span>}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            {recipe.title}
          </h1>
          
          <p className="text-lg text-[var(--color-text-muted)] max-w-3xl leading-relaxed mb-6">
            {recipe.description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-6 border-y border-[var(--color-border)] py-4">
            <div className="flex items-center gap-6">
              <Link href={`/profile/${recipe.author.id}`} className="flex items-center gap-3 group">
                {recipe.author.avatar ? (
                  <img src={recipe.author.avatar} alt={recipe.author.name} className="w-10 h-10 rounded-full border border-primary-500/30 group-hover:border-primary-400 transition-colors" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold border border-primary-500/30">
                    {recipe.author.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm text-[var(--color-text-muted)] leading-none mb-1 shadow-sm">Created by</p>
                  <p className="font-semibold group-hover:text-primary-400 transition-colors">{recipe.author.name}</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="uppercase tracking-wider text-xs font-bold">Total Time</span>
                </div>
                <span className="font-semibold text-lg">{totalTime > 0 ? `${totalTime}m` : '--'}</span>
              </div>
              <div className="w-px h-10 bg-[var(--color-border)]" />
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] mb-1">
                  <Users className="w-4 h-4" />
                  <span className="uppercase tracking-wider text-xs font-bold">Servings</span>
                </div>
                <span className="font-semibold text-lg">{recipe.servings}</span>
              </div>
              <div className="w-px h-10 bg-[var(--color-border)]" />
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] mb-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="uppercase tracking-wider text-xs font-bold">Rating</span>
                </div>
                <span className="font-semibold text-lg">{recipe.averageRating.toFixed(1)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="p-3 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] transition-colors group" title="Like Recipe">
                <Heart className="w-5 h-5 text-gray-400 group-hover:text-red-400 group-hover:fill-red-400/20" />
              </button>
              <button className="p-3 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] transition-colors group" title="Save to Collection">
                <BookmarkPlus className="w-5 h-5 text-gray-400 group-hover:text-primary-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        {/* Ingredients sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-6 border-t-4 border-t-primary-500">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              Ingredients
              <span className="text-sm font-normal text-gray-400 ml-auto bg-[var(--color-surface)] px-2 py-1 rounded-md">
                {recipe.ingredients.length} items
              </span>
            </h2>
            <ul className="space-y-4">
              {recipe.ingredients.map((ing: any) => (
                <li key={ing.id} className="flex gap-3 text-[var(--color-text)]">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                  <div>
                    <span className="font-medium">
                      {ing.quantity && `${ing.quantity} `}{ing.unit && `${ing.unit} `}
                    </span>
                    <span className="text-gray-300">{ing.name}</span>
                    {ing.notes && <p className="text-sm text-gray-500 mt-1">{ing.notes}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Instructions */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-8 font-display">Instructions</h2>
            <div className="space-y-8">
              {recipe.steps.map((step: any, index: number) => (
                <div key={step.id} className="relative pl-12">
                  <div className="absolute left-0 top-[-2px] w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold text-lg ring-4 ring-[var(--color-bg)]">
                    {index + 1}
                  </div>
                  {index !== recipe.steps.length - 1 && (
                    <div className="absolute left-[15px] top-8 bottom-[-20px] w-px bg-primary-500/20" />
                  )}
                  <p className="text-lg leading-relaxed text-gray-300">{step.instruction}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
