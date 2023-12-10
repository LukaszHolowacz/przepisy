import React from 'react';
import '../styles/suggestedRecipes.css';

function SuggestedRecipes() {
  const recipes = [
    { id: 1, name: "Przepis 1", image: "link_do_obrazka_1" },
    { id: 2, name: "Przepis 2", image: "link_do_obrazka_2" },
    { id: 3, name: "Przepis 3", image: "link_do_obrazka_3" },
    { id: 4, name: "Przepis 4", image: "link_do_obrazka_4" },
    { id: 5, name: "Przepis 5", image: "link_do_obrazka_5" },
    { id: 6, name: "Przepis 6", image: "link_do_obrazka_6" },
    { id: 7, name: "Przepis 7", image: "link_do_obrazka_7" },
    { id: 8, name: "Przepis 8", image: "link_do_obrazka_8" },
  ];

  return (
    <div className="suggestedRecipes">
      {recipes.map(recipe => (
        <div key={recipe.id} className="recipeCard">
          <img src={recipe.image} alt={recipe.name} />
          <h3>{recipe.name}</h3>
          <button>❤</button>
        </div>
      ))}
    </div>
  );
}

export default SuggestedRecipes;
