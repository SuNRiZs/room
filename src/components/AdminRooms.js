import React, { useEffect, useState } from 'react';
import { fetchRooms, createRoom, updateRoom, deleteRoom } from '../services/api';
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
    connector_type: 'exchange'
  });

  useEffect(() => {
    async function loadRooms() {
      try {
        const data = await fetchRooms();
        setRooms(data);
      } catch (err) {
        console.error(err);
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
      const data = await fetchRooms();
      setRooms(data);
      setEditingRoom(null);
      setFormData({
        server: '',
        login: '',
        password: '',
        domain: '',
        display_name: '',
        connector_type: 'exchange'
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      server: room.server || '',
      login: room.login || '',
      password: '',
      domain: room.domain || '',
      display_name: room.display_name || '',
      connector_type: room.connector_type || 'exchange'
    });
  };

  const handleDelete = async (roomId) => {
    if (window.confirm('Удалить переговорку?')) {
      try {
        await deleteRoom(roomId);
        const data = await fetchRooms();
        setRooms(data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="admin-rooms">
      <h2>Список переговорок</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Сервер</th>
            <th>Домен</th>
            <th>Коннектор</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map(room => (
            <tr key={room.id}>
              <td>{room.id}</td>
              <td>{room.display_name}</td>
              <td>{room.server}</td>
              <td>{room.domain}</td>
              <td>{room.connector_type}</td>
              <td>
                <button onClick={() => handleEdit(room)}>✏️ Редактировать</button>
                <button onClick={() => handleDelete(room.id)}>🗑 Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form className="admin-form" onSubmit={handleSubmit}>
        <h3>{editingRoom ? 'Редактировать переговорку' : 'Добавить переговорку'}</h3>
        
        <label>Название:</label>
        <input type="text" value={formData.display_name} onChange={e => setFormData({ ...formData, display_name: e.target.value })} required />

        <label>Сервер:</label>
        <input type="text" value={formData.server} onChange={e => setFormData({ ...formData, server: e.target.value })} required />

        <label>Логин:</label>
        <input type="text" value={formData.login} onChange={e => setFormData({ ...formData, login: e.target.value })} required />

        <label>Пароль:</label>
        <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />

        <label>Домен:</label>
        <input type="text" value={formData.domain} onChange={e => setFormData({ ...formData, domain: e.target.value })} />

        <label>Тип коннектора:</label>
        <select value={formData.connector_type} onChange={e => setFormData({ ...formData, connector_type: e.target.value })}>
          <option value="exchange">Exchange</option>
          <option value="other">Другой</option>
        </select>

        <button type="submit">{editingRoom ? 'Обновить' : 'Создать'}</button>
      </form>
    </div>
  );
};

export default AdminRooms;
