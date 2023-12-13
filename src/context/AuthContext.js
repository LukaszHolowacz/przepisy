import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState(''); // Dodane user_id

    const login = (user, userId) => {
        setLoggedIn(true);
        setUsername(user);
        setUserId(userId);
    };

    const logout = () => {
        setLoggedIn(false);
        setUsername('');
        setUserId('');
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, username, userId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
