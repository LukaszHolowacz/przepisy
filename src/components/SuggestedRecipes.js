import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ImageDisplay from './ImageDisplay';  
import '../styles/suggestedRecipes.css';

function SuggestedRecipes() {
  const navigate = useNavigate();
  const [selectedRecipe, setRecipe] = useState(null);
  const [recipes, setRecipes] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/recipes')
      .then((response) => response.json())
      .then((data) => {
        if (data.recipes) {
          setRecipes(data.recipes);
        } else {
          console.error('Błąd pobierania przepisów:', data.error);
        }
      })
      .catch((error) => {
        console.error('Błąd podczas żądania do API:', error);
      });
  }, []);

  const handleRecipeClick = (recipe) => {
    setRecipe(recipe);
    navigate('/recipe', { state: { selectedRecipe: recipe } });
  }

  return (
    <div className="suggestedRecipes">
      {recipes && recipes.slice(0, 8).map(recipe => (
        <div key={recipe.id} className="recipeCard" onClick={() => handleRecipeClick(recipe)}>
          {console.log(recipe.image)}
          <ImageDisplay buffer={recipe.image} alt={recipe.name} />
          <h3>{recipe.name}</h3>
          <button>❤</button>
        </div>
      ))}
    </div>
  );   
}

export default SuggestedRecipes;
