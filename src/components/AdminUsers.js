// src/components/AdminUsers.js
import React, { useEffect, useState } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser } from '../services/api';
import '../AdminStyles.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'viewer'
  });

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
      } else {
        await createUser(formData);
      }
      const data = await fetchUsers();
      setUsers(data);
      setEditingUser(null);
      setFormData({ username: '', password: '', role: 'viewer' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, password: '', role: user.role });
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Удалить пользователя?')) {
      try {
        await deleteUser(userId);
        const data = await fetchUsers();
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="admin-users">
      <h3>Список пользователей</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => handleEdit(user)}>Изменить</button>
                <button onClick={() => handleDelete(user.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form className="admin-form" onSubmit={handleSubmit}>
        <h3>{editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}</h3>
        <input type="text" placeholder="Username" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
        <input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
        <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
          <option value="viewer">Viewer</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">{editingUser ? 'Обновить' : 'Создать'}</button>
      </form>
    </div>
  );
};

export default AdminUsers;
