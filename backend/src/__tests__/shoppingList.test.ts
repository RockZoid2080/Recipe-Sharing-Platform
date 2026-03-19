import { shoppingListService } from '../services/shoppingListService';

// Mock Prisma
jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    recipe: {
      findMany: jest.fn(),
    },
  },
}));

import prisma from '../lib/prisma';

describe('ShoppingListService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generate', () => {
    it('should aggregate ingredients from multiple recipes', async () => {
      (prisma.recipe.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'r1',
          title: 'Pasta',
          servings: 4,
          ingredients: [
            { name: 'Tomatoes', quantity: 4, unit: 'pieces', orderIndex: 0 },
            { name: 'Olive oil', quantity: 2, unit: 'tbsp', orderIndex: 1 },
            { name: 'Garlic', quantity: 3, unit: 'cloves', orderIndex: 2 },
          ],
        },
        {
          id: 'r2',
          title: 'Salad',
          servings: 2,
          ingredients: [
            { name: 'Tomatoes', quantity: 2, unit: 'pieces', orderIndex: 0 },
            { name: 'Olive oil', quantity: 1, unit: 'tbsp', orderIndex: 1 },
            { name: 'Lettuce', quantity: 1, unit: 'head', orderIndex: 2 },
          ],
        },
      ]);

      const result = await shoppingListService.generate('user-1', ['r1', 'r2'], 1);

      expect(result.recipeCount).toBe(2);
      expect(result.items.length).toBe(4); // Garlic, Lettuce, Olive oil, Tomatoes (sorted)

      // Check aggregation — tomatoes should be combined
      const tomatoes = result.items.find(i => i.name === 'Tomatoes');
      expect(tomatoes).toBeDefined();
      expect(tomatoes!.recipes).toContain('Pasta');
      expect(tomatoes!.recipes).toContain('Salad');
    });

    it('should scale quantities based on serving multiplier', async () => {
      (prisma.recipe.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'r1',
          title: 'Soup',
          servings: 4,
          ingredients: [
            { name: 'Carrots', quantity: 4, unit: 'pieces', orderIndex: 0 },
          ],
        },
      ]);

      const result = await shoppingListService.generate('user-1', ['r1'], 2);

      const carrots = result.items.find(i => i.name === 'Carrots');
      expect(carrots).toBeDefined();
      expect(carrots!.quantity).toBe(2); // 4 * (2/4) = 2
    });
  });

  describe('formatAsText', () => {
    it('should format items as readable text', () => {
      const items = [
        { name: 'Tomatoes', quantity: 6, unit: 'pieces', recipes: ['Pasta', 'Salad'] },
        { name: 'Olive oil', quantity: 3, unit: 'tbsp', recipes: ['Pasta'] },
      ];

      const text = shoppingListService.formatAsText(items);

      expect(text).toContain('Shopping List');
      expect(text).toContain('Tomatoes');
      expect(text).toContain('Olive oil');
      expect(text).toContain('Pasta');
    });
  });
});
