import db from '../db/database';
import { v4 as uuidv4 } from 'uuid';

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  source?: string;
  sourceUrl?: string;
  imageUrl?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  isFavorite: boolean;
  isWishList: boolean;
  createdAt: string;
  updatedAt: string;
  ingredients: Ingredient[];
  directions: Direction[];
  tips: string[];
  categories: string[];
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

export interface CreateRecipeInput {
  title: string;
  description?: string;
  source?: string;
  sourceUrl?: string;
  imageUrl?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  ingredients: Array<{
    text: string;
    quantity?: string;
    unit?: string;
    item: string;
  }>;
  directions: Array<{
    stepNumber: number;
    text: string;
  }>;
  tips?: string[];
  categories?: string[];
}

export function getAllRecipes(filters?: {
  isFavorite?: boolean;
  isWishList?: boolean;
  category?: string;
}): Recipe[] {
  let query = 'SELECT * FROM recipes WHERE 1=1';
  const params: any[] = [];

  if (filters?.isFavorite !== undefined) {
    query += ' AND is_favorite = ?';
    params.push(filters.isFavorite ? 1 : 0);
  }

  if (filters?.isWishList !== undefined) {
    query += ' AND is_wish_list = ?';
    params.push(filters.isWishList ? 1 : 0);
  }

  if (filters?.category) {
    query += ` AND id IN (
      SELECT recipe_id FROM recipe_categories rc
      JOIN categories c ON rc.category_id = c.id
      WHERE c.name = ?
    )`;
    params.push(filters.category);
  }

  query += ' ORDER BY updated_at DESC';

  const stmt = db.prepare(query);
  const recipes = stmt.all(...params) as any[];

  return recipes.map((recipe) => ({
    ...recipe,
    isFavorite: Boolean(recipe.is_favorite),
    isWishList: Boolean(recipe.is_wish_list),
    ingredients: getIngredientsByRecipeId(recipe.id),
    directions: getDirectionsByRecipeId(recipe.id),
    tips: getTipsByRecipeId(recipe.id),
    categories: getCategoriesByRecipeId(recipe.id),
  }));
}

export function getRecipeById(id: string): Recipe | null {
  const stmt = db.prepare('SELECT * FROM recipes WHERE id = ?');
  const recipe = stmt.get(id) as any;

  if (!recipe) {
    return null;
  }

  return {
    ...recipe,
    isFavorite: Boolean(recipe.is_favorite),
    isWishList: Boolean(recipe.is_wish_list),
    ingredients: getIngredientsByRecipeId(recipe.id),
    directions: getDirectionsByRecipeId(recipe.id),
    tips: getTipsByRecipeId(recipe.id),
    categories: getCategoriesByRecipeId(recipe.id),
  };
}

