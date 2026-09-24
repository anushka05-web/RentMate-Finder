import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

// Detect production hosting environment to dynamically assign API URLs
const getApiUrl = () => {
  let url = import.meta.env.VITE_API_URL;
  
  if (!url) {
    const isProd = typeof window !== 'undefined' && 
                   window.location.hostname !== 'localhost' && 
                   window.location.hostname !== '127.0.0.1';
    url = isProd 
      ? 'https://rentmate-backend-vvrp.onrender.com/api' 
      : 'http://localhost:5000/api';
  }

  // Defensively ensure URL ends with '/api' to prevent routing mismatches
  if (url && !url.endsWith('/api') && !url.endsWith('/api/')) {
    url = url.endsWith('/') ? `${url}api` : `${url}/api`;
  }
  
  return url;
};

export const API_URL = getApiUrl();
// WebSocket URL: replace http/https with ws/wss
export const WS_URL = API_URL.replace(/^http/, 'ws').replace('/api', '');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set Dark Mode class on body based on local storage
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Fetch current user details if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (data.success) {
          setUser(data.user);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Error fetching user:', err.message);
        // Do not log out immediately on network failure to maintain offline capability,
        // but stop loading
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, role: data.user.role };
      } else {
        setError(data.message || 'Login failed');
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Connection to server failed. Please try again.');
      return { success: false, message: 'Server unreachable' };
    }
  };

  // Register handler
  const register = async (name, email, password, role, phone) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role, phone }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, role: data.user.role };
      } else {
        setError(data.message || 'Registration failed');
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Connection to server failed. Please try again.');
      return { success: false, message: 'Server unreachable' };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    darkMode,
    toggleDarkMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
