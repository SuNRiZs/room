import React, { useEffect, useState } from 'react';
import { fetchRooms } from '../services/api';
import { Link } from 'react-router-dom';
import '../App.css';
import './AdminSettings.css';

const RoomsList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await fetchRooms();
        if (!data || !Array.isArray(data)) {
          console.error("API вернул некорректный ответ:", data);
          throw new Error("Ошибка загрузки данных. Проверьте подключение к API.");
        }
        setRooms(data);
      } catch (error) {
        console.error("Ошибка загрузки комнат:", error);
        setError("Ошибка загрузки данных. Проверьте подключение к API.");
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    loadRooms();
  }, []);

  return (
    <div className="rooms-list-container" style={{ padding: '1rem', textAlign: 'center' }}>
      <h2>Выберите переговорку</h2>
      {loading ? (
        <p>Загрузка...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : rooms.length > 0 ? (
        <div className="rooms-grid" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
          {rooms.map(room => (
            <Link key={room.id} to={`/rooms/${room.id}`} style={{ textDecoration: 'none' }}>
              <div
                className="room-card"
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '1rem',
                  minWidth: '200px',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
              >
                <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>{room.display_name}</h3>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>Нет доступных переговорок. Перейдите в <Link to="/admin/settings">админку</Link>, чтобы настроить подключения.</p>
      )}
    </div>
  );
};

export default RoomsList;
