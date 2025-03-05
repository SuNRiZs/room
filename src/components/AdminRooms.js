import React, { useEffect, useState } from 'react';
import { fetchRooms, createRoom, updateRoom, deleteRoom } from '../services/api';
import { Link } from 'react-router-dom';

function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    server: '',
    port: 5000,
    login: '',
    password: '',
    domain: '',
    display_name: '',
    connector_type: 'exchange'
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = () => {
    fetchRooms()
      .then(res => {
        setRooms(res.data);
      })
      .catch(err => {
        console.error('Ошибка загрузки переговорок:', err);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRoom) {
      // обновление
      updateRoom(editingRoom.id, formData)
        .then(() => {
          loadRooms();
          setEditingRoom(null);
          setFormData({ ...formData, server: '', login: '', password: '', display_name: '' });
        })
        .catch(err => console.error(err));
    } else {
      // создание
      createRoom(formData)
        .then(() => {
          loadRooms();
          setFormData({ ...formData, server: '', login: '', password: '', display_name: '' });
        })
        .catch(err => console.error(err));
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData(room);
  };

  const handleDelete = (id) => {
    deleteRoom(id)
      .then(() => loadRooms())
      .catch(err => console.error(err));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Управление переговорками</h2>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Отображаемое имя</th>
            <th>Сервер</th>
            <th>Порт</th>
            <th>Ссылка</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td>{room.id}</td>
              <td>{room.display_name}</td>
              <td>{room.server}</td>
              <td>{room.port}</td>
              
              {/* Ссылка на публичную страницу */}
              <td>
                <Link to={`/rooms/${room.id}`} target="_blank">
                  Открыть
                </Link>
              </td>
              
              <td>
                <button onClick={() => handleEdit(room)}>Редактировать</button>
                <button onClick={() => handleDelete(room.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>{editingRoom ? 'Редактировать переговорку' : 'Добавить переговорку'}</h3>
      <form onSubmit={handleSubmit}>
        <label>Сервер:</label>
        <input
          type="text"
          value={formData.server}
          onChange={(e) => setFormData({ ...formData, server: e.target.value })}
        />
        <label>Порт:</label>
        <input
          type="number"
          value={formData.port}
          onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value, 10) })}
        />
        <label>Логин:</label>
        <input
          type="text"
          value={formData.login}
          onChange={(e) => setFormData({ ...formData, login: e.target.value })}
        />
        <label>Пароль:</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <label>Домен:</label>
        <input
          type="text"
          value={formData.domain}
          onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
        />
        <label>Название (display_name):</label>
        <input
          type="text"
          value={formData.display_name}
          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
        />
        <label>Тип коннектора:</label>
        <select
          value={formData.connector_type}
          onChange={(e) => setFormData({ ...formData, connector_type: e.target.value })}
        >
          <option value="exchange">Exchange</option>
          <option value="bitrix">Bitrix</option>
        </select>
        
        <button type="submit" style={{ marginLeft: '1rem' }}>
          {editingRoom ? 'Сохранить' : 'Добавить'}
        </button>
      </form>
    </div>
  );
}

export default AdminRooms;
