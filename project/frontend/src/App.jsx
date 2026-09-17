import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('railblock_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('railblock_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('railblock_token');
    localStorage.removeItem('railblock_user');
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return <Dashboard token={token} user={user} onLogout={handleLogout} />;
}
