import React, { useState } from 'react';
import { adminLogin } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    adminLogin({ username, password })
      .then(res => {
        if (res.data.success) {
          navigate('/admin/dashboard');
        } else {
          alert('Неверные данные для входа');
        }
      })
      .catch(err => {
        console.error('Ошибка входа:', err);
        alert('Ошибка входа');
      });
  };

  return (
    <div className="admin-login">
      <h2>Вход в админку</h2>
      <form onSubmit={onSubmit}>
        <label>Имя пользователя:</label>
        <input
          type="text"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          required
        />
        <label>Пароль:</label>
        <input
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
        />
        <button type="submit">Войти</button>
      </form>
    </div>
  );
};

export default AdminLogin;