export function createRecipe(input: CreateRecipeInput): Recipe {
  const id = uuidv4();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO recipes (
      id, title, description, source, source_url, image_url,
      prep_time, cook_time, servings, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    input.title,
    input.description || null,
    input.source || null,
    input.sourceUrl || null,
    input.imageUrl || null,
    input.prepTime || null,
    input.cookTime || null,
    input.servings || null,
    now,
    now
  );

  // Insert ingredients
  const ingredientStmt = db.prepare(`
    INSERT INTO ingredients (id, recipe_id, text, quantity, unit, item)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const ingredient of input.ingredients) {
    ingredientStmt.run(
      uuidv4(),
      id,
      ingredient.text,
      ingredient.quantity || null,
      ingredient.unit || null,
      ingredient.item
    );
  }

  // Insert directions
  const directionStmt = db.prepare(`
    INSERT INTO directions (id, recipe_id, step_number, text)
    VALUES (?, ?, ?, ?)
  `);

  for (const direction of input.directions) {
    directionStmt.run(uuidv4(), id, direction.stepNumber, direction.text);
  }

  // Insert tips
  if (input.tips && input.tips.length > 0) {
    const tipStmt = db.prepare(`
      INSERT INTO tips (id, recipe_id, text) VALUES (?, ?, ?)
    `);

    for (const tip of input.tips) {
      tipStmt.run(uuidv4(), id, tip);
    }
  }

  // Insert categories
  if (input.categories && input.categories.length > 0) {
    for (const categoryName of input.categories) {
      const categoryId = getOrCreateCategory(categoryName);
      const rcStmt = db.prepare(`
        INSERT INTO recipe_categories (recipe_id, category_id) VALUES (?, ?)
      `);
      rcStmt.run(id, categoryId);
    }
  }

  return getRecipeById(id)!;
}

export function updateRecipe(id: string, updates: Partial<CreateRecipeInput>): Recipe | null {
  const existing = getRecipeById(id);
  if (!existing) {
    return null;
  }

  const now = new Date().toISOString();

  // Update recipe basic info
  if (updates.title || updates.description || updates.source || updates.sourceUrl ||
      updates.imageUrl || updates.prepTime !== undefined || updates.cookTime !== undefined ||
      updates.servings !== undefined) {
    const stmt = db.prepare(`
      UPDATE recipes SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        source = COALESCE(?, source),
        source_url = COALESCE(?, source_url),
        image_url = COALESCE(?, image_url),
        prep_time = COALESCE(?, prep_time),
        cook_time = COALESCE(?, cook_time),
        servings = COALESCE(?, servings),
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updates.title || null,
      updates.description || null,
      updates.source || null,
      updates.sourceUrl || null,
      updates.imageUrl || null,
      updates.prepTime || null,
      updates.cookTime || null,
      updates.servings || null,
      now,
      id
    );
  }

  // Update ingredients if provided
  if (updates.ingredients) {
    db.prepare('DELETE FROM ingredients WHERE recipe_id = ?').run(id);
    const ingredientStmt = db.prepare(`
      INSERT INTO ingredients (id, recipe_id, text, quantity, unit, item)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const ingredient of updates.ingredients) {
      ingredientStmt.run(
        uuidv4(),
        id,
        ingredient.text,
        ingredient.quantity || null,
        ingredient.unit || null,
        ingredient.item
      );
    }
  }

  // Update directions if provided
  if (updates.directions) {
    db.prepare('DELETE FROM directions WHERE recipe_id = ?').run(id);
    const directionStmt = db.prepare(`
      INSERT INTO directions (id, recipe_id, step_number, text)
      VALUES (?, ?, ?, ?)
    `);

    for (const direction of updates.directions) {
      directionStmt.run(uuidv4(), id, direction.stepNumber, direction.text);
    }
  }

  // Update tips if provided
  if (updates.tips) {
    db.prepare('DELETE FROM tips WHERE recipe_id = ?').run(id);
    if (updates.tips.length > 0) {
      const tipStmt = db.prepare(`
        INSERT INTO tips (id, recipe_id, text) VALUES (?, ?, ?)
      `);

      for (const tip of updates.tips) {
        tipStmt.run(uuidv4(), id, tip);
      }
    }
  }

  // Update categories if provided
  if (updates.categories) {
    db.prepare('DELETE FROM recipe_categories WHERE recipe_id = ?').run(id);
    for (const categoryName of updates.categories) {
      const categoryId = getOrCreateCategory(categoryName);
      db.prepare('INSERT INTO recipe_categories (recipe_id, category_id) VALUES (?, ?)').run(id, categoryId);
    }
  }

  return getRecipeById(id);
}

export function deleteRecipe(id: string): boolean {
  const stmt = db.prepare('DELETE FROM recipes WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function toggleFavorite(id: string): Recipe | null {
  const recipe = getRecipeById(id);
  if (!recipe) {
    return null;
  }

  const stmt = db.prepare(`
    UPDATE recipes SET is_favorite = ?, updated_at = ? WHERE id = ?
  `);
  stmt.run(!recipe.isFavorite ? 1 : 0, new Date().toISOString(), id);

  return getRecipeById(id);
}

export function toggleWishList(id: string): Recipe | null {
  const recipe = getRecipeById(id);
  if (!recipe) {
    return null;
  }

  const stmt = db.prepare(`
    UPDATE recipes SET is_wish_list = ?, updated_at = ? WHERE id = ?
  `);
  stmt.run(!recipe.isWishList ? 1 : 0, new Date().toISOString(), id);

  return getRecipeById(id);
}

export function getAllCategories(): string[] {
  const stmt = db.prepare('SELECT name FROM categories ORDER BY name');
  const categories = stmt.all() as { name: string }[];
  return categories.map((c) => c.name);
}

// Helper functions
function getIngredientsByRecipeId(recipeId: string): Ingredient[] {
  const stmt = db.prepare('SELECT * FROM ingredients WHERE recipe_id = ?');
  return stmt.all(recipeId) as Ingredient[];
}

function getDirectionsByRecipeId(recipeId: string): Direction[] {
  const stmt = db.prepare('SELECT * FROM directions WHERE recipe_id = ? ORDER BY step_number');
  return stmt.all(recipeId) as Direction[];
}

function getTipsByRecipeId(recipeId: string): string[] {
  const stmt = db.prepare('SELECT text FROM tips WHERE recipe_id = ?');
  const tips = stmt.all(recipeId) as { text: string }[];
  return tips.map((t) => t.text);
}

function getCategoriesByRecipeId(recipeId: string): string[] {
  const stmt = db.prepare(`
    SELECT c.name FROM categories c
    JOIN recipe_categories rc ON c.id = rc.category_id
    WHERE rc.recipe_id = ?
  `);
  const categories = stmt.all(recipeId) as { name: string }[];
  return categories.map((c) => c.name);
}

function getOrCreateCategory(name: string): string {
  const existingStmt = db.prepare('SELECT id FROM categories WHERE name = ?');
  const existing = existingStmt.get(name) as { id: string } | undefined;

  if (existing) {
    return existing.id;
  }

  const id = uuidv4();
  const insertStmt = db.prepare('INSERT INTO categories (id, name) VALUES (?, ?)');
  insertStmt.run(id, name);
  return id;
}
