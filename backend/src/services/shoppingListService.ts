import prisma from '../lib/prisma';

interface ShoppingItem {
  name: string;
  quantity: number;
  unit: string;
  recipes: string[];
}

export const shoppingListService = {
  async generate(userId: string, recipeIds: string[], servingMultiplier: number = 1) {
    const recipes = await prisma.recipe.findMany({
      where: { id: { in: recipeIds } },
      include: {
        ingredients: { orderBy: { orderIndex: 'asc' } },
      },
    });

    // Aggregate ingredients by name + unit
    const itemMap = new Map<string, ShoppingItem>();

    for (const recipe of recipes) {
      const scale = servingMultiplier / (recipe.servings || 1) * (recipe.servings || 1);
      for (const ing of recipe.ingredients) {
        const key = `${ing.name.toLowerCase()}_${(ing.unit || '').toLowerCase()}`;
        const existing = itemMap.get(key);

        if (existing) {
          existing.quantity += (ing.quantity || 0) * (servingMultiplier / (recipe.servings || 1));
          if (!existing.recipes.includes(recipe.title)) {
            existing.recipes.push(recipe.title);
          }
        } else {
          itemMap.set(key, {
            name: ing.name,
            quantity: (ing.quantity || 0) * (servingMultiplier / (recipe.servings || 1)),
            unit: ing.unit || '',
            recipes: [recipe.title],
          });
        }
      }
    }

    const items = Array.from(itemMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    return { items, recipeCount: recipes.length };
  },

  formatAsText(items: ShoppingItem[]): string {
    let text = '🛒 Shopping List\n';
    text += '━'.repeat(30) + '\n\n';

    for (const item of items) {
      const qty = item.quantity > 0 ? `${Math.round(item.quantity * 100) / 100} ` : '';
      const unit = item.unit ? `${item.unit} ` : '';
      text += `☐ ${qty}${unit}${item.name}\n`;
      text += `   (for: ${item.recipes.join(', ')})\n`;
    }

    return text;
  },
};
