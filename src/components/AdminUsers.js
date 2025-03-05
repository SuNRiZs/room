import React, { useEffect, useState } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser } from '../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'viewer'
  });

  const loadUsers = () => {
    fetchUsers()
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const resetForm = () => {
    setFormData({ username: '', password: '', role: 'viewer' });
    setEditingUser(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, formData)
        .then(() => {
          loadUsers();
          resetForm();
        })
        .catch(err => console.error(err));
    } else {
      createUser(formData)
        .then(() => {
          loadUsers();
          resetForm();
        })
        .catch(err => console.error(err));
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, password: '', role: user.role });
  };

  const handleDelete = (id) => {
    deleteUser(id)
      .then(() => loadUsers())
      .catch(err => console.error(err));
  };

  return (
    <div>
      <h3>Список пользователей</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя пользователя</th>
            <th>Роль</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => handleEdit(u)}>Редактировать</button>
                <button onClick={() => handleDelete(u.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>{editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}</h3>
      <form onSubmit={handleSubmit}>
        <label>Имя пользователя:</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e)=>setFormData({...formData, username: e.target.value})}
          required
        />
        <label>Пароль: {editingUser ? '(оставьте пустым, если не менять)' : ''}</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e)=>setFormData({...formData, password: e.target.value})}
        />
        <label>Роль:</label>
        <select
          value={formData.role}
          onChange={(e)=>setFormData({...formData, role: e.target.value})}
        >
          <option value="viewer">Просмотр</option>
          <option value="editor">Редактирование</option>
          <option value="admin">Администрирование</option>
        </select>
        <button type="submit">
          {editingUser ? 'Сохранить' : 'Добавить'}
        </button>
      </form>
    </div>
  );
};

export default AdminUsers;
