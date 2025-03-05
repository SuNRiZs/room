import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RoomsList from './components/RoomsList';
import MainView from './components/MainView';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { SettingsProvider } from './SettingsContext';
import SettingsContext from './SettingsContext';
import './App.css';

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

function AppContent() {
  const { settings } = useContext(SettingsContext);
  let wakeLock = null;

  async function enableWakeLock() {
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      wakeLock.addEventListener("release", () => {
        console.log("Wake Lock released");
      });
    } catch (err) {
      console.error("Wake Lock error:", err);
    }
  }

  async function disableWakeLock() {
    if (wakeLock) {
      await wakeLock.release();
      wakeLock = null;
      console.log("Wake Lock disabled");
    }
  }

  function checkScreenTime() {
    const now = new Date();
    const hours = now.getHours();
    const isWorkTime = hours >= 8 && hours < 20; // Время работы: 08:00 - 20:00

    if (isWorkTime) {
      enableWakeLock();
    } else {
      disableWakeLock();
    }
  }

  useEffect(() => {
    checkScreenTime();
    const interval = setInterval(checkScreenTime, 60000); // Проверяем каждую минуту
    return () => clearInterval(interval);
  }, [settings]);

  function enterFullScreen() {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  }

  return (
    <div className="App" onClick={enterFullScreen}>
      <Router>
        <Routes>
          <Route path="/" element={<RoomsList />} />
          <Route path="/rooms/:roomId" element={<MainView />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
