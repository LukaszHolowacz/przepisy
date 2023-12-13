import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/new-recipe-layout.css';
import { useAuth } from '../context/AuthContext';

function NewRecipeLayout() {
  const navigate = useNavigate();
  const [recipeName, setRecipeName] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [steps, setSteps] = useState(['']); 
  const [photo, setPhoto] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('');
  const { userId } = useAuth(); 

  const handleAddStep = () => {
    setSteps((prevSteps) => [...prevSteps, '']);
  };

  const handleRemoveStep = () => {
    setSteps((prevSteps) => prevSteps.slice(0, -1));
  };

  const handleAddProduct = () => {
    const newProduct = { name: '', amount: '' };
    setSelectedProducts((prevProducts) => [...prevProducts, newProduct]);
  };
  
  const handleRemoveProduct = () => {
    if (selectedProducts.length > 0) {
      setSelectedProducts((prevProducts) => prevProducts.slice(0, -1));
    }
  };

  const handleMain = () => {
    navigate('/');
  };

    const handleCategoryChange = (event) => {
        const categoryId = event.target.value;
        const selectedCategory = categories.find((category) => category.id === parseInt(categoryId));
        setSelectedCategory(selectedCategory);
    };  

    const handleAddRecipe = async () => {
        if (!recipeName || !selectedCategory || !selectedProducts || !photo || steps.some(step => !step.trim())) {
            alert("Proszę uzupełnić wszystkie pola.");
            return;
        }
        if (!selectedProducts || !selectedProducts.length || !steps || !steps.length) {
            alert('Przepis musi zawierać co najmniej jeden produkt i jeden krok.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('user_id', userId);
            formData.append('category_id', selectedCategory.id);
            formData.append('name', recipeName);
            formData.append('photo', photo);
            formData.append('steps', JSON.stringify(steps));
            formData.append('products', JSON.stringify(selectedProducts));

            const response = await fetch('http://localhost:3001/api/newRecipe', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert("Pomyślnie dodano przepis!");
                handleMain();
            } else {
                console.error('Błąd dodawania przepisu:', response.statusText);
            }
        } catch (error) {
            console.error('Błąd podczas żądania do API:', error);
        }
    };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseCategories = await fetch('http://localhost:3001/api/categories');
        const categoriesData = await responseCategories.json();
        if (categoriesData.categories) {
          setCategories(categoriesData.categories);
        } else {
          console.error('Błąd pobierania kategorii:', categoriesData.error);
        }

        const responseProducts = await fetch('http://localhost:3001/api/products');
        const productsData = await responseProducts.json();
        if (productsData.products) {
            setProducts(productsData.products);
        } else{
            console.error('Błąd pobierania produktów:', categoriesData.error);
        }
      } catch (error) {
        console.error('Błąd podczas żądania do API:', error);
      }
    };

    fetchData();
  }, []); 

  return (
    <div className='new-recipe-layout'>
      <div className='container'>
        <span className="back-button" onClick={handleMain}>
            Powrót
        </span>
        <h2>Dodaj Przepis</h2>
        <input type="text" value={recipeName} onChange={(e) => setRecipeName(e.target.value)} placeholder='Nazwa przepisu'/>
        <select onChange={handleCategoryChange}>
            <option value="">Wybierz kategorię</option>
            {categories.map(category => (
                <option key={category.id} value={category.id} >
                    {category.name}
                </option>
            ))}
        </select>
        <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />
        <h4>Potrzebne produkty</h4>
        <div className='product-buttons'>
            <button onClick={handleAddProduct}>Dodaj Produkt</button>
            <button onClick={handleRemoveProduct}>Usuń Ostatni Produkt</button>
        </div>
        {selectedProducts.map((product, index) => (
  <div className='product-value' key={index}>
    <select
      onChange={(e) => {
        const productId = e.target.value;
        const selectedProduct = products.find((product) => product.id === parseInt(productId));

        const newSelectedProducts = [...selectedProducts];
        newSelectedProducts[index] = {
          id: productId,
          name: selectedProduct.name,
          amount: product.amount || '',
        };
        setSelectedProducts(newSelectedProducts);
        setSelectedUnit(selectedProduct.unit || ''); // Aktualizacja jednostki
      }}
    >
      <option value="">Wybierz produkt</option>
      {products.map((availableProduct) => (
        <option key={availableProduct.id} value={availableProduct.id}>
          {availableProduct.name}
        </option>
      ))}
    </select>
    <input
      type="text"
      placeholder={`Ilość: (jednostka: ${selectedUnit || 'wybierz jednostkę'})`}
      value={product.amount || ''}
      onChange={(e) => {
        const newSelectedProducts = [...selectedProducts];
        newSelectedProducts[index] = { ...newSelectedProducts[index], amount: e.target.value };
        setSelectedProducts(newSelectedProducts);
      }}
    />
  </div>
))}
        <h4>Lista kroków</h4>
        <div className='step-buttons'>
            <button onClick={handleAddStep}>Dodaj Krok</button>
            <button onClick={handleRemoveStep}>Usuń Ostatni Krok</button>
        </div>
        {steps.map((step, index) => (
            <input
            key={index}
            type="text"
            placeholder={`Krok ${index + 1}`}
            value={step}
            onChange={(e) => {
                const newSteps = [...steps];
                newSteps[index] = e.target.value;
                setSteps(newSteps);
            }}
            />
        ))}
        <button onClick={handleAddRecipe}>Dodaj Przepis</button>
      </div>
    </div>
  );
};

export default NewRecipeLayout;
