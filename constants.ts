/**
 * @file Contains constant data for the application.
 */

import { IngredientInfo } from './types';

/**
 * A comprehensive list of all possible ingredients available in the app.
 * Each ingredient is mapped to a specific category for logical grouping and processing.
 * This list is used for populating dropdowns in the recipe editor and for the AI parsing model.
 */
export const ALL_INGREDIENTS: IngredientInfo[] = [
  { name: 'White Flour', category: 'Flour' },
  { name: 'Whole Wheat Flour', category: 'Flour' },
  { name: 'Other Flour', category: 'Flour' },
  { name: 'Water', category: 'Liquid' },
  { name: 'Milk', category: 'Liquid' },
  { name: 'Buttermilk', category: 'Liquid' },
  { name: 'Sourdough Levain', category: 'Leavening' },
  { name: 'Fresh Yeast', category: 'Leavening' },
  { name: 'Dried Yeast', category: 'Leavening' },
  { name: 'Salt', category: 'Flavor' },
  { name: 'Sugar / Honey / Malt', category: 'Flavor' },
  { name: 'Diastatic Malt Powder', category: 'Enrichment' },
  { name: 'Butter or Oil', category: 'Enrichment' },
  { name: 'Inclusion 1', category: 'Inclusion' },
  { name: 'Inclusion 2', category: 'Inclusion' },
];
