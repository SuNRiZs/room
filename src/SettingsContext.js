import React, { createContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    API_BASE_URL: 'http://localhost:5000',
    ADMIN_API_BASE_URL: 'http://localhost:5001',
    TOKEN: '',
  });

  useEffect(() => {
    // Загружаем сохранённые настройки при запуске
    const savedSettings = JSON.parse(sessionStorage.getItem('app_settings'));
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);

  useEffect(() => {
    // Сохраняем настройки в памяти приложения
    sessionStorage.setItem('app_settings', JSON.stringify(settings));
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
