import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import RegisterLayout from './components/RegisterLayout';
import CategoryLayout from './components/CategoryLayout';
import LoginLayout from './components/LoginLayout';
import RecipeLayout from './components/RecipeLayout'
import NewRecipeLayout from './components/NewRecipeLayout'
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginLayout/>} />
          <Route path="/register" element={<RegisterLayout/>} />
          <Route path="/recipe" element={<RecipeLayout/>} />
          <Route path="/category" element={<CategoryLayout/>} />
          <Route path="/addNewRecipe" element={<NewRecipeLayout/>} />
          <Route path="/" element={<MainLayout/>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;