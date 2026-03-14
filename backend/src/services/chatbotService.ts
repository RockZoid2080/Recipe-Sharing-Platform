import prisma from '../lib/prisma';
import { searchService } from './searchService';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Simple intent parser — maps user messages to search filters
function parseIntent(message: string) {
  const lower = message.toLowerCase();
  const filters: {
    q: string;
    cuisine?: string;
    difficulty?: string;
    maxTime?: number;
    tags?: string[];
  } = { q: '' };

  // Extract cuisine
  const cuisines = ['italian', 'mexican', 'indian', 'chinese', 'japanese', 'thai', 'french', 'mediterranean', 'korean', 'american'];
  for (const cuisine of cuisines) {
    if (lower.includes(cuisine)) {
      filters.cuisine = cuisine;
    }
  }

  // Extract difficulty
  if (lower.includes('easy') || lower.includes('simple') || lower.includes('beginner')) {
    filters.difficulty = 'EASY';
  } else if (lower.includes('hard') || lower.includes('challenging') || lower.includes('advanced')) {
    filters.difficulty = 'HARD';
  }

  // Extract time constraints
  const timeMatch = lower.match(/(\d+)\s*(min|minute|minutes)/);
  if (timeMatch) {
    filters.maxTime = parseInt(timeMatch[1]);
  }
  if (lower.includes('quick') || lower.includes('fast')) {
    filters.maxTime = filters.maxTime || 30;
  }

  // Extract dietary tags
  const dietaryTags = ['vegetarian', 'vegan', 'gluten-free', 'keto', 'paleo', 'dairy-free', 'low-carb', 'healthy'];
  const matchedTags = dietaryTags.filter(tag => lower.includes(tag));
  if (matchedTags.length) filters.tags = matchedTags;

  // Extract food keywords (remove common words)
  const stopWords = ['i', 'want', 'need', 'make', 'cook', 'find', 'me', 'a', 'an', 'the', 'with', 'that', 'is', 'are', 'some',
    'can', 'you', 'recipe', 'recipes', 'for', 'using', 'have', 'something', 'like', 'how', 'to', 'do', 'what', 'please',
    'looking', 'search', 'suggest', 'recommend', 'show', 'give', ...cuisines, ...dietaryTags, 'easy', 'simple', 'hard', 'quick', 'fast', 'min', 'minute', 'minutes'];

  const keywords = lower
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.includes(w));

  filters.q = keywords.join(' ');

  return filters;
}

export const chatbotService = {
  async ask(message: string, _history: ChatMessage[] = []) {
    const filters = parseIntent(message);

    // Search recipes with parsed filters
    const results = await searchService.search({
      ...filters,
      limit: 5,
    });

    // Format response
    if (results.recipes.length === 0) {
      return {
        reply: `I couldn't find recipes matching your request. Try being more specific about ingredients, cuisine, or dish type! 🍳`,
        recipes: [],
        filters,
      };
    }

    const recipeList = results.recipes
      .map((r, i) => {
        const time = (r.prepTime || 0) + (r.cookTime || 0);
        const timeStr = time > 0 ? ` (${time} min)` : '';
        const rating = r.averageRating > 0 ? ` ⭐ ${r.averageRating.toFixed(1)}` : '';
        return `${i + 1}. **${r.title}**${timeStr}${rating} — by ${r.author.name}`;
      })
      .join('\n');

    let intro = `Here are some recipes I found for you! 🎉\n\n`;
    if (filters.cuisine) intro = `Here are some ${filters.cuisine} recipes for you! 🎉\n\n`;
    if (filters.difficulty === 'EASY') intro = `Here are some easy recipes to try! 🎉\n\n`;
    if (filters.maxTime) intro = `Here are some quick recipes (under ${filters.maxTime} min)! ⏱️\n\n`;

    return {
      reply: `${intro}${recipeList}\n\nWould you like more details about any of these recipes? Just ask! 😊`,
      recipes: results.recipes.map(r => ({ id: r.id, title: r.title })),
      filters,
    };
  },
};
