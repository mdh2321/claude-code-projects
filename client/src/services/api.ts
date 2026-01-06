import axios from 'axios';
import type { Recipe } from '../types/recipe';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const recipeApi = {
  // Get all recipes with optional filters
  getAll: async (filters?: {
    favorite?: boolean;
    wishlist?: boolean;
    category?: string;
  }): Promise<Recipe[]> => {
    const params = new URLSearchParams();
    if (filters?.favorite) params.append('favorite', 'true');
    if (filters?.wishlist) params.append('wishlist', 'true');
    if (filters?.category) params.append('category', filters.category);

    const response = await api.get(`/recipes?${params}`);
    return response.data;
  },

  // Get single recipe by ID
  getById: async (id: string): Promise<Recipe> => {
    const response = await api.get(`/recipes/${id}`);
    return response.data;
  },

  // Create recipe manually
  create: async (recipe: any): Promise<Recipe> => {
    const response = await api.post('/recipes', recipe);
    return response.data;
  },

  // Create recipe from URL
  createFromUrl: async (url: string): Promise<Recipe> => {
    const response = await api.post('/recipes/from-url', { url });
    return response.data;
  },

  // Create recipe from image
  createFromImage: async (file: File): Promise<Recipe> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/recipes/from-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update recipe
  update: async (id: string, updates: any): Promise<Recipe> => {
    const response = await api.put(`/recipes/${id}`, updates);
    return response.data;
  },

  // Delete recipe
  delete: async (id: string): Promise<void> => {
    await api.delete(`/recipes/${id}`);
  },

  // Toggle favorite status
  toggleFavorite: async (id: string): Promise<Recipe> => {
    const response = await api.post(`/recipes/${id}/favorite`);
    return response.data;
  },

  // Toggle wishlist status
  toggleWishlist: async (id: string): Promise<Recipe> => {
    const response = await api.post(`/recipes/${id}/wishlist`);
    return response.data;
  },

  // Get all categories
  getCategories: async (): Promise<string[]> => {
    const response = await api.get('/recipes/categories/all');
    return response.data;
  },
};

export default api;
