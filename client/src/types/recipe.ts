export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: Ingredient[];
  directions: Direction[];
  tips?: string[];
  source?: string;
  sourceUrl?: string;
  imageUrl?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  categories: string[];
  isFavorite: boolean;
  isWishList: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  id: string;
  text: string;
  quantity?: string;
  unit?: string;
  item: string;
}

export interface Direction {
  id: string;
  stepNumber: number;
  text: string;
}

export interface RecipeInput {
  type: 'url' | 'photo' | 'manual';
  url?: string;
  photo?: File;
  manualData?: Partial<Recipe>;
}
