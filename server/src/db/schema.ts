export const createTables = `
  CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    source TEXT,
    source_url TEXT,
    image_url TEXT,
    prep_time INTEGER,
    cook_time INTEGER,
    servings INTEGER,
    is_favorite INTEGER DEFAULT 0,
    is_wish_list INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ingredients (
    id TEXT PRIMARY KEY,
    recipe_id TEXT NOT NULL,
    text TEXT NOT NULL,
    quantity TEXT,
    unit TEXT,
    item TEXT NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS directions (
    id TEXT PRIMARY KEY,
    recipe_id TEXT NOT NULL,
    step_number INTEGER NOT NULL,
    text TEXT NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tips (
    id TEXT PRIMARY KEY,
    recipe_id TEXT NOT NULL,
    text TEXT NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS recipe_categories (
    recipe_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    PRIMARY KEY (recipe_id, category_id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_recipes_favorite ON recipes(is_favorite);
  CREATE INDEX IF NOT EXISTS idx_recipes_wishlist ON recipes(is_wish_list);
  CREATE INDEX IF NOT EXISTS idx_ingredients_recipe ON ingredients(recipe_id);
  CREATE INDEX IF NOT EXISTS idx_directions_recipe ON directions(recipe_id);
  CREATE INDEX IF NOT EXISTS idx_tips_recipe ON tips(recipe_id);
`;
