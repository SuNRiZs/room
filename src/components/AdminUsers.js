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
    <div className="admin-users admin-section">
      <h2 className="admin-heading">Список пользователей</h2>
      <div className="users-table-container">
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
                  <button className="admin-button edit-button" onClick={() => handleEdit(user)}>✏️</button>
                  <button className="admin-button delete-button" onClick={() => handleDelete(user.id)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form className="admin-form compact-form" onSubmit={handleSubmit}>
        <h3 className="admin-subheading">{editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Role:</label>
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <button className="admin-button submit-button" type="submit">
          {editingUser ? 'Обновить' : 'Создать'}
        </button>
      </form>
    </div>
  );
};

export default AdminUsers;