/**
 * @file Manages interactions with the Google Gemini API for AI-powered features.
 */

import { GoogleGenAI, Type } from '@google/genai';
import { Recipe, NutritionInfo } from '../types';
import { ALL_INGREDIENTS } from '../constants';

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

/**
 * Lazily initializes and returns the GoogleGenAI client instance.
 * Throws an error if the API key is not configured.
 * @returns {GoogleGenAI} The initialized GoogleGenAI client.
 * @throws {Error} If the API_KEY environment variable is not set.
 */
const getGeminiClient = (): GoogleGenAI => {
  if (ai) {
    return ai;
  }
  if (!API_KEY) {
    console.error("Gemini API key is not configured. Please set the API_KEY environment variable.");
    throw new Error("AI features are disabled. API key is missing.");
  }
  ai = new GoogleGenAI({ apiKey: API_KEY });
  return ai;
};

const validIngredientNames = ALL_INGREDIENTS.map(i => i.name);

/**
 * Parses a recipe from a string of text using the Gemini AI model.
 * @param {string} text - The unstructured recipe text to be parsed.
 * @returns {Promise<Omit<Recipe, 'id' | 'isStandard'>>} A promise that resolves to a structured recipe object.
 * @throws {Error} If the AI model fails to parse the text or if the API key is not configured.
 */
export const parseRecipeFromText = async (text: string): Promise<Omit<Recipe, 'id' | 'isStandard'>> => {
  const client = getGeminiClient();

  const prompt = `
    You are an expert baker's assistant. Your task is to analyze the provided text of a bread recipe and convert it into a structured JSON format.

    Follow these instructions carefully:
    1.  Identify the recipe's name and create a concise, one-sentence description.
    2.  Identify all ingredients and their amounts in grams.
    3.  Calculate the TOTAL FLOUR WEIGHT in grams. This is the sum of all flour types (e.g., White Flour, Whole Wheat Flour, Other Flour). This value is crucial.
    4.  For EACH ingredient, calculate its baker's percentage relative to the TOTAL FLOUR WEIGHT. The formula is: (Ingredient Weight / Total Flour Weight) * 100.
    5.  Map each identified ingredient to one of the following exact names: ${validIngredientNames.join(', ')}. If an ingredient like 'rye flour' or 'spelt flour' is found, map it to 'Other Flour'. If olive oil is found, map it to 'Butter or Oil'. If honey or malt syrup is found, map it to 'Sugar / Honey / Malt'. If walnuts or seeds are found, map them to 'Inclusion 1' or 'Inclusion 2'.
    6.  The sum of the percentages for 'White Flour', 'Whole Wheat Flour', and 'Other Flour' must equal 100. Adjust them proportionally if your initial calculation differs slightly.
    7.  Return a single JSON object that strictly adheres to the provided schema. Do not include any ingredients with a percentage of 0.

    Here is the recipe text to parse:
    ---
    ${text}
    ---
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'The name of the bread recipe.' },
            description: { type: Type.STRING, description: 'A short, one-sentence description of the bread.' },
            totalFlourGrams: { type: Type.NUMBER, description: 'The total weight of all flours in grams.' },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'The ingredient name from the allowed list.' },
                  percentage: { type: Type.NUMBER, description: "The ingredient's baker's percentage." },
                },
                required: ['name', 'percentage'],
              },
            },
          },
          required: ['name', 'description', 'totalFlourGrams', 'ingredients'],
        },
      },
    });

    const jsonString = response.text;
    const parsedRecipe = JSON.parse(jsonString) as Omit<Recipe, 'id' | 'isStandard'>;

    // Validate the structure of the parsed recipe
    if (!parsedRecipe.name || typeof parsedRecipe.totalFlourGrams !== 'number' || !Array.isArray(parsedRecipe.ingredients)) {
        throw new Error("AI model returned a response with an invalid format.");
    }

    return parsedRecipe;

  } catch (error) {
    console.error("Error parsing recipe with Gemini API:", error);
    // Provide a more user-friendly error message
    throw new Error("Failed to parse recipe. The AI model could not understand the provided text or an API error occurred. Please try again with a clearer recipe format.");
  }
};

/**
 * Calculates nutritional information for a given recipe and serving size using the Gemini AI model.
 * @param {Recipe} recipe - The recipe object containing ingredients and weights.
 * @param {number} servingSizeGrams - The desired serving size in grams for the calculation.
 * @returns {Promise<NutritionInfo>} A promise that resolves to the structured nutritional information.
 * @throws {Error} If the AI model fails to calculate or if the API key is not configured.
 */
export const getNutritionalInformation = async (recipe: Recipe, servingSizeGrams: number): Promise<NutritionInfo> => {
  const client = getGeminiClient();

  const ingredientsInGrams = recipe.ingredients.map(ing => ({
    name: ing.name,
    grams: (ing.percentage / 100) * recipe.totalFlourGrams,
  }));

  const totalDoughWeight = ingredientsInGrams.reduce((acc, ing) => acc + ing.grams, 0);

  const prompt = `
    You are an expert nutritionist's assistant. Your task is to calculate the nutritional information for a single serving of baked bread based on its recipe.

    Follow these critical instructions:
    1.  The provided recipe is for the raw dough. During baking, assume a **20% reduction in water weight** due to evaporation. All other ingredient weights remain the same.
    2.  Calculate the nutritional values (calories, protein, fat, carbohydrates, fiber) for the **entire baked loaf** first.
    3.  Then, based on the total baked loaf weight, calculate the nutritional information for a single serving of **${servingSizeGrams}g**.
    4.  Provide the final values for the ${servingSizeGrams}g serving.
    5.  Return a single JSON object that strictly adheres to the provided schema. The values should be numbers.

    Here is the recipe for the raw dough:
    ---
    ${ingredientsInGrams.map(i => `${i.name}: ${i.grams.toFixed(1)}g`).join('\n')}
    ---
    Total raw dough weight: ${totalDoughWeight.toFixed(1)}g
    Desired serving size: ${servingSizeGrams}g
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.NUMBER, description: 'Total calories for the serving size.' },
            proteinGrams: { type: Type.NUMBER, description: 'Grams of protein for the serving size.' },
            fatGrams: { type: Type.NUMBER, description: 'Grams of fat for the serving size.' },
            carbohydrateGrams: { type: Type.NUMBER, description: 'Grams of carbohydrates for the serving size.' },
            fiberGrams: { type: Type.NUMBER, description: 'Grams of fiber for the serving size.' },
          },
          required: ['calories', 'proteinGrams', 'fatGrams', 'carbohydrateGrams', 'fiberGrams'],
        },
      },
    });

    const jsonString = response.text;
    const nutritionalInfo = JSON.parse(jsonString) as NutritionInfo;

    if (
        typeof nutritionalInfo.calories !== 'number' ||
        typeof nutritionalInfo.proteinGrams !== 'number' ||
        typeof nutritionalInfo.fatGrams !== 'number' ||
        typeof nutritionalInfo.carbohydrateGrams !== 'number' ||
        typeof nutritionalInfo.fiberGrams !== 'number'
    ) {
        throw new Error("AI model returned nutritional data with an invalid format.");
    }

    return nutritionalInfo;

  } catch (error) {
    console.error("Error fetching nutritional information with Gemini API:", error);
    throw new Error("Failed to calculate nutrition. The AI model could not process the recipe or an API error occurred.");
  }
};
