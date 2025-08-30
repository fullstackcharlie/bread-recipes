/**
 * @file A component to display and edit the details of a selected recipe.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Recipe, Ingredient, NutritionInfo } from '../types';
import { getNutritionalInformation } from '../services/geminiService';
import { ALL_INGREDIENTS } from '../constants';

interface RecipeViewProps {
  recipe: Recipe;
  onSave: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export const RecipeView: React.FC<RecipeViewProps> = ({ recipe, onSave, onDelete, onBack }) => {
  const [editedRecipe, setEditedRecipe] = useState<Recipe>(() => JSON.parse(JSON.stringify(recipe)));
  const [nutrition, setNutrition] = useState<NutritionInfo | null>(null);
  const [isNutritionLoading, setIsNutritionLoading] = useState(false);
  const [nutritionError, setNutritionError] = useState<string | null>(null);

  useEffect(() => {
    // When the recipe prop changes, create a deep copy and scale it to a 1000g dough weight.
    const newRecipe = JSON.parse(JSON.stringify(recipe));
    
    const totalPercentage = newRecipe.ingredients.reduce((acc: number, ing: Ingredient) => acc + ing.percentage, 0);
    
    if (totalPercentage > 0) {
        const targetDoughWeight = 1000; // Default dough weight
        newRecipe.totalFlourGrams = (targetDoughWeight / totalPercentage) * 100;
    }

    setEditedRecipe(newRecipe);
    setNutrition(null);
    setNutritionError(null);
  }, [recipe]);

  const isReadOnly = useMemo(() => recipe.isStandard, [recipe.isStandard]);
  
  const totalDoughWeight = useMemo(() => {
    const totalPercentage = editedRecipe.ingredients.reduce((acc, ing) => acc + ing.percentage, 0);
    return (totalPercentage / 100) * editedRecipe.totalFlourGrams;
  }, [editedRecipe.ingredients, editedRecipe.totalFlourGrams]);

  const hasChanges = useMemo(() => JSON.stringify(recipe) !== JSON.stringify(editedRecipe), [recipe, editedRecipe]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isReadOnly) return;
    const { name, value } = e.target;
    setEditedRecipe(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTotalDoughWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const newDoughWeight = Math.max(0, Number(e.target.value));
    const totalPercentage = editedRecipe.ingredients.reduce((acc, ing) => acc + ing.percentage, 0);

    if (totalPercentage > 0) {
        const newTotalFlourGrams = (newDoughWeight / totalPercentage) * 100;
        setEditedRecipe(prev => ({
            ...prev,
            totalFlourGrams: newTotalFlourGrams,
        }));
    }
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    if (isReadOnly) return;
    const newIngredients = [...editedRecipe.ingredients];
    const newIngredient = { ...newIngredients[index] };
    if (field === 'percentage') {
      newIngredient.percentage = Math.max(0, Number(value));
    } else if (field === 'name') {
      newIngredient.name = String(value);
    }
    newIngredients[index] = newIngredient;
    setEditedRecipe(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    if (isReadOnly) return;
    const newIngredient: Ingredient = { name: 'Water', percentage: 0 };
    setEditedRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient],
    }));
  };

  const removeIngredient = (index: number) => {
    if (isReadOnly) return;
    setEditedRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    onSave(editedRecipe);
    alert('Recipe saved!');
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${recipe.name}"? This action cannot be undone.`)) {
      onDelete(recipe.id);
    }
  };

  const handleCalculateNutrition = async () => {
    setIsNutritionLoading(true);
    setNutritionError(null);
    setNutrition(null);
    try {
      const info = await getNutritionalInformation(editedRecipe, 100); // 100g serving size
      setNutrition(info);
    } catch (err) {
      if (err instanceof Error) {
        setNutritionError(err.message);
      } else {
        setNutritionError("An unknown error occurred.");
      }
    } finally {
      setIsNutritionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <button onClick={onBack} className="mb-4 text-amber-700 hover:text-amber-900 font-semibold">&larr; Back to Library</button>
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border border-amber-200">
        <div className="flex justify-between items-start mb-2">
          <input
            type="text"
            name="name"
            value={editedRecipe.name}
            onChange={handleChange}
            disabled={isReadOnly}
            className={`text-3xl font-bold text-amber-900 bg-transparent focus:outline-none w-full ${!isReadOnly ? 'border-b-2 border-transparent focus:border-amber-500' : ''}`}
            placeholder="Recipe Name"
          />
          {recipe.isStandard && (
            <span className="text-sm font-semibold bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full whitespace-nowrap ml-4">
              STANDARD
            </span>
          )}
        </div>
        <textarea
          name="description"
          value={editedRecipe.description}
          onChange={handleChange}
          disabled={isReadOnly}
          rows={2}
          className={`text-gray-700 placeholder-gray-500 mb-6 bg-transparent w-full resize-none focus:outline-none ${!isReadOnly ? 'p-2 border border-gray-200 rounded-md focus:border-amber-500' : 'p-2'}`}
          placeholder="A short description of the recipe..."
        />

        <div className="my-8 p-4 bg-amber-50 rounded-lg">
          <label htmlFor="totalDoughWeight" className="block text-lg font-bold text-amber-900 mb-2">Total Dough Weight (g)</label>
          <input
            type="number"
            id="totalDoughWeight"
            name="totalDoughWeight"
            value={totalDoughWeight > 0 ? totalDoughWeight.toFixed(0) : ''}
            onChange={handleTotalDoughWeightChange}
            disabled={isReadOnly}
            className="w-full sm:w-64 p-3 border border-gray-300 rounded-md shadow-sm text-lg text-gray-900 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:text-gray-500"
            aria-label="Total Dough Weight in grams"
          />
           <p className="text-sm text-gray-600 mt-2">
            Adjust this weight to scale the entire recipe. Total flour is automatically calculated: {editedRecipe.totalFlourGrams.toFixed(1)}g.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-amber-200">
            <thead className="bg-amber-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-amber-800 uppercase tracking-wider">Ingredient</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-amber-800 uppercase tracking-wider">Baker's %</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-amber-800 uppercase tracking-wider">Weight (g)</th>
                {!isReadOnly && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Remove</span></th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {editedRecipe.ingredients.map((ing, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {isReadOnly ? ing.name : (
                      <select value={ing.name} onChange={(e) => handleIngredientChange(index, 'name', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-gray-900">
                        {ALL_INGREDIENTS.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={ing.percentage}
                      onChange={(e) => handleIngredientChange(index, 'percentage', e.target.value)}
                      disabled={isReadOnly}
                      className="w-24 p-2 border border-gray-300 rounded-md text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800 text-sm">
                    {((ing.percentage / 100) * editedRecipe.totalFlourGrams).toFixed(1)}
                  </td>
                  {!isReadOnly && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => removeIngredient(index)} className="text-red-600 hover:text-red-900">Remove</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!isReadOnly && (
          <button onClick={addIngredient} className="mt-4 px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
            + Add Ingredient
          </button>
        )}

        <div className="mt-8 pt-6 border-t border-amber-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-4">
            {!isReadOnly && (
              <>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className="px-6 py-2 bg-amber-600 text-white font-bold rounded-md hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
          <button
            onClick={handleCalculateNutrition}
            disabled={isNutritionLoading}
            className="px-5 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {isNutritionLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating...
              </>
            ) : 'Calculate Nutrition (AI)'}
          </button>
        </div>
        
        {nutritionError && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md" role="alert">
            <strong className="font-bold">Nutrition Error: </strong>
            <span>{nutritionError}</span>
          </div>
        )}

        {nutrition && (
          <div className="mt-6 p-4 border border-sky-200 bg-sky-50 rounded-lg">
            <h3 className="text-lg font-bold text-sky-800 mb-2">Nutritional Information (per 100g serving)</h3>
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 text-sm">
              <li><strong>Calories:</strong> {nutrition.calories.toFixed(0)}</li>
              <li><strong>Protein:</strong> {nutrition.proteinGrams.toFixed(1)}g</li>
              <li><strong>Fat:</strong> {nutrition.fatGrams.toFixed(1)}g</li>
              <li><strong>Carbs:</strong> {nutrition.carbohydrateGrams.toFixed(1)}g</li>
              <li><strong>Fiber:</strong> {nutrition.fiberGrams.toFixed(1)}g</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
