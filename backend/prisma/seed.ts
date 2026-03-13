import { PrismaClient, Difficulty, RecipeStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ─── Create Users ──────────────────────────────────

  const passwordHash = await bcrypt.hash('password123', 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@recipeshare.app' },
      update: {},
      create: {
        email: 'admin@recipeshare.app',
        passwordHash,
        name: 'Admin Chef',
        bio: 'Platform administrator and head chef',
        role: 'ADMIN',
        emailVerified: true,
        location: 'New York, NY',
      },
    }),
    prisma.user.upsert({
      where: { email: 'priya@example.com' },
      update: {},
      create: {
        email: 'priya@example.com',
        passwordHash,
        name: 'Priya Sharma',
        bio: 'Home cook specializing in Indian and fusion cuisine 🇮🇳',
        emailVerified: true,
        location: 'Mumbai, India',
      },
    }),
    prisma.user.upsert({
      where: { email: 'marco@example.com' },
      update: {},
      create: {
        email: 'marco@example.com',
        passwordHash,
        name: 'Marco Rossi',
        bio: 'Italian culinary enthusiast. Pasta is life! 🍝',
        emailVerified: true,
        location: 'Rome, Italy',
      },
    }),
    prisma.user.upsert({
      where: { email: 'sarah@example.com' },
      update: {},
      create: {
        email: 'sarah@example.com',
        passwordHash,
        name: 'Sarah Chen',
        bio: 'Pastry chef & food photographer 📸🧁',
        emailVerified: true,
        location: 'San Francisco, CA',
      },
    }),
    prisma.user.upsert({
      where: { email: 'james@example.com' },
      update: {},
      create: {
        email: 'james@example.com',
        passwordHash,
        name: 'James Williams',
        bio: 'BBQ master and comfort food lover 🔥',
        emailVerified: true,
        location: 'Austin, TX',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // ─── Create Categories ─────────────────────────────

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'breakfast' },
      update: {},
      create: { name: 'Breakfast', slug: 'breakfast', icon: '🌅' },
    }),
    prisma.category.upsert({
      where: { slug: 'lunch' },
      update: {},
      create: { name: 'Lunch', slug: 'lunch', icon: '🥪' },
    }),
    prisma.category.upsert({
      where: { slug: 'dinner' },
      update: {},
      create: { name: 'Dinner', slug: 'dinner', icon: '🍽️' },
    }),
    prisma.category.upsert({
      where: { slug: 'desserts' },
      update: {},
      create: { name: 'Desserts', slug: 'desserts', icon: '🍰' },
    }),
    prisma.category.upsert({
      where: { slug: 'appetizers' },
      update: {},
      create: { name: 'Appetizers', slug: 'appetizers', icon: '🍢' },
    }),
    prisma.category.upsert({
      where: { slug: 'soups' },
      update: {},
      create: { name: 'Soups', slug: 'soups', icon: '🍜' },
    }),
    prisma.category.upsert({
      where: { slug: 'salads' },
      update: {},
      create: { name: 'Salads', slug: 'salads', icon: '🥗' },
    }),
    prisma.category.upsert({
      where: { slug: 'drinks' },
      update: {},
      create: { name: 'Drinks', slug: 'drinks', icon: '🥤' },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // ─── Create Tags ───────────────────────────────────

  const tagNames = [
    'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto',
    'low-carb', 'healthy', 'quick', 'comfort-food', 'spicy',
    'family-friendly', 'meal-prep', 'budget-friendly', 'high-protein',
  ];

  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  console.log(`✅ Created ${tags.length} tags`);

  // ─── Create Recipes ────────────────────────────────

  const recipes = [
    {
      authorId: users[1].id, // Priya
      title: 'Butter Chicken (Murgh Makhani)',
      description: 'Rich, creamy, and absolutely delicious — this authentic butter chicken recipe brings the flavors of North India right to your kitchen.',
      prepTime: 30,
      cookTime: 45,
      servings: 4,
      difficulty: 'MEDIUM' as Difficulty,
      cuisine: 'Indian',
      status: 'PUBLISHED' as RecipeStatus,
      ingredients: [
        { name: 'Chicken thighs', quantity: 800, unit: 'g', orderIndex: 0 },
        { name: 'Yogurt', quantity: 1, unit: 'cup', orderIndex: 1 },
        { name: 'Garam masala', quantity: 2, unit: 'tsp', orderIndex: 2 },
        { name: 'Turmeric', quantity: 1, unit: 'tsp', orderIndex: 3 },
        { name: 'Butter', quantity: 4, unit: 'tbsp', orderIndex: 4 },
        { name: 'Tomato puree', quantity: 2, unit: 'cups', orderIndex: 5 },
        { name: 'Heavy cream', quantity: 1, unit: 'cup', orderIndex: 6 },
        { name: 'Kasuri methi', quantity: 1, unit: 'tbsp', orderIndex: 7 },
        { name: 'Garlic cloves', quantity: 6, unit: 'pieces', orderIndex: 8 },
        { name: 'Ginger', quantity: 2, unit: 'inch', orderIndex: 9 },
      ],
      steps: [
        { instruction: 'Marinate chicken in yogurt, garam masala, turmeric, salt, and lemon juice for at least 1 hour.', timerMinutes: 60, orderIndex: 0 },
        { instruction: 'Grill or pan-sear the marinated chicken until charred and cooked through.', timerMinutes: 15, orderIndex: 1 },
        { instruction: 'In a large pan, melt butter. Add garlic and ginger, sauté until fragrant.', timerMinutes: 3, orderIndex: 2 },
        { instruction: 'Add tomato puree and simmer for 15 minutes until the sauce thickens.', timerMinutes: 15, orderIndex: 3 },
        { instruction: 'Stir in heavy cream and kasuri methi. Add the cooked chicken.', orderIndex: 4 },
        { instruction: 'Simmer for 10 minutes. Season with salt and serve with naan or rice.', timerMinutes: 10, orderIndex: 5 },
      ],
      tags: ['comfort-food', 'spicy'],
    },
    {
      authorId: users[2].id, // Marco
      title: 'Classic Carbonara',
      description: 'A true Roman carbonara — no cream! Just eggs, guanciale, pecorino, and perfectly cooked pasta.',
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      difficulty: 'MEDIUM' as Difficulty,
      cuisine: 'Italian',
      status: 'PUBLISHED' as RecipeStatus,
      ingredients: [
        { name: 'Spaghetti', quantity: 400, unit: 'g', orderIndex: 0 },
        { name: 'Guanciale', quantity: 200, unit: 'g', orderIndex: 1 },
        { name: 'Egg yolks', quantity: 6, unit: 'pieces', orderIndex: 2 },
        { name: 'Pecorino Romano', quantity: 100, unit: 'g', orderIndex: 3 },
        { name: 'Black pepper', quantity: 2, unit: 'tsp', orderIndex: 4 },
      ],
      steps: [
        { instruction: 'Bring a large pot of salted water to a boil. Cook spaghetti until al dente.', timerMinutes: 10, orderIndex: 0 },
        { instruction: 'While pasta cooks, cut guanciale into small strips and cook in a cold pan over medium heat until crispy.', timerMinutes: 8, orderIndex: 1 },
        { instruction: 'In a bowl, whisk together egg yolks, grated pecorino, and generous black pepper.', orderIndex: 2 },
        { instruction: 'Drain pasta, reserving 1 cup pasta water. Add pasta to the guanciale pan OFF the heat.', orderIndex: 3 },
        { instruction: 'Pour the egg mixture over the pasta, tossing quickly. Add pasta water as needed for a creamy sauce.', orderIndex: 4 },
        { instruction: 'Serve immediately with extra pecorino and black pepper.', orderIndex: 5 },
      ],
      tags: ['comfort-food', 'quick'],
    },
    {
      authorId: users[3].id, // Sarah
      title: 'Matcha Tiramisu',
      description: 'A Japanese-Italian fusion dessert that combines the earthy elegance of matcha with the classic structure of tiramisu.',
      prepTime: 30,
      cookTime: 0,
      servings: 8,
      difficulty: 'MEDIUM' as Difficulty,
      cuisine: 'Japanese-Italian Fusion',
      status: 'PUBLISHED' as RecipeStatus,
      ingredients: [
        { name: 'Mascarpone cheese', quantity: 500, unit: 'g', orderIndex: 0 },
        { name: 'Heavy cream', quantity: 1.5, unit: 'cups', orderIndex: 1 },
        { name: 'Sugar', quantity: 0.75, unit: 'cup', orderIndex: 2 },
        { name: 'Matcha powder', quantity: 3, unit: 'tbsp', orderIndex: 3 },
        { name: 'Ladyfinger biscuits', quantity: 24, unit: 'pieces', orderIndex: 4 },
        { name: 'Egg yolks', quantity: 4, unit: 'pieces', orderIndex: 5 },
        { name: 'Vanilla extract', quantity: 1, unit: 'tsp', orderIndex: 6 },
      ],
      steps: [
        { instruction: 'Dissolve 2 tbsp matcha in 1 cup warm water. Let cool completely.', orderIndex: 0 },
        { instruction: 'Whisk egg yolks and sugar until pale and thick. Fold in mascarpone.', orderIndex: 1 },
        { instruction: 'In a separate bowl, whip heavy cream to stiff peaks. Fold into mascarpone mixture.', orderIndex: 2 },
        { instruction: 'Briefly dip ladyfingers in the matcha liquid and layer in a 9x13 dish.', orderIndex: 3 },
        { instruction: 'Spread half the mascarpone mixture. Repeat layers.', orderIndex: 4 },
        { instruction: 'Refrigerate for at least 4 hours. Dust with remaining matcha before serving.', timerMinutes: 240, orderIndex: 5 },
      ],
      tags: ['vegetarian'],
    },
    {
      authorId: users[4].id, // James
      title: 'Texas-Style Smoked Brisket',
      description: 'Low and slow smoked brisket with a simple salt-and-pepper rub. This is BBQ at its finest.',
      prepTime: 30,
      cookTime: 720,
      servings: 12,
      difficulty: 'HARD' as Difficulty,
      cuisine: 'American',
      status: 'PUBLISHED' as RecipeStatus,
      ingredients: [
        { name: 'Whole beef brisket', quantity: 5, unit: 'kg', orderIndex: 0 },
        { name: 'Coarse black pepper', quantity: 4, unit: 'tbsp', orderIndex: 1 },
        { name: 'Kosher salt', quantity: 4, unit: 'tbsp', orderIndex: 2 },
        { name: 'Garlic powder', quantity: 1, unit: 'tbsp', orderIndex: 3 },
        { name: 'Oak or mesquite wood', quantity: 4, unit: 'chunks', orderIndex: 4 },
      ],
      steps: [
        { instruction: 'Trim brisket fat to ¼ inch thickness. Remove any hard fat pockets.', orderIndex: 0 },
        { instruction: 'Mix pepper, salt, and garlic powder. Apply liberally to all surfaces.', orderIndex: 1 },
        { instruction: 'Set up smoker to 225°F (107°C). Add wood chunks for smoke.', orderIndex: 2 },
        { instruction: 'Place brisket fat-side up. Smoke for 6-8 hours until internal temp reaches 165°F.', timerMinutes: 420, orderIndex: 3 },
        { instruction: 'Wrap tightly in butcher paper. Return to smoker.', orderIndex: 4 },
        { instruction: 'Continue smoking until internal temp reaches 203°F. Rest for at least 1 hour before slicing.', timerMinutes: 180, orderIndex: 5 },
      ],
      tags: ['comfort-food'],
    },
    {
      authorId: users[1].id, // Priya
      title: 'Masala Dosa with Coconut Chutney',
      description: 'Crispy fermented rice-and-lentil crepes stuffed with spiced potatoes. A South Indian masterpiece.',
      prepTime: 480,
      cookTime: 30,
      servings: 6,
      difficulty: 'HARD' as Difficulty,
      cuisine: 'Indian',
      status: 'PUBLISHED' as RecipeStatus,
      ingredients: [
        { name: 'Rice', quantity: 3, unit: 'cups', orderIndex: 0 },
        { name: 'Urad dal', quantity: 1, unit: 'cup', orderIndex: 1 },
        { name: 'Fenugreek seeds', quantity: 1, unit: 'tsp', orderIndex: 2 },
        { name: 'Potatoes', quantity: 4, unit: 'large', orderIndex: 3 },
        { name: 'Onions', quantity: 2, unit: 'medium', orderIndex: 4 },
        { name: 'Mustard seeds', quantity: 1, unit: 'tsp', orderIndex: 5 },
        { name: 'Curry leaves', quantity: 10, unit: 'pieces', orderIndex: 6 },
        { name: 'Turmeric', quantity: 0.5, unit: 'tsp', orderIndex: 7 },
        { name: 'Fresh grated coconut', quantity: 1, unit: 'cup', orderIndex: 8 },
        { name: 'Green chillies', quantity: 3, unit: 'pieces', orderIndex: 9 },
      ],
      steps: [
        { instruction: 'Soak rice and urad dal separately for 4-6 hours. Grind to a smooth batter.', timerMinutes: 360, orderIndex: 0 },
        { instruction: 'Let batter ferment overnight (8-12 hours) in a warm place.', timerMinutes: 480, orderIndex: 1 },
        { instruction: 'For filling: boil and mash potatoes. Temper mustard seeds, curry leaves, onions, and turmeric. Mix with potatoes.', orderIndex: 2 },
        { instruction: 'For chutney: blend coconut, green chillies, and salt with water.', orderIndex: 3 },
        { instruction: 'Heat a flat griddle (tava). Pour a ladle of batter and spread thin in a circular motion.', orderIndex: 4 },
        { instruction: 'Drizzle oil around edges. When crispy, place potato filling in center, fold, and serve with chutney.', orderIndex: 5 },
      ],
      tags: ['vegetarian', 'vegan', 'gluten-free'],
    },
    {
      authorId: users[3].id, // Sarah
      title: 'Fluffy Japanese Soufflé Pancakes',
      description: 'Cloud-like, jiggly pancakes that melt in your mouth. A viral popular Japanese café style treated!',
      prepTime: 15,
      cookTime: 20,
      servings: 2,
      difficulty: 'MEDIUM' as Difficulty,
      cuisine: 'Japanese',
      status: 'PUBLISHED' as RecipeStatus,
      ingredients: [
        { name: 'Egg yolks', quantity: 2, unit: 'pieces', orderIndex: 0 },
        { name: 'Egg whites', quantity: 3, unit: 'pieces', orderIndex: 1 },
        { name: 'All-purpose flour', quantity: 0.25, unit: 'cup', orderIndex: 2 },
        { name: 'Sugar', quantity: 2, unit: 'tbsp', orderIndex: 3 },
        { name: 'Milk', quantity: 2, unit: 'tbsp', orderIndex: 4 },
        { name: 'Vanilla extract', quantity: 1, unit: 'tsp', orderIndex: 5 },
        { name: 'Cream of tartar', quantity: 0.25, unit: 'tsp', orderIndex: 6 },
        { name: 'Maple syrup', quantity: 0, unit: 'for serving', orderIndex: 7 },
      ],
      steps: [
        { instruction: 'Mix egg yolks, milk, and vanilla. Sift in flour and mix until smooth.', orderIndex: 0 },
        { instruction: 'In a clean bowl, whip egg whites with cream of tartar until foamy. Gradually add sugar and beat to stiff peaks.', orderIndex: 1 },
        { instruction: 'Gently fold 1/3 of the meringue into the yolk mixture. Then fold in the rest — be very gentle!', orderIndex: 2 },
        { instruction: 'Heat a non-stick pan on the LOWEST heat. Grease with a bit of butter.', orderIndex: 3 },
        { instruction: 'Pipe or spoon tall mounds of batter. Add 1 tbsp water and cover.', orderIndex: 4 },
        { instruction: 'Cook for 6-7 minutes per side on very low heat. Serve immediately with maple syrup and whipped cream.', timerMinutes: 7, orderIndex: 5 },
      ],
      tags: ['vegetarian'],
    },
    {
      authorId: users[2].id, // Marco
      title: 'Eggplant Parmigiana',
      description: 'Layers of golden fried eggplant, rich tomato sauce, and melted mozzarella. A comfort classic from Southern Italy.',
      prepTime: 30,
      cookTime: 45,
      servings: 6,
      difficulty: 'MEDIUM' as Difficulty,
      cuisine: 'Italian',
      status: 'PUBLISHED' as RecipeStatus,
      ingredients: [
        { name: 'Large eggplants', quantity: 3, unit: 'pieces', orderIndex: 0 },
        { name: 'San Marzano tomatoes', quantity: 800, unit: 'g', orderIndex: 1 },
        { name: 'Fresh mozzarella', quantity: 400, unit: 'g', orderIndex: 2 },
        { name: 'Parmigiano Reggiano', quantity: 100, unit: 'g', orderIndex: 3 },
        { name: 'Fresh basil leaves', quantity: 20, unit: 'pieces', orderIndex: 4 },
        { name: 'All-purpose flour', quantity: 1, unit: 'cup', orderIndex: 5 },
        { name: 'Olive oil', quantity: 1, unit: 'cup', orderIndex: 6 },
      ],
      steps: [
        { instruction: 'Slice eggplants into ½-inch rounds. Salt and let drain for 30 minutes.', timerMinutes: 30, orderIndex: 0 },
        { instruction: 'Make tomato sauce: crush San Marzanos, simmer with olive oil, garlic, and basil for 20 minutes.', timerMinutes: 20, orderIndex: 1 },
        { instruction: 'Pat eggplant dry, dredge in flour, and fry in olive oil until golden on both sides.', orderIndex: 2 },
        { instruction: 'In a baking dish, layer sauce, fried eggplant, mozzarella slices, and Parmigiano. Repeat layers.', orderIndex: 3 },
        { instruction: 'Bake at 375°F (190°C) for 30-35 minutes until bubbly and golden on top.', timerMinutes: 35, orderIndex: 4 },
        { instruction: 'Let rest 10 minutes. Garnish with fresh basil before serving.', timerMinutes: 10, orderIndex: 5 },
      ],
      tags: ['vegetarian', 'comfort-food'],
    },
    {
      authorId: users[4].id, // James
      title: 'Nashville Hot Chicken Sandwich',
      description: 'Buttermilk-brined, crunchy fried chicken drenched in fiery cayenne oil. The ultimate spicy chicken sandwich.',
      prepTime: 240,
      cookTime: 20,
      servings: 4,
      difficulty: 'MEDIUM' as Difficulty,
      cuisine: 'American',
      status: 'PUBLISHED' as RecipeStatus,
      ingredients: [
        { name: 'Chicken thighs (boneless)', quantity: 4, unit: 'pieces', orderIndex: 0 },
        { name: 'Buttermilk', quantity: 2, unit: 'cups', orderIndex: 1 },
        { name: 'All-purpose flour', quantity: 2, unit: 'cups', orderIndex: 2 },
        { name: 'Cayenne pepper', quantity: 3, unit: 'tbsp', orderIndex: 3 },
        { name: 'Brown sugar', quantity: 1, unit: 'tbsp', orderIndex: 4 },
        { name: 'Paprika', quantity: 1, unit: 'tbsp', orderIndex: 5 },
        { name: 'Garlic powder', quantity: 1, unit: 'tsp', orderIndex: 6 },
        { name: 'Brioche buns', quantity: 4, unit: 'pieces', orderIndex: 7 },
        { name: 'Pickles', quantity: 0, unit: 'for serving', orderIndex: 8 },
      ],
      steps: [
        { instruction: 'Brine chicken in buttermilk, salt, and hot sauce for at least 4 hours (overnight is best).', timerMinutes: 240, orderIndex: 0 },
        { instruction: 'Mix flour with paprika, garlic powder, salt, and pepper for the breading.', orderIndex: 1 },
        { instruction: 'Remove chicken from buttermilk, dredge in flour, dip back in buttermilk, and dredge again.', orderIndex: 2 },
        { instruction: 'Deep fry at 350°F (175°C) for 6-8 minutes until golden and cooked through (165°F internal).', timerMinutes: 8, orderIndex: 3 },
        { instruction: 'Immediately brush with hot oil: mix cayenne, brown sugar, paprika, and garlic powder into hot frying oil.', orderIndex: 4 },
        { instruction: 'Serve on toasted brioche buns with pickles and coleslaw.', orderIndex: 5 },
      ],
      tags: ['spicy', 'comfort-food'],
    },
    {
      authorId: users[1].id, // Priya
      title: 'Mango Lassi Smoothie Bowl',
      description: 'A thick, creamy smoothie bowl version of the classic Indian mango lassi, topped with granola and fresh fruit.',
      prepTime: 10,
      cookTime: 0,
      servings: 2,
      difficulty: 'EASY' as Difficulty,
      cuisine: 'Indian',
      status: 'PUBLISHED' as RecipeStatus,
      ingredients: [
        { name: 'Frozen mango chunks', quantity: 2, unit: 'cups', orderIndex: 0 },
        { name: 'Greek yogurt', quantity: 1, unit: 'cup', orderIndex: 1 },
        { name: 'Honey', quantity: 2, unit: 'tbsp', orderIndex: 2 },
        { name: 'Cardamom powder', quantity: 0.25, unit: 'tsp', orderIndex: 3 },
        { name: 'Granola', quantity: 0.5, unit: 'cup', orderIndex: 4 },
        { name: 'Pistachios', quantity: 2, unit: 'tbsp', orderIndex: 5 },
      ],
      steps: [
        { instruction: 'Blend frozen mango, yogurt, honey, and cardamom until thick and smooth. Use less liquid for a bowl consistency.', orderIndex: 0 },
        { instruction: 'Pour into bowls. Top with granola, sliced fresh mango, pistachios, and a drizzle of honey.', orderIndex: 1 },
        { instruction: 'Serve immediately and enjoy! 🥭', orderIndex: 2 },
      ],
      tags: ['vegetarian', 'healthy', 'quick', 'gluten-free'],
    },
    {
      authorId: users[3].id, // Sarah
      title: 'Chocolate Lava Cakes',
      description: 'Individual chocolate cakes with irresistibly oozy molten centers. A restaurant-quality dessert in 25 minutes.',
      prepTime: 10,
      cookTime: 14,
      servings: 4,
      difficulty: 'EASY' as Difficulty,
      cuisine: 'French',
      status: 'PUBLISHED' as RecipeStatus,
      ingredients: [
        { name: 'Dark chocolate (70%)', quantity: 200, unit: 'g', orderIndex: 0 },
        { name: 'Butter', quantity: 100, unit: 'g', orderIndex: 1 },
        { name: 'Eggs', quantity: 2, unit: 'pieces', orderIndex: 2 },
        { name: 'Egg yolks', quantity: 2, unit: 'pieces', orderIndex: 3 },
        { name: 'Sugar', quantity: 0.33, unit: 'cup', orderIndex: 4 },
        { name: 'All-purpose flour', quantity: 2, unit: 'tbsp', orderIndex: 5 },
        { name: 'Vanilla extract', quantity: 1, unit: 'tsp', orderIndex: 6 },
      ],
      steps: [
        { instruction: 'Preheat oven to 425°F (220°C). Butter and flour four 6 oz ramekins.', orderIndex: 0 },
        { instruction: 'Melt chocolate and butter together (microwave 30s intervals or double boiler).', timerMinutes: 3, orderIndex: 1 },
        { instruction: 'Whisk eggs, yolks, and sugar until thick. Fold in melted chocolate and vanilla.', orderIndex: 2 },
        { instruction: 'Sift in flour and fold gently until just combined.', orderIndex: 3 },
        { instruction: 'Divide batter among ramekins. Bake for exactly 12-14 minutes — edges should be firm but center soft.', timerMinutes: 13, orderIndex: 4 },
        { instruction: 'Let cool 1 minute, then invert onto plates. Dust with powdered sugar and serve with vanilla ice cream.', timerMinutes: 1, orderIndex: 5 },
      ],
      tags: ['vegetarian', 'quick'],
    },
  ];

  for (const recipeData of recipes) {
    const { ingredients, steps, tags: recipeTags, ...data } = recipeData;

    const recipe = await prisma.recipe.create({
      data: {
        ...data,
        ingredients: { create: ingredients },
        steps: { create: steps },
        tags: {
          create: recipeTags.map((tagName) => {
            const tag = tags.find((t) => t.name === tagName);
            return { tagId: tag!.id };
          }),
        },
      },
    });

    // Create initial version
    await prisma.recipeVersion.create({
      data: {
        recipeId: recipe.id,
        version: 1,
        data: { title: recipe.title, description: recipe.description },
      },
    });
  }

  console.log(`✅ Created ${recipes.length} recipes with ingredients, steps, and tags`);

  // ─── Create some follows ───────────────────────────

  await Promise.all([
    prisma.follow.create({ data: { followerId: users[1].id, followingId: users[2].id } }),
    prisma.follow.create({ data: { followerId: users[1].id, followingId: users[3].id } }),
    prisma.follow.create({ data: { followerId: users[2].id, followingId: users[1].id } }),
    prisma.follow.create({ data: { followerId: users[3].id, followingId: users[1].id } }),
    prisma.follow.create({ data: { followerId: users[4].id, followingId: users[2].id } }),
  ]);

  console.log(`✅ Created follow relationships`);

  console.log('\n🎉 Seeding complete!\n');
  console.log('Login credentials for all users:');
  console.log('  Email: admin@recipeshare.app / priya@example.com / marco@example.com / sarah@example.com / james@example.com');
  console.log('  Password: password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
