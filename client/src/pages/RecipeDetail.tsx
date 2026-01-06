import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, Star, Clock, Users, ArrowLeft, Trash2, Edit } from 'lucide-react';
import { recipeApi } from '../services/api';
import type { Recipe } from '../types/recipe';

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadRecipe();
    }
  }, [id]);

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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-claude-orange mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading recipe...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Recipe not found</h2>
        <Link to="/" className="btn-primary">
          Back to Recipes
        </Link>
      </div>
    );
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-claude-orange transition-colors"
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
          <h1 className="text-4xl font-bold text-claude-dark">{recipe.title}</h1>

          {recipe.description && (
            <p className="text-lg text-gray-600">{recipe.description}</p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-gray-600">
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
                <span>{recipe.servings} servings</span>
              </div>
            )}
          </div>

          {/* Categories */}
          {recipe.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.categories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Source */}
          {recipe.sourceUrl && (
            <div className="text-sm text-gray-600">
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
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleToggleFavorite}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                recipe.isFavorite
                  ? 'bg-red-50 text-red-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Heart className={`h-5 w-5 ${recipe.isFavorite ? 'fill-current' : ''}`} />
              <span>{recipe.isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
            </button>

            <button
              onClick={handleToggleWishlist}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                recipe.isWishList
                  ? 'bg-yellow-50 text-yellow-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Star className={`h-5 w-5 ${recipe.isWishList ? 'fill-current' : ''}`} />
              <span>{recipe.isWishList ? 'On Wish List' : 'Add to Wish List'}</span>
            </button>

            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-red-600 hover:bg-red-50 transition-colors ml-auto"
            >
              <Trash2 className="h-5 w-5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="card">
        <h2 className="text-2xl font-bold text-claude-dark mb-4">Ingredients</h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient.id} className="flex items-start">
              <span className="inline-block w-2 h-2 bg-claude-orange rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-gray-700">{ingredient.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Directions */}
      <div className="card">
        <h2 className="text-2xl font-bold text-claude-dark mb-4">Directions</h2>
        <ol className="space-y-4">
          {recipe.directions.map((direction) => (
            <li key={direction.id} className="flex">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-claude-orange text-white rounded-full font-bold mr-4 flex-shrink-0">
                {direction.stepNumber}
              </span>
              <p className="text-gray-700 pt-1">{direction.text}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Tips */}
      {recipe.tips.length > 0 && (
        <div className="card bg-yellow-50 border-yellow-200">
          <h2 className="text-2xl font-bold text-claude-dark mb-4">💡 Tips</h2>
          <ul className="space-y-2">
            {recipe.tips.map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
