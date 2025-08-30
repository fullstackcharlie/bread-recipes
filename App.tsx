import React, { useState, useEffect, useCallback } from 'react';
import { Recipe, User } from './types';
import { Header } from './components/Header';
import { RecipeListItem } from './components/RecipeListItem';
import { RecipeView } from './components/RecipeView';
import { RecipeImporter } from './components/RecipeImporter';
import { standardRecipes } from './data/standardRecipes';

type View = 'library' | 'recipe' | 'importer';

// HACK: Define the google object from the GSI script
declare const google: any;

const App: React.FC = () => {
    const [view, setView] = useState<View>('library');
    const [recipes, setRecipes] = useState<Recipe[]>([...standardRecipes]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [user, setUser] = useState<User | null>(null);

    const handleCredentialResponse = useCallback((response: any) => {
        // Decode the JWT token to get user info
        const token = response.credential;
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentUser: User = {
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
        };
        setUser(currentUser);
        // Hide the button after login
        const buttonDiv = document.getElementById('google-signin-button');
        if (buttonDiv) buttonDiv.hidden = true;
    }, []);
    
    const handleLogout = useCallback(() => {
        setUser(null);
        google.accounts.id.disableAutoSelect();
        // Show the button again after logout
        const buttonDiv = document.getElementById('google-signin-button');
        if (buttonDiv) buttonDiv.hidden = false;
    }, []);

    useEffect(() => {
        // Initialize Google Sign-In
        if (typeof google !== 'undefined') {
            google.accounts.id.initialize({
                // IMPORTANT: Replace with your actual Google Client ID from Google Cloud Console
                client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
                callback: handleCredentialResponse,
                // Use 'popup' ux_mode to avoid FedCM issues that can cause errors like "NotAllowedError".
                // This ensures a more reliable sign-in flow across different browser environments.
                ux_mode: 'popup',
            });
            google.accounts.id.renderButton(
                document.getElementById('google-signin-button'),
                { theme: 'outline', size: 'large' }
            );
            // We remove google.accounts.id.prompt() which shows the One Tap dialog automatically.
            // The automatic prompt is often the source of FedCM errors in development or iframe environments.
            // Users will now click the button to sign in.
        }
    }, [handleCredentialResponse]);

    useEffect(() => {
        if (user) {
            const savedRecipes = localStorage.getItem(`userRecipes-${user.id}`);
            const userRecipes: Recipe[] = savedRecipes ? JSON.parse(savedRecipes) : [];
            setRecipes([...standardRecipes, ...userRecipes]);
        } else {
            // When user logs out, only show standard recipes
            setRecipes([...standardRecipes]);
        }
    }, [user]);

    const saveUserRecipes = useCallback((userRecipes: Recipe[], currentUser: User | null) => {
        if (!currentUser) return;
        localStorage.setItem(`userRecipes-${currentUser.id}`, JSON.stringify(userRecipes));
    }, []);

    const handleSelectRecipe = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setView('recipe');
    };
    
    const handleBackToLibrary = () => {
        setSelectedRecipe(null);
        setView('library');
    };

    const handleSaveRecipe = useCallback((updatedRecipe: Recipe) => {
        if (!user) {
            alert("Please log in to save changes.");
            return;
        }
        const newRecipes = recipes.map(r => r.id === updatedRecipe.id ? updatedRecipe : r);
        setRecipes(newRecipes);

        const userRecipes = newRecipes.filter(r => !r.isStandard);
        saveUserRecipes(userRecipes, user);
    }, [recipes, user, saveUserRecipes]);
    
    const handleDeleteRecipe = useCallback((recipeId: string) => {
        if (!user) return;

        const newRecipes = recipes.filter(r => r.id !== recipeId);
        setRecipes(newRecipes);
        
        const userRecipes = newRecipes.filter(r => !r.isStandard);
        saveUserRecipes(userRecipes, user);

        handleBackToLibrary();
    }, [recipes, user, saveUserRecipes]);
    
    const handleImportSuccess = (importedRecipeData: Omit<Recipe, 'id' | 'isStandard'>) => {
        if (!user) {
            alert("Please log in to import and save a new recipe.");
            return;
        }
        const newRecipe: Recipe = {
            ...importedRecipeData,
            id: `user-${Date.now()}`,
            isStandard: false,
        };
        const newRecipes = [...recipes, newRecipe];
        setRecipes(newRecipes);
        
        const userRecipes = newRecipes.filter(r => !r.isStandard);
        saveUserRecipes(userRecipes, user);
        
        setSelectedRecipe(newRecipe);
        setView('recipe');
    };

    const renderContent = () => {
        switch (view) {
            case 'recipe':
                return selectedRecipe && (
                    <RecipeView 
                        recipe={selectedRecipe} 
                        onSave={handleSaveRecipe} 
                        onDelete={handleDeleteRecipe}
                        onBack={handleBackToLibrary}
                    />
                );
            case 'importer':
                return <RecipeImporter onImportSuccess={handleImportSuccess} onBack={handleBackToLibrary} />;
            case 'library':
            default:
                return (
                    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold text-gray-800">Recipe Library</h2>
                             {user && (
                                <button 
                                    onClick={() => setView('importer')} 
                                    className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-md hover:bg-amber-700 transition-colors"
                                >
                                + Import Recipe (AI)
                                </button>
                            )}
                        </div>
                         {!user && (
                            <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-6" role="alert">
                                <p className="font-bold">Welcome, Guest!</p>
                                <p>Please sign in with Google to save your own recipes or import new ones.</p>
                            </div>
                        )}
                        <div className="flex flex-col gap-4">
                            {recipes.map(recipe => (
                                <RecipeListItem key={recipe.id} recipe={recipe} onSelect={() => handleSelectRecipe(recipe)} />
                            ))}
                        </div>
                    </div>
                );
        }
    };
    
    return (
        <div className="min-h-screen bg-amber-50 text-gray-800">
            <Header user={user} onLogout={handleLogout} />
            <main>
                {renderContent()}
            </main>
        </div>
    );
};

export default App;