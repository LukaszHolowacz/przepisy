import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/recipeLayout.css';
import ImageDisplay from './ImageDisplay';  
import { useAuth } from "../context/AuthContext";

function RecipeLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isLoggedIn, userId }  = useAuth();
    const [ingredients, setIngredients] = useState([]);
    const [steps, setSteps] = useState([]);

    const selectedRecipe = location.state?.selectedRecipe;

    const handleExecButtonClick = async () => {
        try {
            // Sprawdzenie, czy użytkownik ma wystarczającą ilość produktów
            const checkResponse = await fetch('http://localhost:3001/api/checkUserProducts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    products: ingredients.map(item => ({ product_id: item.id, requiredAmount: parseInt(item.amount) })),
                }),
            });
    
            if (!checkResponse.ok) {
                const errorData = await checkResponse.json();
                if (errorData && errorData.error) {
                    let errorMessage = errorData.error;
                    alert(errorMessage);
                } else {
                    console.error('Wystąpił problem podczas sprawdzania ilości produktów');
                }
                return; // Przerwij funkcję, jeśli ilość produktów nie jest wystarczająca
            } else {
                alert("Usunięto produkty potrzebne do wykonania tego przepisu");
            }
        } catch (error) {
            console.error('Błąd podczas żądania do API:', error);
        }
    };
    
    
    useEffect(() => {
        fetch(`http://localhost:3001/api/getRecipeProducts?recipe_id=${selectedRecipe.id}`)
            .then(response => response.json())
            .then((data) => {
                if (data.results) { 
                    console.log(data.results);
                    setIngredients(data.results); 
                } else {
                    console.error('Błąd pobierania produktów:', data.error);
                }
            })
            .catch(error => console.error('Błąd:', error));

        fetch(`http://localhost:3001/api/getRecipeSteps?recipe_id=${selectedRecipe.id}`)
            .then(response => response.json())
            .then((data) => {
                if (data.results) { 
                    setSteps(data.results); 
                } else {
                    console.error('Błąd pobierania produktów:', data.error);
                }
            })
            .catch(error => console.error('Błąd:', error));
    }, [selectedRecipe]);
    

    return (
        <div className="recipe-layout">
            <div className="container">
                <span className="back-button" onClick={() => navigate('/')}>
                Powrót
            </span>
            {selectedRecipe ? (
                <>
                    <div className="recipe-image">
                        <ImageDisplay buffer={selectedRecipe.image} alt={selectedRecipe.name} />
                    </div>
                    <div className="recipe-details">
                        <h1>{selectedRecipe.name}</h1>
                        {ingredients && (
                            <>
                                <h2>Potrzebne składniki:</h2>
                                <ul>
                                    {ingredients.map((ingredient, index) => (
                                        <li key={index}>{ingredient.amount} {ingredient.unit} {ingredient.name}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                        {steps && (
                            <>
                                <h2>Kroki:</h2>
                                <ol>
                                    {steps.map((step, index) => (
                                        <li key={index}>{step.step_text}</li>
                                    ))}
                                </ol>
                            </>
                        )}
                    </div>
                    {isLoggedIn && (
                        <button className="execute-button" onClick={handleExecButtonClick}>
                            Wykonaj
                        </button>
                    )}
                </>
            ) : (
                <h1>Brak wybranego przepisu</h1>
            )}
            </div>
        </div>
    );
}

export default RecipeLayout;