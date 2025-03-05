import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import useApi from '../services/api';
import SettingsContext from '../SettingsContext';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setSettings, settings } = useContext(SettingsContext);
  const navigate = useNavigate();
  const { adminLogin } = useApi();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await adminLogin({ username, password });
      if (response.data.token) {
        setSettings({ ...settings, TOKEN: response.data.token });
        navigate('/admin');
      } else {
        alert('Ошибка входа');
      }
    } catch (error) {
      alert('Ошибка входа');
    }
  };

  return (
    <div className="login-container">
      <h2>Вход в Админку</h2>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Логин" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Войти</button>
      </form>
    </div>
  );
};

export default AdminLogin;
