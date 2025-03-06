import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/api';
import '../AdminStyles.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await adminLogin({ username, password });
      console.log("Ответ от сервера:", data);

      if (data && data.success && data.token) {
        localStorage.setItem("adminToken", data.token); // Сохраняем токен
        navigate('/admin'); // Перенаправление в админку
      } else {
        alert('Ошибка входа');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка входа');
    }
  };

  return (
    <div className="login-container">
      <h2>Вход в админку</h2>
      <form onSubmit={handleLogin}>
        <label>
          Логин:
          <input value={username} onChange={e => setUsername(e.target.value)} />
        </label>
        <label>
          Пароль:
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        <button type="submit">Войти</button>
      </form>
    </div>
  );
};

export default AdminLogin;
