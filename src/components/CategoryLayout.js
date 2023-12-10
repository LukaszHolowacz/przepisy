import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/CategoryLayout.css';
import Navbar from './CategoryNavbar';

function CategoryLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [category, setCategory] = useState(null);
  
    useEffect(() => {
      const { state } = location;
      if (state && state.selectedCategory) {
        setCategory(state.selectedCategory);
      }
    }, [location]);
  
    return (
      <div className="category-layout">
        <Navbar/>
        {category && (
          <div>
            <p>id: {category.id}</p>
            <p>name: {category.name}</p>
          </div>
        )}
      </div>
    );
}

export default CategoryLayout;
