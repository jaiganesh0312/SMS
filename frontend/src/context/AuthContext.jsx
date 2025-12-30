import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/config/axiosConfig';

const AuthContext = createContext(null);

/**
 * AuthProvider component to manage authentication state
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Initialize auth state from localStorage on mount
    useEffect(() => {
        const initAuth = () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Error parsing stored auth data:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    /**
     * Login function
     * @param {Object} userData - User data from login response
     * @param {string} token - JWT token
     */
    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    };

    /**
     * Logout function
     */
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    };

    /**
     * Update user data
     * @param {Object} userData - Updated user data
     */
    const updateUser = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
