import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AddProductForm from './AddProductForm';
import "../styles/left-panel.css";
import RemoveProductForm from './RemoveProductForm';

function LeftPanel() {
  const navigate = useNavigate();
  const { isLoggedIn, username } = useAuth(); 
  const [userProducts, setUserProducts] = useState([]);

  const handleLogin = () => {
    navigate('/login');
  };

  const fetchData = async () => {
    try {
      if (isLoggedIn) {
        const response = await fetch('http://localhost:3001/api/userProducts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.userProducts) {
            setUserProducts(data.userProducts);
          } else {
            console.error('Błąd pobierania produktów:', data.error);
          }
        } else {
          const errorData = await response.json();
          console.error('Błąd podczas pobierania produktów:', errorData.error);
        }
      }
    } catch (error) {
      console.error('Błąd podczas żądania do API:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isLoggedIn, username]);

  const refreshProductList = () => {
    fetchData();
  };

  return (
    <div className='left-panel'>
      {isLoggedIn ? (
        <div className="container">
          <div className='user-products'>
            <h2>Twoje produkty</h2>
            <ul>
              {userProducts
                .filter(product => product.amount > 0)
                .map((product, index) => (
                  <li key={index}>
                    {product.amount} {product.unit} - {product.name}
                  </li>
                ))}
            </ul>
          </div>
          <AddProductForm refreshProductList={refreshProductList} />
          <RemoveProductForm refreshProductList={refreshProductList} />
        </div>
      ) : (
        <div className="aaa">
          <h2>Zaloguj się aby zobaczyć swoje produkty!</h2>
          <button onClick={handleLogin}>Zaloguj się</button>
        </div>
      )}
    </div>
  );
  
}

export default LeftPanel;