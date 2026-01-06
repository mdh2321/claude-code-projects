import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Link as LinkIcon, Camera, PenTool, ArrowLeft, Loader } from 'lucide-react';
import { recipeApi } from '../services/api';

type InputMethod = 'url' | 'photo' | 'manual';

export default function AddRecipe() {
  const navigate = useNavigate();
  const [inputMethod, setInputMethod] = useState<InputMethod>('url');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // URL method state
  const [url, setUrl] = useState('');

  // Photo method state
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  // Manual method state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [directions, setDirections] = useState<string[]>(['']);
  const [tips, setTips] = useState<string[]>(['']);
  const [categories, setCategories] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    try {
      setLoading(true);
      setError('');
      const recipe = await recipeApi.createFromUrl(url);
      navigate(`/recipe/${recipe.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to extract recipe from URL');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) return;

    try {
      setLoading(true);
      setError('');
      const recipe = await recipeApi.createFromImage(photo);
      navigate(`/recipe/${recipe.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to extract recipe from photo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const recipeData = {
        title,
        description: description || undefined,
        prepTime: prepTime ? parseInt(prepTime) : undefined,
        cookTime: cookTime ? parseInt(cookTime) : undefined,
        servings: servings ? parseInt(servings) : undefined,
        ingredients: ingredients
          .filter((i) => i.trim())
          .map((text) => ({
            text,
            item: text.split(' ').slice(-1)[0] || text,
          })),
        directions: directions
          .filter((d) => d.trim())
          .map((text, index) => ({
            stepNumber: index + 1,
            text,
          })),
        tips: tips.filter((t) => t.trim()),
        categories: categories
          ? categories.split(',').map((c) => c.trim()).filter(Boolean)
          : [],
      };

      const recipe = await recipeApi.create(recipeData);
      navigate(`/recipe/${recipe.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create recipe');
    } finally {
      setLoading(false);
    }
  };

  const addArrayItem = (
    array: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter([...array, '']);
  };

  const updateArrayItem = (
    array: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    const newArray = [...array];
    newArray[index] = value;
    setter(newArray);
  };

  const removeArrayItem = (
    array: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    if (array.length > 1) {
      setter(array.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-claude-orange transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to recipes</span>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-claude-dark mb-2">Add New Recipe</h1>
        <p className="text-gray-600">Choose how you'd like to add your recipe</p>
      </div>

      {/* Input Method Selection */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setInputMethod('url')}
          className={`card text-center py-6 transition-all ${
            inputMethod === 'url'
              ? 'ring-2 ring-claude-orange'
              : 'hover:shadow-md'
          }`}
        >
          <LinkIcon className={`h-8 w-8 mx-auto mb-2 ${
            inputMethod === 'url' ? 'text-claude-orange' : 'text-gray-600'
          }`} />
          <span className="font-medium">From URL</span>
        </button>

        <button
          onClick={() => setInputMethod('photo')}
          className={`card text-center py-6 transition-all ${
            inputMethod === 'photo'
              ? 'ring-2 ring-claude-orange'
              : 'hover:shadow-md'
          }`}
        >
          <Camera className={`h-8 w-8 mx-auto mb-2 ${
            inputMethod === 'photo' ? 'text-claude-orange' : 'text-gray-600'
          }`} />
          <span className="font-medium">From Photo</span>
        </button>

        <button
          onClick={() => setInputMethod('manual')}
          className={`card text-center py-6 transition-all ${
            inputMethod === 'manual'
              ? 'ring-2 ring-claude-orange'
              : 'hover:shadow-md'
          }`}
        >
          <PenTool className={`h-8 w-8 mx-auto mb-2 ${
            inputMethod === 'manual' ? 'text-claude-orange' : 'text-gray-600'
          }`} />
          <span className="font-medium">Manual Entry</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* URL Method */}
      {inputMethod === 'url' && (
        <form onSubmit={handleSubmitUrl} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipe URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/recipe"
              className="input-field"
              required
              disabled={loading}
            />
            <p className="mt-2 text-sm text-gray-500">
              Paste a URL from a recipe website. Our AI will extract the recipe and remove the fluff!
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !url}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Extracting recipe...</span>
              </>
            ) : (
              <span>Extract Recipe</span>
            )}
          </button>
        </form>
      )}

      {/* Photo Method */}
      {inputMethod === 'photo' && (
        <form onSubmit={handleSubmitPhoto} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {photoPreview ? (
                <div className="space-y-4">
                  <img
                    src={photoPreview}
                    alt="Recipe preview"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhoto(null);
                      setPhotoPreview('');
                    }}
                    className="btn-secondary"
                  >
                    Choose Different Photo
                  </button>
                </div>
              ) : (
                <div>
                  <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <label className="btn-primary cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      disabled={loading}
                    />
                    Choose Photo
                  </label>
                  <p className="mt-2 text-sm text-gray-500">
                    Upload a photo of a recipe from a cookbook or recipe card
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !photo}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Extracting recipe...</span>
              </>
            ) : (
              <span>Extract Recipe</span>
            )}
          </button>
        </form>
      )}

      {/* Manual Method */}
      {inputMethod === 'manual' && (
        <form onSubmit={handleSubmitManual} className="card space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipe Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chocolate Chip Cookies"
              className="input-field"
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the recipe"
              className="input-field"
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prep Time (min)
              </label>
              <input
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="input-field"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cook Time (min)
              </label>
              <input
                type="number"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                className="input-field"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Servings
              </label>
              <input
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="input-field"
                disabled={loading}
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories
            </label>
            <input
              type="text"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              placeholder="e.g., Dessert, Baking, Quick & Easy"
              className="input-field"
              disabled={loading}
            />
            <p className="mt-1 text-sm text-gray-500">Separate with commas</p>
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ingredients
            </label>
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) =>
                      updateArrayItem(ingredients, setIngredients, index, e.target.value)
                    }
                    placeholder="e.g., 2 cups flour"
                    className="input-field flex-1"
                    disabled={loading}
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(ingredients, setIngredients, index)}
                      className="btn-secondary px-3"
                      disabled={loading}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addArrayItem(ingredients, setIngredients)}
              className="mt-2 text-claude-orange hover:underline text-sm"
              disabled={loading}
            >
              + Add ingredient
            </button>
          </div>

          {/* Directions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Directions
            </label>
            <div className="space-y-2">
              {directions.map((direction, index) => (
                <div key={index} className="flex space-x-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-claude-orange text-white rounded-full font-bold flex-shrink-0 mt-2">
                    {index + 1}
                  </span>
                  <textarea
                    value={direction}
                    onChange={(e) =>
                      updateArrayItem(directions, setDirections, index, e.target.value)
                    }
                    placeholder={`Step ${index + 1}`}
                    className="input-field flex-1"
                    rows={2}
                    disabled={loading}
                  />
                  {directions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(directions, setDirections, index)}
                      className="btn-secondary px-3 h-fit mt-2"
                      disabled={loading}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addArrayItem(directions, setDirections)}
              className="mt-2 text-claude-orange hover:underline text-sm"
              disabled={loading}
            >
              + Add step
            </button>
          </div>

          {/* Tips */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tips (Optional)
            </label>
            <div className="space-y-2">
              {tips.map((tip, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={tip}
                    onChange={(e) =>
                      updateArrayItem(tips, setTips, index, e.target.value)
                    }
                    placeholder="Helpful tip"
                    className="input-field flex-1"
                    disabled={loading}
                  />
                  {tips.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(tips, setTips, index)}
                      className="btn-secondary px-3"
                      disabled={loading}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addArrayItem(tips, setTips)}
              className="mt-2 text-claude-orange hover:underline text-sm"
              disabled={loading}
            >
              + Add tip
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !title}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Creating recipe...</span>
              </>
            ) : (
              <span>Create Recipe</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
