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
    <div className="card group hover:shadow-md transition-shadow">
      <Link to={`/recipe/${recipe.id}`}>
        {/* Image */}
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-claude-orange to-claude-brown rounded-lg mb-4 flex items-center justify-center">
            <span className="text-white text-6xl">🍳</span>
          </div>
        )}

        {/* Content */}
        <div className="space-y-3">
          {/* Title */}
          <h3 className="text-xl font-bold text-claude-dark group-hover:text-claude-orange transition-colors line-clamp-2">
            {recipe.title}
          </h3>

          {/* Description */}
          {recipe.description && (
            <p className="text-gray-600 text-sm line-clamp-2">
              {recipe.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(recipe.id);
          }}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
            recipe.isFavorite
              ? 'bg-red-50 text-red-600'
              : 'text-gray-600 hover:bg-gray-100'
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
              ? 'bg-yellow-50 text-yellow-600'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Star className={`h-5 w-5 ${recipe.isWishList ? 'fill-current' : ''}`} />
          <span className="text-sm">Wish List</span>
        </button>
      </div>
    </div>
  );
}
