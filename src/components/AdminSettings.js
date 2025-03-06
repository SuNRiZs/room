import React, { useContext, useState } from 'react';
import SettingsContext from '../SettingsContext';
import axios from 'axios';
import '../AdminStyles.css';


function AdminSettings() {
  const { settings, setSettings } = useContext(SettingsContext);
  const [apiBaseUrl, setApiBaseUrl] = useState(settings.API_BASE_URL);
  const [adminApiBaseUrl, setAdminApiBaseUrl] = useState(settings.ADMIN_API_BASE_URL);
  const [token, setToken] = useState(settings.TOKEN);
  const [status, setStatus] = useState('Проверка...');

  async function checkApiStatus() {
    try {
      await axios.get(`${apiBaseUrl}/health`);
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
      <h2>Глобальные настройки</h2>
      <label>
        API_BASE_URL:
        <input type="text" value={apiBaseUrl} onChange={e => setApiBaseUrl(e.target.value)} />
      </label>
      <label>
        ADMIN_API_BASE_URL:
        <input type="text" value={adminApiBaseUrl} onChange={e => setAdminApiBaseUrl(e.target.value)} />
      </label>
      <label>
        Admin Token:
        <input type="text" value={token || ''} onChange={e => setToken(e.target.value)} />
      </label>
      <button type="button" onClick={checkApiStatus}>Проверить соединение</button>
      <p>Status: {status}</p>
      <button type="button" onClick={saveSettings}>Сохранить настройки</button>
    </div>
  );
}

export default AdminSettings;
