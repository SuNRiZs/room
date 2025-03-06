import React from 'react';
import { Link, Routes, Route, Navigate } from 'react-router-dom'; // ✅ Добавляем Navigate
import AdminRooms from './AdminRooms';
import AdminUsers from './AdminUsers';
import AdminTabletSettings from './AdminTabletSettings';
import '../AdminStyles.css';

function AdminDashboard() {
    return (
      <div className="admin-dashboard">
        <nav className="admin-nav">
          <ul>
            <li><Link to="/admin/rooms">Переговорки</Link></li>
            <li><Link to="/admin/users">Пользователи</Link></li>
            <li><Link to="/admin/tablet-settings">Настройки планшетов</Link></li>
          </ul>
        </nav>
        <div className="admin-content">
          <Routes>
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="tablet-settings" element={<AdminTabletSettings />} />
            {/* ✅ Теперь Navigate определен и используется правильно */}
            <Route index element={<Navigate to="rooms" />} />
          </Routes>
        </div>
      </div>
    );
}

export default AdminDashboard;
