import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    // TEMPORARY: Use dummy data when no backend
    // TODO: Replace with real API call when backend is ready
    
    // Check if we have a dummy token
    if (token && token.startsWith('dummy-token-')) {
      const dummyUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        balance: 50000,
      };
      setUser(dummyUser);
      setLoading(false);
      return;
    }
    
    /* Real API call (uncomment when backend is ready):
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
    */
    
    setLoading(false);
  };

  const login = async (email, password) => {
    // TEMPORARY: Dummy authentication for testing (No backend required)
    // TODO: Replace with real API call when backend is ready
    
    if (email && password) {
      // Create dummy user data
      const dummyToken = 'dummy-token-' + Date.now();
      const dummyUser = {
        id: '1',
        name: 'Test User',
        email: email,
        balance: 50000,
      };
      
      localStorage.setItem('token', dummyToken);
      setToken(dummyToken);
      setUser(dummyUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${dummyToken}`;
      
      return { success: true };
    }
    
    return { 
      success: false, 
      message: 'Please enter email and password' 
    };

    /* Real API call (uncomment when backend is ready):
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
    */
  };

  const register = async (name, email, password) => {
    // TEMPORARY: Dummy registration for testing (No backend required)
    // TODO: Replace with real API call when backend is ready
    
    if (name && email && password) {
      // Create dummy user data
      const dummyToken = 'dummy-token-' + Date.now();
      const dummyUser = {
        id: '1',
        name: name,
        email: email,
        balance: 50000,
      };
      
      localStorage.setItem('token', dummyToken);
      setToken(dummyToken);
      setUser(dummyUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${dummyToken}`;
      
      return { success: true };
    }
    
    return { 
      success: false, 
      message: 'Please fill all fields' 
    };

    /* Real API call (uncomment when backend is ready):
    try {
      const response = await axios.post('/api/auth/register', { name, email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
    */
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
