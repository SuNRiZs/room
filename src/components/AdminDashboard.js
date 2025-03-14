import React from 'react';
import { Link, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminRooms from './AdminRooms';
import AdminUsers from './AdminUsers';
import AdminTabletSettings from './AdminTabletSettings';
import '../AdminStyles.css';

function AdminDashboard() {
  const location = useLocation();

  return (
    <div className="admin-dashboard">
      <nav className="admin-tabs">
        <Link
          to="/admin/rooms"
          className={`admin-tab ${location.pathname === '/admin/rooms' ? 'active' : ''}`}
        >
          Переговорки
        </Link>
        <Link
          to="/admin/users"
          className={`admin-tab ${location.pathname === '/admin/users' ? 'active' : ''}`}
        >
          Пользователи
        </Link>
        <Link
          to="/admin/tablet-settings"
          className={`admin-tab ${location.pathname === '/admin/tablet-settings' ? 'active' : ''}`}
        >
          Настройки планшетов
        </Link>
      </nav>
      <div className="admin-content">
        <Routes>
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="tablet-settings" element={<AdminTabletSettings />} />
          <Route index element={<Navigate to="rooms" />} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminDashboard;