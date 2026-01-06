import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RecipeList from './pages/RecipeList';
import RecipeDetail from './pages/RecipeDetail';
import AddRecipe from './pages/AddRecipe';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<RecipeList filterType="all" />} />
          <Route path="/favorites" element={<RecipeList filterType="favorites" />} />
          <Route path="/wishlist" element={<RecipeList filterType="wishlist" />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/add" element={<AddRecipe />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
