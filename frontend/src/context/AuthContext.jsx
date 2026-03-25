import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/me/')
        .then(res => setUser(res.data))
        .catch(() => { localStorage.clear(); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/login/', { email, password });
    const { user, access, refresh } = res.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    const res = await api.post('/register/', { name, email, password, role });
    const { user, access, refresh } = res.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
