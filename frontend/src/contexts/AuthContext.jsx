import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, isAuthenticated, tokenManager } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkAuth = useCallback(async () => {
    if (isAuthenticated()) {
      try {
        const response = await authAPI.getUser();
        setUser(response.data);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUser(null);
        setIsLoggedIn(false);
        tokenManager.removeTokens();
      }
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { access, refresh, user } = response.data;
      
      if (access) {
        tokenManager.setToken(access);
      }
      
      if (refresh) {
        tokenManager.setRefreshToken(refresh);
      }
      
      setUser(user);
      setIsLoggedIn(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      // Don't auto-login after registration
      // Just return the response with success message
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.removeTokens();
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const value = {
    user,
    loading,
    isLoggedIn,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};