import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, Star, Clock, Users, ArrowLeft, Trash2, Plus, Minus, Play } from 'lucide-react';
import { recipeApi } from '../services/api';
import type { Recipe } from '../types/recipe';

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [servingsMultiplier, setServingsMultiplier] = useState(1);
  const [cookingMode, setCookingMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [recipeNotes, setRecipeNotes] = useState(() => {
    const saved = localStorage.getItem('recipeNotes');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    if (id) {
      loadRecipe();
    }
  }, [id]);

  useEffect(() => {
    localStorage.setItem('recipeNotes', JSON.stringify(recipeNotes));
  }, [recipeNotes]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      const data = await recipeApi.getById(id!);
      setRecipe(data);
    } catch (error) {
      console.error('Failed to load recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!recipe) return;
    try {
      const updated = await recipeApi.toggleFavorite(recipe.id);
      setRecipe(updated);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleToggleWishlist = async () => {
    if (!recipe) return;
    try {
      const updated = await recipeApi.toggleWishlist(recipe.id);
      setRecipe(updated);
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  const handleDelete = async () => {
    if (!recipe) return;
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
      await recipeApi.delete(recipe.id);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete recipe:', error);
    }
  };

  const addNote = (recipeId: string, note: string) => {
    setRecipeNotes((prev: any) => ({
      ...prev,
      [recipeId]: [...(prev[recipeId] || []), note],
    }));
  };

  const deleteNote = (recipeId: string, noteIndex: number) => {
    setRecipeNotes((prev: any) => ({
      ...prev,
      [recipeId]: prev[recipeId].filter((_: any, i: number) => i !== noteIndex),
    }));
  };

  const scaleQuantity = (text: string, scaleFactor: number) => {
    const match = text.match(/^([\d\/.]+)\s*(.*)$/);
    if (!match) return text;

    const [, quantityStr, rest] = match;
    let quantity = 0;

    if (quantityStr.includes('/')) {
      const [num, denom] = quantityStr.split('/').map(Number);
      quantity = num / denom;
    } else {
      quantity = parseFloat(quantityStr);
    }

    const newQty = (quantity * scaleFactor).toFixed(2).replace(/\.?0+$/, '');
    const fractionMap: Record<string, string> = {
      '0.25': '1/4',
      '0.33': '1/3',
      '0.5': '1/2',
      '0.67': '2/3',
      '0.75': '3/4',
    };

    const fraction = fractionMap[newQty] || newQty;
    return `${fraction} ${rest}`;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-claude-orange mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading recipe...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">Recipe not found</h2>
        <Link to="/" className="btn-primary">
          Back to Recipes
        </Link>
      </div>
    );
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  // Cooking Mode
  if (cookingMode && recipe.directions && recipe.directions.length > 0) {
    const currentDirection = recipe.directions[currentStep];
    const progress = ((currentStep + 1) / recipe.directions.length) * 100;

    return (
      <div className="min-h-screen cooking-mode-bg text-white flex flex-col">
        <div className="p-6 flex items-center justify-between border-b border-gray-700">
          <button
            onClick={() => setCookingMode(false)}
            className="flex items-center gap-2 text-white hover:text-claude-orange transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Exit Cooking Mode</span>
          </button>
          <div className="text-sm text-gray-400">
            Step {currentStep + 1} of {recipe.directions.length}
          </div>
        </div>

        <div className="w-full bg-gray-700 h-2">
          <div
            className="h-full bg-claude-orange transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full">
          <div className="text-9xl mb-8 animate-pulse">🍳</div>

          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center">
            {recipe.title}
          </h2>

          <div className="bg-gray-800 rounded-2xl p-8 md:p-12 w-full mb-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-claude-orange rounded-full flex items-center justify-center text-3xl font-bold">
                {currentDirection.stepNumber}
              </div>
              <p className="text-2xl md:text-4xl leading-relaxed">
                {currentDirection.text}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-8 py-4 bg-gray-700 rounded-xl text-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentStep(Math.min(recipe.directions.length - 1, currentStep + 1))}
              disabled={currentStep === recipe.directions.length - 1}
              className="px-8 py-4 bg-claude-orange rounded-xl text-xl disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              Next →
            </button>
          </div>

          {currentStep === recipe.directions.length - 1 && (
            <div className="mt-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-2xl text-green-400">You're all done! Enjoy your meal!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-claude-orange transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to recipes</span>
      </Link>

      {/* Header */}
      <div className="card">
        {recipe.imageUrl && (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}

        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-claude-dark dark:text-white">{recipe.title}</h1>

          {recipe.description && (
            <p className="text-lg text-gray-600 dark:text-gray-300">{recipe.description}</p>
          )}

          {/* Servings Scaler */}
          {recipe.servings && (
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Servings:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setServingsMultiplier(Math.max(0.5, servingsMultiplier - 0.5))}
                  className="p-1 bg-white dark:bg-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
                >
                  <Minus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <span className="text-xl font-bold text-claude-orange min-w-[60px] text-center">
                  {Math.round((recipe.servings || 0) * servingsMultiplier)}
                </span>
                <button
                  onClick={() => setServingsMultiplier(servingsMultiplier + 0.5)}
                  className="p-1 bg-white dark:bg-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
              {servingsMultiplier !== 1 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({servingsMultiplier}x original)
                </span>
              )}
            </div>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-300">
            {totalTime > 0 && (
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>{totalTime} min total</span>
                {recipe.prepTime && <span className="text-sm">({recipe.prepTime} prep)</span>}
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>{Math.round((recipe.servings || 0) * servingsMultiplier)} servings</span>
              </div>
            )}
          </div>

          {/* Categories */}
          {recipe.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.categories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Source */}
          {recipe.sourceUrl && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Source:{' '}
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-claude-orange hover:underline"
              >
                {recipe.sourceUrl}
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleToggleFavorite}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                recipe.isFavorite
                  ? 'bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Heart className={`h-5 w-5 ${recipe.isFavorite ? 'fill-current' : ''}`} />
              <span>{recipe.isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
            </button>

            <button
              onClick={handleToggleWishlist}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                recipe.isWishList
                  ? 'bg-yellow-50 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Star className={`h-5 w-5 ${recipe.isWishList ? 'fill-current' : ''}`} />
              <span>{recipe.isWishList ? 'On Wish List' : 'Add to Wish List'}</span>
            </button>

            {recipe.directions && recipe.directions.length > 0 && (
              <button
                onClick={() => {
                  setCookingMode(true);
                  setCurrentStep(0);
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-claude-orange text-white hover:opacity-90 transition-opacity"
              >
                <Play className="h-5 w-5" />
                <span>Cooking Mode</span>
              </button>
            )}

            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 transition-colors ml-auto"
            >
              <Trash2 className="h-5 w-5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="card">
        <h2 className="text-2xl font-bold text-claude-dark dark:text-white mb-4">Ingredients</h2>
        <ul className="space-y-3">
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient.id} className="flex items-start">
              <span className="inline-block w-2 h-2 bg-claude-orange rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-gray-700 dark:text-gray-300">
                {scaleQuantity(ingredient.text, servingsMultiplier)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Directions */}
      <div className="card">
        <h2 className="text-2xl font-bold text-claude-dark dark:text-white mb-4">Directions</h2>
        <ol className="space-y-4">
          {recipe.directions.map((direction) => (
            <li key={direction.id} className="flex">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-claude-orange text-white rounded-full font-bold mr-4 flex-shrink-0">
                {direction.stepNumber}
              </span>
              <p className="text-gray-700 dark:text-gray-300 pt-1">{direction.text}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Tips */}
      {recipe.tips && recipe.tips.length > 0 && (
        <div className="card bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 border-yellow-200 dark:border-yellow-700">
          <h2 className="text-2xl font-bold text-claude-dark dark:text-white mb-4">💡 Tips</h2>
          <ul className="space-y-2">
            {recipe.tips.map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block w-2 h-2 bg-yellow-600 dark:bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700 dark:text-gray-300">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Personal Notes */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-claude-dark dark:text-white">Personal Notes</h2>
        </div>

        {recipeNotes[recipe.id] && recipeNotes[recipe.id].length > 0 && (
          <div className="space-y-2 mb-4">
            {recipeNotes[recipe.id].map((note: string, idx: number) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-start justify-between">
                <p className="text-gray-700 dark:text-gray-300 flex-1">{note}</p>
                <button
                  onClick={() => deleteNote(recipe.id, idx)}
                  className="ml-2 text-red-500 hover:text-red-700 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const input = form.elements.namedItem('note') as HTMLInputElement;
            if (input.value.trim()) {
              addNote(recipe.id, input.value.trim());
              input.value = '';
            }
          }}
          className="flex gap-2"
        >
          <input
            name="note"
            type="text"
            placeholder="Add a personal note (e.g., 'Doubled the garlic and it was perfect!')"
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary">
            Add Note
          </button>
        </form>
      </div>
    </div>
  );
}
