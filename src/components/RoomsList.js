import React, { useEffect, useState } from 'react';
import { fetchRooms } from '../services/api';
import { Link } from 'react-router-dom';
import '../App.css';

const RoomsList = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchRooms()
      .then(res => {
        setRooms(res.data);
      })
      .catch(err => {
        console.error("Ошибка получения переговорок:", err);
      });
  }, []);

  return (
    <div className="rooms-list-container" style={{ padding: '1rem', textAlign: 'center' }}>
      <h2>Выберите переговорку</h2>
      <div className="rooms-grid" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
        {rooms.length > 0 ? (
          rooms.map(room => (
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
          ))
        ) : (
          <p>Нет добавленных переговорок. Пожалуйста, добавьте их в админке.</p>
        )}
      </div>
    </div>
  );
};

export default RoomsList;
