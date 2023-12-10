import React from 'react';
import Navbar from './Navbar';
import SuggestedRecipes from './SuggestedRecipes';
import RecipeCategories from './RecipeCategories';

function RightPanel() {
  return (
    <div>
      <Navbar />
      <SuggestedRecipes />
      <RecipeCategories />
    </div>
  );
}

export default RightPanel;
