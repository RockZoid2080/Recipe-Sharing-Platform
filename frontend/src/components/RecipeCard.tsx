import Link from 'next/link';
import { Star, Clock, Users } from 'lucide-react';

export interface RecipeCardProps {
  id: string;
  title: string;
  author: { name: string; avatar: string | null };
  imageUrl: string | null;
  prepTime: number | null;
  cookTime: number | null;
  servings: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  averageRating: number;
}

export function RecipeCard({
  id,
  title,
  author,
  imageUrl,
  prepTime,
  cookTime,
  servings,
  difficulty,
  averageRating,
}: RecipeCardProps) {
  const totalTime = (prepTime || 0) + (cookTime || 0);

  return (
    <Link href={`/recipes/${id}`} className="recipe-card group block">
      <div className="aspect-[4/3] bg-[var(--color-surface)] relative overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-primary-900/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
            <span className="text-primary-500/50 text-4xl font-black">RecipeShare</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        <div className="absolute top-3 left-3 z-20 badge">
          {difficulty}
        </div>
      </div>
      
      <div className="p-5 space-y-4 relative z-20">
        <h3 className="text-lg font-bold leading-tight group-hover:text-primary-400 transition-colors line-clamp-2">
          {title}
        </h3>
        
        <div className="flex items-center gap-2">
          {author.avatar ? (
            <img src={author.avatar} alt={author.name} className="w-5 h-5 rounded-full" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-primary-500/20 flex justify-center items-center">
              <span className="text-[10px] text-primary-400 font-bold">{author.name.charAt(0)}</span>
            </div>
          )}
          <span className="text-sm text-gray-400 truncate">{author.name}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-medium text-white">{averageRating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{totalTime > 0 ? `${totalTime}m` : '--m'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{servings}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
