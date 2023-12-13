import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/CategoryLayout.css';
import Navbar from './CategoryNavbar';
import ImageDisplay from './ImageDisplay';

function CategoryLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [category, setCategory] = useState(null);
  const [selectedRecipe, setRecipe] = useState(null);
  const [recipes, setRecipes] = useState([]);

  const handleRecipeClick = (recipe) => {
    setRecipe(recipe);
    navigate('/recipe', { state: { selectedRecipe: recipe } });
  }

  useEffect(() => {
    const { state } = location;
    
    if (state && state.selectedCategory) {
      setCategory(state.selectedCategory);
    }
  
    if (category && category.id) {
      fetch(`http://localhost:3001/api/getRecipeWithCategory?cat_id=${category.id}`)
        .then(response => response.json())
        .then((data) => {
          if (data.results) { 
            setRecipes(data.results); 
          } else {
            console.error('Błąd pobierania produktów:', data.error);
          }
        })
        .catch(error => console.error('Błąd:', error));
    }
  }, [location, category]);
  
  
    return (
      <div className="category-layout">
        <Navbar/>
        {category && (
          <h1>
            {category.name}
          </h1>
        )}
        <div className='recipes'>
          {recipes.map(recipe => (
            <div key={recipe.id} className="categoryRecipeCard" onClick={() => handleRecipeClick(recipe)}>
              <ImageDisplay buffer={recipe.image} alt={recipe.name} />
              <h3>{recipe.name}</h3>
              <button>❤</button>
            </div>
          ))}
        </div>
      </div>
    );
}

export default CategoryLayout;
