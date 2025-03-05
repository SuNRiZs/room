import axios from 'axios';
import config from '../config'; // Используем объект config, а не хук

// Настройки API
const { API_BASE_URL, ADMIN_API_BASE_URL, TOKEN_KEY } = config;

// Настройка по умолчанию для отправки credentials (cookie)
axios.defaults.withCredentials = true;

// Создаем клиент с базовым URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавляем токен в заголовки
api.interceptors.request.use((req) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Функции API
const apiMethods = {
  fetchRooms: () => api.get(`/public/rooms`),
  getRoomStatus: (roomId) => api.get(`/rooms/${roomId}/status`),
  bookRoom: (roomId, duration, subject) => {
    const formData = new URLSearchParams();
    formData.append('duration', duration);
    formData.append('subject', subject);
    return api.post(`/rooms/${roomId}/book`, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  },
  // ✅ Админ API
  adminLogin: (credentials) => axios.post(`${ADMIN_API_BASE_URL}/login`, credentials),
  createRoom: (roomData) => api.post(`/rooms`, roomData),
  updateRoom: (roomId, roomData) => api.put(`/rooms/${roomId}`, roomData),
  deleteRoom: (roomId) => api.delete(`/rooms/${roomId}`),
  fetchUsers: () => api.get(`/users`),
  createUser: (userData) => api.post(`/users`, userData),
  updateUser: (userId, userData) => api.put(`/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/users/${userId}`)
};

// ✅ Экспортируем API как объект
export default apiMethods;
export const { fetchRooms, getRoomStatus, bookRoom, adminLogin, createRoom, updateRoom, deleteRoom, fetchUsers, createUser, updateUser, deleteUser } = apiMethods;
