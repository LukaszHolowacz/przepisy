import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:3001/api/categories')
        .then((response) => response.json())
        .then((data) => {
            if (data.categories) {
            setCategories(data.categories);
            } else {
            console.error('Błąd pobierania kategorii:', data.error);
            }
        })
        .catch((error) => {
            console.error('Błąd podczas żądania do API:', error);
        });
    }, []);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        navigate('/category', { state: { selectedCategory: category } });
    }

    const handleMain = () => {
        navigate('/');
    };

    return (
        <div className="category-navbar">
            <span className="back-button" onClick={handleMain}>
                Powrót
            </span>
            <div className='category-buttons'>
                {categories.map(category => (
                    <button onClick={() => handleCategoryClick(category)} className="category-card">{category.name}</button>
                ))}
            </div>
        </div>
    );
}

export default Navbar;