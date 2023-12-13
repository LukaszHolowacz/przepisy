import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function RemoveProductForm ({ refreshProductList }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productAmount, setProductAmount] = useState('');
  const { userId } = useAuth(); 

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products);
        } else {
          console.error('Błąd pobierania produktów:', response.statusText);
        }
      } catch (error) {
        console.error('Błąd podczas żądania do API:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleProductChange = (event) => {
    const productId = event.target.value;
    const selectedProduct = products.find((product) => product.id === parseInt(productId));
    setSelectedProduct(selectedProduct);
  };

  const handleAddProductClick = async () => {
    try {
        if (!selectedProduct || !productAmount) {
          alert("Proszę uzupełnić wszystkie pola.");
          return;
        }
        else if( productAmount <= 0) {
          alert("Ilość produktu nie może być mniejsza ani równa 0!");
          return;
        }

        const response = await fetch('http://localhost:3001/api/removeUserProduct', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId, 
                product_id: selectedProduct.id,
                amount: parseInt(productAmount), 
            }),
        });

        if (response.ok) {
            setProductAmount('');
            setSelectedProduct(null);
            alert('Usunięto produkt!');
            refreshProductList();
        } else {
            const errorData = await response.json();

            if (errorData && errorData.error) {
                let errorMessage = errorData.error;
                alert(errorMessage);
            } else {
                console.error('Wystąpił problem podczas usuwania produktu');
            }
        }
    } catch (error) {
        console.error('Błąd podczas żądania do API:', error);
    }
  };

  return (
    <div className='remove-product-form'>
      <h2>Usuń produkt</h2>
      <form>
        <select onChange={handleProductChange}>
        <option value="">Wybierz produkt</option>
        {products.map((product) => (
            <option key={product.id} value={product.id}>
            {product.name}
            </option>
        ))}
        </select>
      </form>
      {selectedProduct && (
        <div>
            <input
                type="text"
                value={productAmount}
                onChange={(e) => setProductAmount(e.target.value)}
                placeholder={`Ilość: ( jednostka: ${selectedProduct.unit} )`}
                required
            />
            <button onClick={handleAddProductClick}>Usuń produkt</button>
        </div>
      )}
    </div>
  );
};

export default RemoveProductForm;
