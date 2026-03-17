'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus, Trash2, ArrowRight } from 'lucide-react';

const recipeSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  prepTime: z.coerce.number().min(0).optional(),
  cookTime: z.coerce.number().min(0).optional(),
  servings: z.coerce.number().min(1, 'At least 1 serving is required'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']),
  cuisine: z.string().optional(),
  ingredients: z.array(z.object({
    name: z.string().min(1, 'Ingredient name required'),
    quantity: z.coerce.number().min(0).optional(),
    unit: z.string().optional(),
    notes: z.string().optional(),
  })).min(1, 'Add at least one ingredient'),
  steps: z.array(z.object({
    instruction: z.string().min(5, 'Step instruction is too short'),
    timerMinutes: z.coerce.number().optional(),
  })).min(1, 'Add at least one step'),
});

type RecipeForm = z.infer<typeof recipeSchema>;

export default function CreateRecipePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { register, control, handleSubmit, formState: { errors } } = useForm<RecipeForm>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: '',
      description: '',
      difficulty: 'MEDIUM',
      servings: 4,
      ingredients: [{ name: '', quantity: 1, unit: '' }],
      steps: [{ instruction: '' }],
    }
  });

  const { fields: ingFields, append: appendIng, remove: removeIng } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control,
    name: 'steps',
  });

  // Protect route
  if (user === null && !isLoading) {
    router.push('/login');
    return null;
  }

  const onSubmit = async (data: RecipeForm) => {
    try {
      setIsLoading(true);
      
      // Enforce orderIndex for arrays
      const payload = {
        ...data,
        ingredients: data.ingredients.map((ing, i) => ({ ...ing, orderIndex: i })),
        steps: data.steps.map((step, i) => ({ ...step, orderIndex: i })),
        status: 'PUBLISHED'
      };

      const res = await api.post('/recipes', payload);
      toast.success('Recipe published successfully!');
      router.push(`/recipes/${res.data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create recipe.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-in pb-24">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Create New Recipe</h1>
        <p className="text-[var(--color-text-muted)]">Share your culinary secrets with the world.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        
        {/* Basic Details */}
        <div className="glass-card p-6 md:p-8 space-y-6">
          <h2 className="text-2xl font-bold border-b border-[var(--color-border)] leading-loose">Basic Information</h2>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Recipe Title</label>
            <input type="text" {...register('title')} className="input-field text-lg" placeholder="e.g. Classic Margherita Pizza" />
            {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Description</label>
            <textarea {...register('description')} rows={3} className="input-field" placeholder="Tell us the story behind this recipe..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Prep time (min)</label>
              <input type="number" {...register('prepTime')} className="input-field" placeholder="15" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Cook time (min)</label>
              <input type="number" {...register('cookTime')} className="input-field" placeholder="30" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Servings</label>
              <input type="number" {...register('servings')} className="input-field" placeholder="4" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Difficulty</label>
              <select {...register('difficulty')} className="input-field appearance-none">
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="glass-card p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] leading-loose">
            <h2 className="text-2xl font-bold">Ingredients</h2>
            <button type="button" onClick={() => appendIng({ name: '', quantity: 1, unit: '' })} className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Ingredient
            </button>
          </div>

          <div className="space-y-4">
            {ingFields.map((field, index) => (
              <div key={field.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-[var(--color-surface)] p-4 rounded-xl relative group">
                <input
                  type="number"
                  step="0.1"
                  {...register(`ingredients.${index}.quantity` as const)}
                  className="input-field md:w-24 text-center"
                  placeholder="Qty"
                />
                <input
                  type="text"
                  {...register(`ingredients.${index}.unit` as const)}
                  className="input-field md:w-32"
                  placeholder="Unit (e.g. cup)"
                />
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    {...register(`ingredients.${index}.name` as const)}
                    className="input-field w-full"
                    placeholder="Ingredient name"
                  />
                  {errors.ingredients?.[index]?.name && <p className="text-red-400 text-xs mt-1">{errors.ingredients[index]?.name?.message}</p>}
                </div>
                {ingFields.length > 1 && (
                  <button type="button" onClick={() => removeIng(index)} className="p-2 text-gray-500 hover:text-red-400 transition-colors bg-[var(--color-bg)] rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="glass-card p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] leading-loose">
            <h2 className="text-2xl font-bold">Instructions</h2>
            <button type="button" onClick={() => appendStep({ instruction: '' })} className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Step
            </button>
          </div>

          <div className="space-y-4">
            {stepFields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start bg-[var(--color-surface)] p-4 rounded-xl relative">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-2">
                  <textarea
                    {...register(`steps.${index}.instruction` as const)}
                    className="input-field"
                    rows={2}
                    placeholder="Describe this step..."
                  />
                  {errors.steps?.[index]?.instruction && <p className="text-red-400 text-xs">{errors.steps[index]?.instruction?.message}</p>}
                </div>
                {stepFields.length > 1 && (
                  <button type="button" onClick={() => removeStep(index)} className="p-2 text-gray-500 hover:text-red-400 transition-colors mt-1">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary min-w-[200px] flex justify-center items-center gap-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>Publish Recipe <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
