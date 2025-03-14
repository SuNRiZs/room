import React, { useEffect, useState } from 'react';
import { fetchAdminRooms, createRoom, updateRoom, deleteRoom } from '../services/api';
import '../AdminStyles.css';

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    server: '',
    login: '',
    password: '',
    domain: '',
    display_name: '',
    connector_type: 'exchange',
    polling_frequency: 30 // Добавляем поле, если оно нужно
  });

  useEffect(() => {
    async function loadRooms() {
      try {
        const data = await fetchAdminRooms(); // Используем новый запрос для админки
        console.log('Полученные данные комнат:', data); // Для отладки
        setRooms(data);
      } catch (err) {
        console.error('Ошибка загрузки комнат:', err);
      }
    }
    loadRooms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, formData);
      } else {
        await createRoom(formData);
      }
      const data = await fetchAdminRooms();
      setRooms(data);
      setEditingRoom(null);
      setFormData({
        server: '',
        login: '',
        password: '',
        domain: '',
        display_name: '',
        connector_type: 'exchange',
        polling_frequency: 30
      });
    } catch (err) {
      console.error('Ошибка сохранения:', err);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      server: room.server || '',
      login: room.login || '',
      password: '', // Пароль не отображаем для безопасности
      domain: room.domain || '',
      display_name: room.display_name || '',
      connector_type: room.connector_type || 'exchange',
      polling_frequency: room.polling_frequency || 30 // Добавляем поле
    });
    console.log('Редактируемая комната:', room); // Для отладки
  };

  const handleDelete = async (roomId) => {
    if (window.confirm('Удалить переговорку?')) {
      try {
        await deleteRoom(roomId);
        const data = await fetchAdminRooms();
        setRooms(data);
      } catch (err) {
        console.error('Ошибка удаления:', err);
      }
    }
  };

  return (
    <div className="admin-rooms admin-section">
      <h2 className="admin-heading">Список переговорок</h2>
      <div className="rooms-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Сервер</th>
              <th>Логин</th>
              <th>Домен</th>
              <th>Коннектор</th>
              <th>Частота опроса</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id}>
                <td>{room.id}</td>
                <td>{room.display_name}</td>
                <td>{room.server}</td>
                <td>{room.login || 'Не указан'}</td>
                <td>{room.domain || 'Не указан'}</td>
                <td>{room.connector_type || 'Не указан'}</td>
                <td>{room.polling_frequency || 'Не указан'}</td>
                <td>
                  <button className="admin-button edit-button" onClick={() => handleEdit(room)}>✏️</button>
                  <button className="admin-button delete-button" onClick={() => handleDelete(room.id)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="admin-form compact-form" onSubmit={handleSubmit}>
        <h3 className="admin-subheading">{editingRoom ? 'Редактировать переговорку' : 'Добавить переговорку'}</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Название:</label>
            <input
              type="text"
              value={formData.display_name}
              onChange={e => setFormData({ ...formData, display_name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Сервер:</label>
            <input
              type="text"
              value={formData.server}
              onChange={e => setFormData({ ...formData, server: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Логин:</label>
            <input
              type="text"
              value={formData.login}
              onChange={e => setFormData({ ...formData, login: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Пароль:</label>
            <input
              type="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Домен:</label>
            <input
              type="text"
              value={formData.domain}
              onChange={e => setFormData({ ...formData, domain: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Тип коннектора:</label>
            <select
              value={formData.connector_type}
              onChange={e => setFormData({ ...formData, connector_type: e.target.value })}
            >
              <option value="exchange">Exchange</option>
              <option value="other">Другой</option>
            </select>
          </div>
          <div className="form-group">
            <label>Частота опроса (мин):</label>
            <input
              type="number"
              min="1"
              value={formData.polling_frequency}
              onChange={e => setFormData({ ...formData, polling_frequency: Number(e.target.value) })}
            />
          </div>
        </div>
        <button className="admin-button submit-button" type="submit">
          {editingRoom ? 'Обновить' : 'Создать'}
        </button>
      </form>
    </div>
  );
};

export default AdminRooms;