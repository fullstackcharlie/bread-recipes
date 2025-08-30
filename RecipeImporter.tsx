

import React, { useState } from 'react';
import { parseRecipeFromText } from '../services/geminiService';
import { Recipe } from '../types';

interface RecipeImporterProps {
  onImportSuccess: (recipe: Omit<Recipe, 'id' | 'isStandard'>) => void;
  onBack: () => void;
}

export const RecipeImporter: React.FC<RecipeImporterProps> = ({ onImportSuccess, onBack }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!text.trim()) {
      setError('Please paste recipe text.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const newRecipe = await parseRecipeFromText(text);
      onImportSuccess(newRecipe);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <button onClick={onBack} className="mb-4 text-amber-700 hover:text-amber-900 font-semibold">&larr; Back to Library</button>
      <div className="bg-white rounded-lg shadow-lg p-8 border border-amber-200">
        <h1 className="text-3xl font-bold text-amber-900 mb-2">Import Recipe with AI</h1>
        <p className="text-gray-600 mb-6">Paste a bread recipe below, and our AI will convert it into the calculator format.</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., 900g Bread Flour, 100g Whole Wheat Flour, 750g Water, 200g Levain, 22g Salt..."
          className="w-full h-64 p-4 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 transition text-gray-900 placeholder-gray-500"
          disabled={isLoading}
        />
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleImport}
            disabled={isLoading}
            className="px-6 py-3 bg-amber-600 text-white font-bold rounded-md hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Importing...
              </>
            ) : (
              'Import Recipe'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};