import { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';
import { recipeApi } from '../services/api';
import type { Recipe } from '../types/recipe';

interface RecipeListProps {
  filterType?: 'all' | 'favorites' | 'wishlist';
}

export default function RecipeList({ filterType = 'all' }: RecipeListProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadRecipes();
    loadCategories();
  }, [filterType, selectedCategory]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const filters: any = {};

      if (filterType === 'favorites') filters.favorite = true;
      if (filterType === 'wishlist') filters.wishlist = true;
      if (selectedCategory) filters.category = selectedCategory;

      const data = await recipeApi.getAll(filters);
      setRecipes(data);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await recipeApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await recipeApi.toggleFavorite(id);
      loadRecipes();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleToggleWishlist = async (id: string) => {
    try {
      await recipeApi.toggleWishlist(id);
      loadRecipes();
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTitle = () => {
    if (filterType === 'favorites') return 'Favorite Recipes';
    if (filterType === 'wishlist') return 'Wish List';
    return 'All Recipes';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-claude-dark dark:text-white mb-2">{getTitle()}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="sm:w-64 relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field pl-10 appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recipe Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-claude-orange mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading recipes...</p>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📖</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No recipes found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Start by adding your first recipe!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 md:pb-8">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onToggleFavorite={handleToggleFavorite}
              onToggleWishlist={handleToggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}
