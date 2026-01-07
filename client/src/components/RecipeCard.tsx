import { Link } from 'react-router-dom';
import { Heart, Clock, Users, Star } from 'lucide-react';
import type { Recipe } from '../types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onToggleFavorite: (id: string) => void;
  onToggleWishlist: (id: string) => void;
}

export default function RecipeCard({ recipe, onToggleFavorite, onToggleWishlist }: RecipeCardProps) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="card group hover:shadow-lg transition-all duration-300 animate-fadeIn">
      <Link to={`/recipe/${recipe.id}`}>
        {/* Image */}
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-claude-orange to-claude-brown rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <span className="text-white text-6xl drop-shadow-lg">🍳</span>
          </div>
        )}

        {/* Content */}
        <div className="space-y-3">
          {/* Title */}
          <h3 className="text-xl font-bold text-claude-dark dark:text-white group-hover:text-claude-orange dark:group-hover:text-claude-orange transition-colors line-clamp-2">
            {recipe.title}
          </h3>

          {/* Description */}
          {recipe.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
              {recipe.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            {totalTime > 0 && (
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{totalTime} min</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{recipe.servings}</span>
              </div>
            )}
          </div>

          {/* Categories */}
          {recipe.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.categories.slice(0, 3).map((category) => (
                <span
                  key={category}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(recipe.id);
          }}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
            recipe.isFavorite
              ? 'bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Heart className={`h-5 w-5 ${recipe.isFavorite ? 'fill-current' : ''}`} />
          <span className="text-sm">Favorite</span>
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist(recipe.id);
          }}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
            recipe.isWishList
              ? 'bg-yellow-50 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Star className={`h-5 w-5 ${recipe.isWishList ? 'fill-current' : ''}`} />
          <span className="text-sm">Wish List</span>
        </button>
      </div>
    </div>
  );
}
