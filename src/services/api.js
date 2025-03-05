import axios from 'axios';
import config from '../config';

const { API_BASE_URL, ADMIN_API_BASE_URL } = config;

axios.defaults.withCredentials = true;

const createApiInstance = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
};

const apiMethods = {
  fetchRooms: async (token) => {
    const api = createApiInstance(token);
    try {
      const response = await api.get(`/public/rooms`);
      return response.data || [];
    } catch (error) {
      console.error('Ошибка получения комнат:', error);
      return [];
    }
  },
  getRoomStatus: async (roomId, token) => {
    const api = createApiInstance(token);
    try {
      const response = await api.get(`/rooms/${roomId}/status`);
      return response.data || null;
    } catch (error) {
      console.error('Ошибка получения статуса комнаты:', error);
      return null;
    }
  },
  bookRoom: async (roomId, duration, subject, token) => {
    const api = createApiInstance(token);
    try {
      const formData = new URLSearchParams();
      formData.append('duration', duration);
      formData.append('subject', subject);
      const response = await api.post(`/rooms/${roomId}/book`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return response.data || null;
    } catch (error) {
      console.error('Ошибка бронирования комнаты:', error);
      return null;
    }
  },
  adminLogin: async (credentials) => {
    try {
      const response = await axios.post(`${ADMIN_API_BASE_URL}/login`, credentials);
      if (response.data && response.data.token) {
        sessionStorage.setItem('admin_token', response.data.token);
      }
      return response.data || null;
    } catch (error) {
      console.error('Ошибка входа в админку:', error);
      return null;
    }
  },
  isAuthenticated: () => {
    return !!sessionStorage.getItem('admin_token');
  },
  logout: () => {
    sessionStorage.removeItem('admin_token');
  },
  createRoom: async (roomData, token) => {
    const api = createApiInstance(token);
    try {
      const response = await api.post(`/rooms`, roomData);
      return response.data || null;
    } catch (error) {
      console.error('Ошибка создания комнаты:', error);
      return null;
    }
  },
  updateRoom: async (roomId, roomData, token) => {
    const api = createApiInstance(token);
    try {
      const response = await api.put(`/rooms/${roomId}`, roomData);
      return response.data || null;
    } catch (error) {
      console.error('Ошибка обновления комнаты:', error);
      return null;
    }
  },
  deleteRoom: async (roomId, token) => {
    const api = createApiInstance(token);
    try {
      const response = await api.delete(`/rooms/${roomId}`);
      return response.data || null;
    } catch (error) {
      console.error('Ошибка удаления комнаты:', error);
      return null;
    }
  },
  fetchUsers: async (token) => {
    const api = createApiInstance(token);
    try {
      const response = await api.get(`/users`);
      return response.data || [];
    } catch (error) {
      console.error('Ошибка получения пользователей:', error);
      return [];
    }
  },
  createUser: async (userData, token) => {
    const api = createApiInstance(token);
    try {
      const response = await api.post(`/users`, userData);
      return response.data || null;
    } catch (error) {
      console.error('Ошибка создания пользователя:', error);
      return null;
    }
  },
  updateUser: async (userId, userData, token) => {
    const api = createApiInstance(token);
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data || null;
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error);
      return null;
    }
  },
  deleteUser: async (userId, token) => {
    const api = createApiInstance(token);
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data || null;
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error);
      return null;
    }
  },
};

export default apiMethods;
export const { fetchRooms, getRoomStatus, bookRoom, adminLogin, isAuthenticated, logout, createRoom, updateRoom, deleteRoom, fetchUsers, createUser, updateUser, deleteUser } = apiMethods;
