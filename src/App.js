import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RoomsList from './components/RoomsList';
import MainView from './components/MainView';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './ProtectedRoute';
import { TOKEN } from './config';

function App() {
  useEffect(() => {
    // Проверяем и сохраняем API_TOKEN при запуске приложения
    if (!localStorage.getItem("apiToken") && TOKEN) {
      localStorage.setItem("apiToken", TOKEN);
    }
  }, []);

  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/" element={<RoomsList />} />
      <Route path="/rooms/:roomId" element={<MainView />} />

      {/* Маршруты для админки */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/*" element={<ProtectedRoute element={<AdminDashboard />} />} />

      {/* Перенаправление для неизвестных маршрутов */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
