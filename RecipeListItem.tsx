/**
 * @file A reusable UI component to display a recipe summary in a list format.
 */

import React from 'react';
import { Recipe } from '../types';
import { ALL_INGREDIENTS } from '../constants';

interface RecipeListItemProps {
  recipe: Recipe;
  onSelect: () => void;
}

// Create a lookup map for performance, so it's not regenerated on every render.
const ingredientInfoMap = new Map(ALL_INGREDIENTS.map(i => [i.name, i]));

/**
 * A list item component that displays a preview of a recipe.
 * It shows the name, status, flour types, and hydration in a single row.
 */
export const RecipeListItem: React.FC<RecipeListItemProps> = React.memo(({ recipe, onSelect }) => {
  const flourTypes = recipe.ingredients
    .filter(i => ingredientInfoMap.get(i.name)?.category === 'Flour')
    .map(i => i.name.replace(' Flour', ''))
    .join(' / ');
  
  const hydration = recipe.ingredients
    .filter(i => ingredientInfoMap.get(i.name)?.category === 'Liquid')
    .reduce((total, ing) => total + ing.percentage, 0);

  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer p-4 border border-amber-200 flex justify-between items-center"
      aria-label={`View recipe for ${recipe.name}`}
    >
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-bold text-amber-900">
          {recipe.name}
        </h3>
        {recipe.isStandard ? (
          <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-1 rounded-full whitespace-nowrap">
            STANDARD
          </span>
        ) : (
          <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full whitespace-nowrap">
            SAVED
          </span>
        )}
      </div>
      <div className="hidden sm:flex items-center gap-6 text-sm text-gray-700">
        <div>
          <span className="font-semibold text-amber-800">Flour:</span> {flourTypes || 'N/A'}
        </div>
        <div>
          <span className="font-semibold text-amber-800">Hydration:</span> {hydration.toFixed(0)}%
        </div>
      </div>
    </div>
  );
});