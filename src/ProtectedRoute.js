import React from 'react';
import { Navigate } from 'react-router-dom'; // ✅ Добавляем импорт Navigate

const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem("adminToken");

  return token ? element : <Navigate to="/admin/login" />;
};

export default ProtectedRoute;
