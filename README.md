# RecipeBox - AI-Powered Recipe Manager

A modern, clean recipe management application that uses AI to extract recipes from URLs and cookbook photos, removing all the fluff to give you just what you need: ingredients, directions, and tips.

## Features

### 🎯 Core Features
- **Save recipes from URLs**: Paste any recipe URL and our AI will extract the essential information
- **Scan cookbook photos**: Take a picture of a recipe from a cookbook and let AI extract the text
- **Manual recipe entry**: Add recipes manually with a beautiful, intuitive interface
- **AI-powered extraction**: Uses Claude AI to strip away unnecessary content and provide clean, concise recipes

### 📚 Recipe Management
- **Favorites**: Mark your go-to recipes for quick access
- **Wish List**: Keep track of recipes you want to try
- **Categories/Tags**: Organize recipes with custom categories
- **Search & Filter**: Find recipes quickly with search and category filters

### 🎨 Design
- Clean, professional UI inspired by Claude
- Fully responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Beautiful recipe cards with image support

## Tech Stack

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - API requests
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **SQLite** - Database (easy setup, can migrate to PostgreSQL)
- **Better-sqlite3** - Fast SQLite library
- **Anthropic SDK** - Claude AI integration
- **Cheerio** - Web scraping
- **Multer** - File uploads
- **Sharp** - Image processing

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Anthropic API key ([get one here](https://console.anthropic.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd recipe-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   cd ..
   ```

3. **Set up environment variables**

   Backend (.env in server/):
   ```bash
   cd server
   cp .env.example .env
   ```

   Edit `server/.env` and add your Anthropic API key:
   ```
   PORT=3001
   ANTHROPIC_API_KEY=your_api_key_here
   NODE_ENV=development
   ```

   Frontend (.env in client/):
   ```bash
   cd client
   cp .env.example .env
   ```

   The default frontend .env should work:
   ```
   VITE_API_URL=http://localhost:3001/api
   ```

4. **Initialize the database**
   ```bash
   cd server
   npm run db:migrate
   ```

5. **Start the development servers**

   Option 1 - Run both servers concurrently (from root):
   ```bash
   npm run dev
   ```

   Option 2 - Run separately:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

6. **Open the app**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api

## Usage

### Adding Recipes

#### From URL
1. Click "Add Recipe"
2. Select "From URL"
3. Paste a recipe URL (e.g., from AllRecipes, Food Network, etc.)
4. Click "Extract Recipe"
5. AI will extract and clean up the recipe automatically

#### From Photo
1. Click "Add Recipe"
2. Select "From Photo"
3. Upload a photo of a recipe from a cookbook
4. Click "Extract Recipe"
5. AI will read the text and structure the recipe

#### Manual Entry
1. Click "Add Recipe"
2. Select "Manual Entry"
3. Fill in the recipe details
4. Click "Create Recipe"

### Managing Recipes

- **View All Recipes**: Click "All Recipes" in the navigation
- **View Favorites**: Click "Favorites" to see your favorite recipes
- **View Wish List**: Click "Wish List" to see recipes you want to try
- **Search**: Use the search bar to find recipes by name or description
- **Filter by Category**: Use the category dropdown to filter recipes
- **Mark as Favorite**: Click the heart icon on any recipe
- **Add to Wish List**: Click the star icon on any recipe
- **Delete Recipe**: Open a recipe and click the delete button

## Project Structure

```
recipe-app/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript type definitions
│   │   ├── App.tsx        # Main app component with routing
│   │   └── index.css      # Global styles with Tailwind
│   ├── public/            # Static assets
│   └── package.json
│
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── db/           # Database schema and migrations
│   │   ├── routes/       # API route handlers
│   │   ├── services/     # Business logic services
│   │   └── index.ts      # Express server entry point
│   ├── data/             # SQLite database (auto-created)
│   ├── uploads/          # Temporary file uploads (auto-created)
│   └── package.json
│
├── package.json          # Root package.json for scripts
└── README.md            # This file
```

## API Endpoints

### Recipes
- `GET /api/recipes` - Get all recipes (supports filters)
- `GET /api/recipes/:id` - Get single recipe
- `POST /api/recipes` - Create recipe manually
- `POST /api/recipes/from-url` - Create recipe from URL
- `POST /api/recipes/from-image` - Create recipe from photo
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe
- `POST /api/recipes/:id/favorite` - Toggle favorite status
- `POST /api/recipes/:id/wishlist` - Toggle wishlist status

### Categories
- `GET /api/recipes/categories/all` - Get all categories

## Development

### Backend Development
```bash
cd server
npm run dev    # Start with hot reload
npm run build  # Build for production
npm start      # Run production build
```

### Frontend Development
```bash
cd client
npm run dev    # Start dev server
npm run build  # Build for production
npm run preview # Preview production build
```

### Database Migrations
```bash
cd server
npm run db:migrate
```

## Building for Production

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Build the backend**
   ```bash
   cd server
   npm run build
   ```

3. **Deploy**
   - Frontend: Deploy the `client/dist` folder to a static hosting service (Vercel, Netlify, etc.)
   - Backend: Deploy the `server` folder to a Node.js hosting service (Heroku, Railway, DigitalOcean, etc.)
   - Database: For production, consider migrating from SQLite to PostgreSQL

## Environment Variables

### Server
- `PORT` - Server port (default: 3001)
- `ANTHROPIC_API_KEY` - Your Anthropic API key (required)
- `NODE_ENV` - Environment (development/production)

### Client
- `VITE_API_URL` - Backend API URL (default: http://localhost:3001/api)

## Troubleshooting

### "Failed to extract recipe from URL"
- Make sure the URL is accessible and contains a recipe
- Some websites block web scrapers - try a different recipe site
- Check that your API key is correctly set in `server/.env`

### "Database not initialized"
- Run `npm run db:migrate` from the server directory
- Make sure the `server/data` directory exists

### Frontend can't connect to backend
- Make sure the backend is running on port 3001
- Check that `VITE_API_URL` in `client/.env` matches your backend URL
- Check for CORS errors in the browser console

## Future Enhancements

Potential features for future versions:
- User authentication and multi-user support
- Recipe sharing and social features
- Meal planning and shopping lists
- Nutrition information
- Recipe ratings and reviews
- Print-friendly recipe view
- Recipe scaling (adjust servings)
- Unit conversion
- Recipe collections/cookbooks
- Export recipes to PDF

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

Built with ❤️ using Claude AI for recipe extraction
