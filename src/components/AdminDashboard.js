import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import AdminRooms from './AdminRooms';
import AdminUsers from './AdminUsers';
import AdminTabletSettings from './AdminTabletSettings';
import AdminSettings from './AdminSettings';
import SettingsContext from '../SettingsContext';
import './AdminDashboard.css';

function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <nav>
        <ul>
          <li><Link to="/admin/settings">Глобальные настройки</Link></li>
          <li><Link to="/admin/rooms">Переговорки</Link></li>
          <li><Link to="/admin/users">Пользователи</Link></li>
          <li><Link to="/admin/tablet-settings">Настройки планшетов</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="rooms" element={<AdminRooms />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="tablet-settings" element={<AdminTabletSettings />} />
        <Route path="settings" element={<AdminSettings />} />
      </Routes>
    </div>
  );
}

export default AdminDashboard;
