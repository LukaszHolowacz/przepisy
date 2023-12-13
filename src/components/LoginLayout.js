import React, { useState } from 'react';
import '../styles/login-layout.css';
import {useNavigate} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginLayout() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleMain = () => {
        navigate('/');
    };

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
    
            if (response.ok) {
                const userData = await response.json();
                const { userId } = userData; 
    
                login(username, userId); 
                navigate('/');
            } else {
                const errorData = await response.json();
    
                if (errorData && errorData.error) {
                    let errorMessage = errorData.error;
                    alert(errorMessage);
                } else {
                    console.error('Wystąpił problem podczas rejestracji');
                }
            }
        } catch (error) {
            console.error('Błąd podczas logowania:', error);
        }
    };
    
    

    return (
        <div className="login-layout">
            <div className="container">
                <span className="back-button" onClick={handleMain}>
                    Powrót
                </span>
                <h2>Logowanie</h2>
                <input
                    id="login_username"
                    type="text"
                    placeholder="Nazwa użytkownika"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    id="login_password"
                    type="password"
                    placeholder="Hasło"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <div className="login_remember">
                    <input type="checkbox" id="login_remember" />
                    <label className="login_remember_text" htmlFor="login_remember">
                    Zapamiętaj mnie
                    </label>
                </div>
                <button type="button" onClick={handleLogin}>
                    Zaloguj
                </button>
            </div>
        </div>
    );
}


export default LoginLayout;