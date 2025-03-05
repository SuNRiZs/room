import React, { useContext, useState } from 'react';
import SettingsContext from '../SettingsContext';
import api from '../services/api';
import './AdminSettings.css';

function AdminSettings() {
  const { settings, setSettings } = useContext(SettingsContext);
  const [apiBaseUrl, setApiBaseUrl] = useState(settings.API_BASE_URL);
  const [adminApiBaseUrl, setAdminApiBaseUrl] = useState(settings.ADMIN_API_BASE_URL);
  const [token, setToken] = useState(settings.TOKEN);
  const [status, setStatus] = useState('Проверка...');

  async function checkApiStatus() {
    try {
      await api.get('/health');
      setStatus('✅ API доступен');
    } catch (error) {
      setStatus('❌ API недоступен');
    }
  }

  function saveSettings() {
    setSettings({
      API_BASE_URL: apiBaseUrl,
      ADMIN_API_BASE_URL: adminApiBaseUrl,
      TOKEN: token,
    });
    alert('Настройки сохранены');
  }

  return (
    <div className="admin-settings">
      <h2>Основные настройки</h2>
      <label>API Base URL:</label>
      <input type="text" value={apiBaseUrl} onChange={(e) => setApiBaseUrl(e.target.value)} />
      
      <label>Admin API Base URL:</label>
      <input type="text" value={adminApiBaseUrl} onChange={(e) => setAdminApiBaseUrl(e.target.value)} />
      
      <label>API Токен:</label>
      <input type="text" value={token} onChange={(e) => setToken(e.target.value)} />
      
      <p>Статус соединения: <strong>{status}</strong></p>
      
      <button onClick={saveSettings}>Сохранить</button>
      <button onClick={checkApiStatus}>Проверить API</button>
    </div>
  );
}

export default AdminSettings;
