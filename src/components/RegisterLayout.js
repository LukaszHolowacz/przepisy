import React, { useState } from 'react';
import '../styles/register-layout.css';
import {useNavigate} from 'react-router-dom';

function RegisterLayout(){
    const navigate = useNavigate();
    const bcrypt = require('bcryptjs');

    const handleMain = () => {
        navigate('/');
    };  

    const handleLogin = () => {
      navigate('/login');
    };  

    const [userData, setUserData] = useState({
        username: '',
        email: '',
        password: '',
        retyped_password: '',
    });
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleButtonClick = async () => {
      const { username, email, password, retyped_password } = userData;

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      const isPasswordValid = passwordRegex.test(password);
      const isPasswordNotSimilarToUsername = password.toLowerCase() !== username.toLowerCase();
      const isUsernameValid = username.length >= 4;
      const isEmailValid = email.includes('@');
  
      if (
        password !== retyped_password ||
        !isPasswordValid ||
        !isPasswordNotSimilarToUsername ||
        username === "" ||
        email === "" ||
        password === "" ||
        retyped_password === "" ||
        !isUsernameValid ||  
        !isEmailValid      
      ) {
          let errorMessage = '';
  
          if (username === "" || email === "" || password === "" || retyped_password === "") {
            errorMessage = 'Żadne z pól nie może być puste!';
          } else if (!isPasswordValid) {
            errorMessage = 'Hasło musi zawierać co najmniej 8 znaków, w tym małe i duże litery, liczby oraz znak specjalny.';
          } else if (!isPasswordNotSimilarToUsername) {
            errorMessage = 'Hasło nie może być podobne do pseudonimu.';
          } else if (password !== retyped_password) {
            errorMessage = 'Hasło i ponowne wprowadzenie hasła nie pasują do siebie!';
          } 
  
          alert(errorMessage);
      }
      else{
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUserData = {
          username,
          email,
          password: hashedPassword,
        }
    
        try {
            const response = await fetch('http://localhost:3001/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUserData),
            });
    
            if (response.ok) {
                handleLogin();
                alert("Rejestracja udana! Kliknij ok aby się zalogować");
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
            console.error('Błąd podczas rejestracji:', error);
        }
      }
    };

    return (
      <div className="register-layout">
          <div className="container">
              <span className="back-button" onClick={handleMain}>Powrót</span>
              <h2>Rejestracja</h2>
              <input name="username" type="text" placeholder='Nazwa użytkownika' value={userData.username} onChange={handleInputChange}/>
              <input name="email" type="email" placeholder='E-mail' value={userData.email} onChange={handleInputChange}/>
              <div className="passwords-container">
                  <input id="password" name='password' type='password' placeholder='Hasło' value={userData.password} onChange={handleInputChange}/>
                  <input name='retyped_password' type='password' placeholder='Powtórz hasło' value={userData.retyped_password} onChange={handleInputChange}/>
              </div>
              <button type='button' onClick={handleButtonClick}>Zarejestruj</button>
          </div>
      </div>
    );
};

export default RegisterLayout;