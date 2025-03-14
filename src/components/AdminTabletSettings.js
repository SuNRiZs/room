import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ADMIN_API_BASE_URL, TOKEN } from '../config';
import '../AdminStyles.css';

function AdminTabletSettings() {
  const [rooms, setRooms] = useState([]);
  const [selectedTablet, setSelectedTablet] = useState(null);
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTabletSettings();
  }, []);

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

  const handleTabletClick = (tablet) => {
    setSelectedTablet(tablet);
    setSchedule(tablet.schedule || {});
  };

  const handleSaveSettings = async () => {
    if (!selectedTablet) return;
    try {
      await axios.post(`${ADMIN_API_BASE_URL}/tablet-settings`, {
        device_id: selectedTablet.device_id,
        schedule,
        show_meeting_subject: selectedTablet.show_meeting_subject // Новый параметр
      }, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      alert('Настройки планшета сохранены');
      fetchTabletSettings();
      setSelectedTablet(null);
    } catch (err) {
      console.error('Ошибка сохранения настроек:', err);
      alert('Ошибка сохранения');
    }
  };

  const handleDeleteTablet = async (device_id, room_id) => {
    if (!window.confirm('Удалить этот планшет?')) return;
    try {
      await axios.delete(`${ADMIN_API_BASE_URL}/tablet-settings/${device_id}?room_id=${room_id}`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      alert('Планшет удален');
      fetchTabletSettings();
      setSelectedTablet(null);
    } catch (error) {
      console.error('Ошибка удаления планшета:', error);
      alert('Ошибка удаления');
    }
  };

  const handleBack = () => {
    setSelectedTablet(null);
  };

  const handleDayChange = (dayStr, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [dayStr]: {
        ...prev[dayStr],
        [field]: Number(value)
      }
    }));
  };

  const handleShowMeetingSubjectChange = (e) => {
    if (selectedTablet) {
      setSelectedTablet(prev => ({
        ...prev,
        show_meeting_subject: e.target.checked
      }));
    }
  };

  if (loading) return <p className="admin-loading">Загрузка...</p>;

  return (
    <div className="admin-tablet-settings admin-section">
      <h2 className="admin-heading">Настройки планшетов</h2>

      {!selectedTablet ? (
        <div className="room-list">
          {rooms.map(room => (
            <div key={room.id} className="room-block">
              <h3 className="admin-subheading">{room.display_name}</h3>
              {room.tablets.length === 0 && <p>Планшеты не зарегистрированы</p>}
              <ul>
                {room.tablets.map(t => (
                  <li key={t.device_id} className="tablet-item">
                    <button className="admin-button edit-button" onClick={() => handleTabletClick(t)}>
                      {t.device_id} (Последний вход: {t.last_seen})
                    </button>
                    <button
                      className="admin-button delete-button"
                      onClick={() => handleDeleteTablet(t.device_id, room.id)}
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
        <div className="tablet-settings">
          <h3 className="admin-subheading">Настройки планшета {selectedTablet.device_id}</h3>
          <button className="admin-button back-button" onClick={handleBack}>Назад</button>
          <table className="admin-table">
            <thead>
              <tr>
                <th>День</th>
                <th>Начало</th>
                <th>Конец</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3, 4, 5, 6].map(day => {
                const label = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][day];
                const { start = 8, end = 20 } = schedule[day] || {};
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
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={selectedTablet.show_meeting_subject || false}
                onChange={handleShowMeetingSubjectChange}
              />{' '}
              Показывать тему встречи
            </label>
          </div>
          <button className="admin-button submit-button" onClick={handleSaveSettings}>
            Сохранить
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminTabletSettings;