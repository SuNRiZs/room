import axios from 'axios';
import { API_BASE_URL, ADMIN_API_BASE_URL } from '../config';

// Функция для получения API токена
const getApiToken = () => localStorage.getItem("apiToken") || process.env.API_TOKEN || "";

// Функция для создания API-инстанса
const createApiInstance = (baseURL) => {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getApiToken() ? `Bearer ${getApiToken()}` : ''
    }
  });
};


// ---------- ФУНКЦИИ ДЛЯ ПЕРЕГОВОРОК ----------
export const fetchRooms = async () => {
  const api = createApiInstance(API_BASE_URL);
  try {
    const response = await api.get('/public/rooms');
    return response.data;
  } catch (error) {
    console.error("Ошибка получения переговорок:", error);
    throw error;
  }
};

export const getRoomStatus = async (roomId, deviceId = null) => {
  const api = createApiInstance(API_BASE_URL);
  try {
    const params = deviceId ? { device_id: deviceId } : {};
    const response = await api.get(`/rooms/${roomId}/status`, { params: params });
    return response.data;
  } catch (error) {
    console.error("Ошибка получения статуса комнаты:", error);
    throw error;
  }
};


export const bookRoom = async (roomId, duration, subject) => {
  const api = createApiInstance(API_BASE_URL);
  try {
    const response = await api.post(`/rooms/${roomId}/book`, {
      duration,
      subject
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка бронирования комнаты:", error);
    throw error;
  }
};

// ---------- ФУНКЦИЯ РЕГИСТРАЦИИ ПЛАНШЕТА ----------
export const registerTablet = async (deviceId, roomId) => {
  const api = createApiInstance(API_BASE_URL);
  try {
    const response = await api.post('/register-tablet', {
      device_id: deviceId,
      room_id: roomId
    });

    console.log("Ответ регистрации планшета:", response.data);

    if (response.data && response.data.token) {
      localStorage.setItem("roomToken", response.data.token);  // ✅ Сохраняем токен
      console.log("Сохранён новый roomToken:", response.data.token);
    } else {
      console.warn("❌ API не вернул токен:", response.data);
    }

    return response.data;
  } catch (error) {
    console.error("Ошибка регистрации планшета:", error);
    throw error;
  }
};


// ---------- ФУНКЦИИ ДЛЯ АДМИНКИ ----------
export const adminLogin = async (credentials) => {
  const api = createApiInstance(ADMIN_API_BASE_URL);
  
  console.log("Попытка отправки запроса:", credentials);

  try {
    const response = await api.post('/login', credentials);
    console.log('Ответ от /admin/login:', response.data);
    
    if (response.data.token) {
      localStorage.setItem("adminToken", response.data.token);  // Сохраняем токен
      return response.data;
    } else {
      console.warn("Ответ сервера не содержит токен:", response.data);
      return response.data;
    }
  } catch (error) {
    console.error("Ошибка входа в админку:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const createRoom = async (roomData) => {
  const api = createApiInstance(ADMIN_API_BASE_URL);
  try {
    const response = await api.post('/rooms', roomData);
    return response.data;
  } catch (error) {
    console.error("Ошибка создания комнаты:", error);
    throw error;
  }
};

export const updateRoom = async (roomId, roomData) => {
  const api = createApiInstance(ADMIN_API_BASE_URL);
  try {
    const response = await api.put(`/rooms/${roomId}`, roomData);
    return response.data;
  } catch (error) {
    console.error("Ошибка обновления комнаты:", error);
    throw error;
  }
};

export const deleteRoom = async (roomId) => {
  const api = createApiInstance(ADMIN_API_BASE_URL);
  try {
    const response = await api.delete(`/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    console.error("Ошибка удаления комнаты:", error);
    throw error;
  }
};

// ---------- ФУНКЦИИ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ ----------
export const fetchUsers = async () => {
  const api = createApiInstance(ADMIN_API_BASE_URL);
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error("Ошибка получения пользователей:", error);
    throw error;
  }
};

export const createUser = async (userData) => {
  const api = createApiInstance(ADMIN_API_BASE_URL);
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error("Ошибка создания пользователя:", error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  const api = createApiInstance(ADMIN_API_BASE_URL);
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Ошибка обновления пользователя:", error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  const api = createApiInstance(ADMIN_API_BASE_URL);
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Ошибка удаления пользователя:", error);
    throw error;
  }
};

// ---------- ГЛОБАЛЬНЫЕ НАСТРОЙКИ ----------
export const getGlobalSettings = async (app_id) => {
  const api = createApiInstance(API_BASE_URL);
  try {
    const response = await api.get(`/global-settings?app_id=${app_id}`);
    return response.data;
  } catch (error) {
    console.error("Ошибка получения глобальных настроек:", error);
    throw error;
  }
};

export const saveGlobalSettings = async (settings) => {
  const api = createApiInstance(API_BASE_URL);
  try {
    const response = await api.post("/global-settings", settings);
    return response.data;
  } catch (error) {
    console.error("Ошибка сохранения глобальных настроек:", error);
    throw error;
  }
};

// Экспорт всех методов API в объекте
const apiMethods = {
    fetchRooms,
    getRoomStatus,
    bookRoom,
    registerTablet,  // ✅ Теперь можно регистрировать планшет
    adminLogin,
    createRoom,
    updateRoom,
    deleteRoom,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    getGlobalSettings,
    saveGlobalSettings
};

export default apiMethods;
