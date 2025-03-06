import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ADMIN_API_BASE_URL, TOKEN } from '../config';
import '../AdminStyles.css';

function AdminTabletSettings() {
  const [rooms, setRooms] = useState([]);               // Список переговорок
  const [selectedTablet, setSelectedTablet] = useState(null);  // Текущий планшет для редактирования
  const [schedule, setSchedule] = useState({});         // Расписание выбранного планшета
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTabletSettings();
  }, []);

  // Загружаем список переговорок + планшетов
  const fetchTabletSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${ADMIN_API_BASE_URL}/tablet-settings`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      setRooms(response.data.rooms || []);
    } catch (error) {
      console.error('Ошибка загрузки настроек планшетов:', error);
    } finally {
      setLoading(false);
    }
  };

  // Клик по планшету: открываем его расписание
  const handleTabletClick = (tablet) => {
    setSelectedTablet(tablet);
    setSchedule(tablet.schedule || {});
  };

  // Сохранение расписания для планшета
  const handleSaveSettings = async () => {
    if (!selectedTablet) return;
    try {
      await axios.post(`${ADMIN_API_BASE_URL}/tablet-settings`, {
        device_id: selectedTablet.device_id,
        schedule
      }, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      alert('Настройки планшета сохранены');
      // Обновляем список
      fetchTabletSettings();
      setSelectedTablet(null);
    } catch (err) {
      console.error('Ошибка сохранения настроек:', err);
      alert('Ошибка сохранения');
    }
  };

  // Удаление планшета
  const handleDeleteTablet = async (device_id) => {
    if (!window.confirm('Удалить этот планшет?')) return;
    try {
      await axios.delete(`${ADMIN_API_BASE_URL}/tablet-settings/${device_id}`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      alert('Планшет удален');
      // Перезагружаем список
      fetchTabletSettings();
      setSelectedTablet(null);
    } catch (error) {
      console.error('Ошибка удаления планшета:', error);
      alert('Ошибка удаления');
    }
  };

  // Закрыть режим редактирования
  const handleBack = () => {
    setSelectedTablet(null);
  };

  // Меняем отдельные поля расписания (start/end)
  const handleDayChange = (dayStr, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [dayStr]: {
        ...prev[dayStr],
        [field]: Number(value)
      }
    }));
  };

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className="admin-tablet-settings">
      <h2>Настройки планшетов</h2>

      {/* Если планшет не выбран, показываем список переговорок */}
      {!selectedTablet ? (
        <div className="room-list">
          {rooms.map(room => (
            <div key={room.display_name} className="room-block">
              <h3>{room.name}</h3>
              {room.tablets.length === 0 && <p>Планшеты не зарегистрированы</p>}
              <ul>
                {room.tablets.map(t => (
                  <li key={t.device_id} style={{ marginBottom: '1rem' }}>
                    <button onClick={() => handleTabletClick(t)}>
                      {t.device_id} (Последний вход: {t.last_seen})
                    </button>
                    <button
                      style={{ marginLeft: '1rem' }}
                      onClick={() => handleDeleteTablet(t.device_id)}
                    >
                      Удалить
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        // Режим редактирования расписания
        <div className="tablet-settings">
          <h3>Настройки планшета {selectedTablet.device_id}</h3>
          <button onClick={handleBack}>Назад</button>
          <table className="admin-table">
            <thead>
              <tr>
                <th>День</th>
                <th>Начало</th>
                <th>Конец</th>
              </tr>
            </thead>
            <tbody>
              {[0,1,2,3,4,5,6].map(day => {
                const label = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'][day];
                const { start=8, end=20 } = schedule[day] || {};
                return (
                  <tr key={day}>
                    <td>{label}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={start}
                        onChange={(e) => handleDayChange(String(day), 'start', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={end}
                        onChange={(e) => handleDayChange(String(day), 'end', e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button onClick={handleSaveSettings} style={{ marginTop: '1rem' }}>
            Сохранить
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminTabletSettings;
