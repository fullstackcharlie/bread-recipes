

import { Recipe } from '../types';

export const standardRecipes: Recipe[] = [
  {
    id: 'std-1',
    name: 'Artisanal Sourdough',
    description: 'A classic, open-crumb sourdough with a crispy crust. Perfect for toast or sandwiches.',
    totalFlourGrams: 1000,
    isStandard: true,
    ingredients: [
      { name: 'White Flour', percentage: 90 },
      { name: 'Whole Wheat Flour', percentage: 10 },
      { name: 'Water', percentage: 75 },
      { name: 'Sourdough Levain', percentage: 20 },
      { name: 'Salt', percentage: 2.2 },
    ],
  },
  {
    id: 'std-2',
    name: 'Hearty Rye Bread',
    description: 'A dense and flavorful rye bread with a tight crumb, great for savory toppings.',
    totalFlourGrams: 1000,
    isStandard: true,
    ingredients: [
      { name: 'White Flour', percentage: 50 },
      { name: 'Other Flour', percentage: 50 }, // Represents Rye Flour
      { name: 'Water', percentage: 80 },
      { name: 'Sourdough Levain', percentage: 30 },
      { name: 'Salt', percentage: 2 },
      { name: 'Sugar / Honey / Malt', percentage: 3 },
    ],
  },
  {
    id: 'std-3',
    name: 'Soft Sandwich Sourdough',
    description: 'A softer sourdough loaf enriched with milk and butter, ideal for sandwiches.',
    totalFlourGrams: 900,
    isStandard: true,
    ingredients: [
      { name: 'White Flour', percentage: 100 },
      { name: 'Milk', percentage: 65 },
      { name: 'Sourdough Levain', percentage: 25 },
      { name: 'Salt', percentage: 2 },
      { name: 'Sugar / Honey / Malt', percentage: 5 },
      { name: 'Butter or Oil', percentage: 8 },
    ],
  },
  {
    id: 'std-4',
    name: 'Sourdough Pizza Base',
    description: 'A tangy and chewy pizza crust with great flavor development from sourdough.',
    totalFlourGrams: 500,
    isStandard: true,
    ingredients: [
      { name: 'White Flour', percentage: 100 },
      { name: 'Water', percentage: 68 },
      { name: 'Sourdough Levain', percentage: 15 },
      { name: 'Salt', percentage: 2.5 },
      { name: 'Butter or Oil', percentage: 3 }, // Represents Olive Oil
    ],
  },
];
