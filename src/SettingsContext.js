// src/SettingsContext.js
import React, { createContext, useState } from 'react';

const defaultSettings = {
  API_BASE_URL: '',
  ADMIN_API_BASE_URL: '',
  TOKEN: '',
  app_id: '',
  // Для защиты глобальных настроек (можно менять по необходимости)
  globalSettingsAuthorized: true 
};

const SettingsContext = createContext({
  settings: defaultSettings,
  setSettings: () => {}
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
