/**
 * @file Defines the core TypeScript types and interfaces used throughout the application.
 */

/**
 * Represents the distinct categories for ingredients, used for organization and display.
 */
export type IngredientCategory = 'Flour' | 'Liquid' | 'Leavening' | 'Enrichment' | 'Flavor' | 'Inclusion';

/**
 * Defines the structure for an ingredient's static information, including its name and category.
 */
export interface IngredientInfo {
  name: string;
  category: IngredientCategory;
}

/**
 * Represents an ingredient within a specific recipe, detailing its name and baker's percentage.
 */
export interface Ingredient {
  name: string;
  percentage: number;
}

/**
 * Defines the structure for a complete bread recipe.
 */
export interface Recipe {
  /** A unique identifier for the recipe (e.g., 'std-1' or 'user-1678886400000'). */
  id: string;
  /** The name of the recipe (e.g., 'Artisanal Sourdough'). */
  name: string;
  /** A brief summary of the recipe's characteristics. */
  description: string;
  /** The total weight of all flour ingredients in grams. This is the baseline for all baker's percentages. */
  totalFlourGrams: number;
  /** An array of ingredients that make up the recipe. */
  ingredients: Ingredient[];
  /** A flag to distinguish standard, read-only recipes from user-saved, editable recipes. */
  isStandard?: boolean;
}

/**
 * Defines the structure for a logged-in user's profile information, retrieved from Google Sign-In.
 */
export interface User {
  /** The unique Google ID for the user. */
  id: string;
  /** The user's full name. */
  name: string;
  /** The user's email address. */
  email: string;
  /** A URL to the user's profile picture. */
  picture: string;
}

/**
 * Defines the structure for nutritional information of a recipe serving.
 */
export interface NutritionInfo {
  calories: number;
  proteinGrams: number;
  fatGrams: number;
  carbohydrateGrams: number;
  fiberGrams: number;
}