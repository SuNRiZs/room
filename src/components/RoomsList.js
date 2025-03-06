import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, TOKEN } from "../config";
import "../App.css"; // Подключаем общий файл стилей

function RoomsList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRooms() {
      try {
        const response = await axios.get(`${API_BASE_URL}/public/rooms`);
        setRooms(response.data);
      } catch (error) {
        console.error("Ошибка загрузки переговорок:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  const handleSelectRoom = async (roomId) => {
    try {
      // Проверяем, есть ли device_id в localStorage
      let deviceId = localStorage.getItem("device_id");

      // Если нет, генерируем новое
      if (!deviceId) {
        deviceId = getDeviceInfo();
        localStorage.setItem("device_id", deviceId);
      }

      await axios.post(
        `${API_BASE_URL}/register-tablet`,
        { device_id: deviceId, room_id: roomId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: TOKEN ? `Bearer ${TOKEN}` : "",
          },
        }
      );

      navigate(`/rooms/${roomId}`);
    } catch (error) {
      console.error("Ошибка регистрации планшета:", error);
      alert("Ошибка регистрации");
    }
  };

  if (loading) return <p className="loading">Загрузка...</p>;

  return (
    <div className="rooms-container">
      <h2>Выберите переговорку</h2>
      <div className="rooms-grid">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="room-card"
            onClick={() => handleSelectRoom(room.id)}
          >
            <div className="room-name">{room.display_name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoomsList;

/** 
 * Генерирует уникальный device_id на основе ОС, версии, модели устройства + рандом.
 */
function getDeviceInfo() {
  const os = getOS();
  const version = getOSVersion();
  const model = getDeviceModel();
  // Дополнительная случайная часть
  const randomPart = Math.random().toString(36).substring(2, 8);

  return `${os}_${version}_${model}-${randomPart}`;
}

/** 
 * Определение ОС через userAgent (упрощённый вариант).
 */
function getOS() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("android")) return "Android";
  if (ua.includes("iphone") || ua.includes("ipad")) return "iOS";
  if (ua.includes("mac")) return "MacOS";
  return "UnknownOS";
}

/** 
 * Версию ОС обычно парсят из userAgent, 
 * но для примера просто возвращаем.
 */
function getOSVersion() {
  // Для детального парса userAgent нужны регулярки 
  return "v1";
}

/**
 * Модель устройства.
 * В браузере получить её сложно, поэтому 
 * возвращаем что-то упрощённое.
 */
function getDeviceModel() {
  return "ModelX";
}

