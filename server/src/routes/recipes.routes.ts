import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as recipeService from '../services/recipe.service';
import { scrapeRecipeFromUrl } from '../services/scraper.service';
import { extractRecipeFromImage } from '../services/claude.service';

const router = Router();

// Configure multer for image uploads
const upload = multer({
  dest: path.join(__dirname, '../../uploads/'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.filename).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  },
});

// GET /api/recipes
router.get('/', (req: Request, res: Response) => {
  try {
    const { favorite, wishlist, category } = req.query;

    const filters: any = {};
    if (favorite === 'true') filters.isFavorite = true;
    if (wishlist === 'true') filters.isWishList = true;
    if (category) filters.category = category as string;

    const recipes = recipeService.getAllRecipes(filters);
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// GET /api/recipes/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const recipe = recipeService.getRecipeById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// POST /api/recipes
router.post('/', async (req: Request, res: Response) => {
  try {
    const recipe = recipeService.createRecipe(req.body);
    res.status(201).json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

// POST /api/recipes/from-url
router.post('/from-url', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Scrape and extract recipe from URL
    const extractedRecipe = await scrapeRecipeFromUrl(url);

    // Create recipe in database
    const recipe = recipeService.createRecipe({
      ...extractedRecipe,
      source: 'URL',
      sourceUrl: url,
    });

    res.status(201).json(recipe);
  } catch (error: any) {
    console.error('Error extracting recipe from URL:', error);
    res.status(500).json({ error: error.message || 'Failed to extract recipe from URL' });
  }
});

// POST /api/recipes/from-image
router.post('/from-image', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Read the image file
    const imageBuffer = fs.readFileSync(req.file.path);
    const imageBase64 = imageBuffer.toString('base64');

    // Extract recipe from image using Claude vision
    const extractedRecipe = await extractRecipeFromImage(imageBase64, req.file.mimetype);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    // Create recipe in database
    const recipe = recipeService.createRecipe({
      ...extractedRecipe,
      source: 'Photo',
    });

    res.status(201).json(recipe);
  } catch (error: any) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    console.error('Error extracting recipe from image:', error);
    res.status(500).json({ error: error.message || 'Failed to extract recipe from image' });
  }
});

// PUT /api/recipes/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const recipe = recipeService.updateRecipe(req.params.id, req.body);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

// DELETE /api/recipes/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = recipeService.deleteRecipe(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// POST /api/recipes/:id/favorite
router.post('/:id/favorite', (req: Request, res: Response) => {
  try {
    const recipe = recipeService.toggleFavorite(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

// POST /api/recipes/:id/wishlist
router.post('/:id/wishlist', (req: Request, res: Response) => {
  try {
    const recipe = recipeService.toggleWishList(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    res.status(500).json({ error: 'Failed to toggle wishlist' });
  }
});

// GET /api/categories
router.get('/categories/all', (req: Request, res: Response) => {
  try {
    const categories = recipeService.getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
