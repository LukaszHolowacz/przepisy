import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function CategoryLayout() {
    const location = useLocation();
    const [category, setCategory] = useState(null);
  
    useEffect(() => {
      const { state } = location;
      if (state && state.selectedCategory) {
        setCategory(state.selectedCategory);
      }
    }, [location]);
  
    return (
      <div>
          
      </div>
    );
}

export default CategoryLayout;
