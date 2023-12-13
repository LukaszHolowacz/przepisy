import React from 'react';
import {useNavigate} from 'react-router-dom';
import '../styles/navbar.css';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, username, logout } = useAuth();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleNewRecipe = () => {
    navigate('/addNewRecipe');
  }

  return (
    <div className="navbar">
      <input type="text" placeholder="Szukaj przepisów..." />
      {isLoggedIn ? (
        <div className="user-info">
          <span>{`Witaj ${username}!`}</span>
          <button onClick={handleNewRecipe}>Dodaj przepis</button>
          <button onClick={logout}>Wyloguj</button>
        </div>
      ) : (
        <div className="auth-buttons">
          <button onClick={handleLogin}>Zaloguj się</button>
          <button onClick={handleRegister}>Zarejestruj</button>
        </div>
      )}
    </div>
  );
}

export default Navbar;