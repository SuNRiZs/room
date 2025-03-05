import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminTabletSettings.css';

function AdminTabletSettings() {
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await api.get('/tablet-settings');
        setSchedule(response.schedule || {});
      } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  function handleChange(room, day, field, value) {
    setSchedule({
      ...schedule,
      [room]: {
        ...schedule[room],
        [day]: {
          ...schedule[room]?.[day],
          [field]: Number(value)
        }
      }
    });
  }

  async function saveSettings() {
    try {
      await api.post('/tablet-settings', { schedule });
      alert('Настройки сохранены');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка сохранения');
    }
  }

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className="admin-tablet-settings">
      <h2>Настройки планшетов</h2>
      {Object.keys(schedule).map(room => (
        <div key={room} className="room-settings">
          <h3>{room}</h3>
          <table>
            <thead>
              <tr>
                <th>День</th>
                <th>Начало</th>
                <th>Конец</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(schedule[room] || {}).map(([day, { start, end }]) => (
                <tr key={day}>
                  <td>{["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"][day]}</td>
                  <td>
                    <input type="number" value={start} min="0" max="23" onChange={(e) => handleChange(room, day, 'start', e.target.value)} />
                  </td>
                  <td>
                    <input type="number" value={end} min="0" max="23" onChange={(e) => handleChange(room, day, 'end', e.target.value)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <button onClick={saveSettings}>Сохранить</button>
    </div>
  );
}

export default AdminTabletSettings;
