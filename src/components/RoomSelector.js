import React, { useEffect, useState } from 'react';
import { fetchRooms } from '../services/api';

const RoomSelector = ({ onSelectRoom }) => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  useEffect(() => {
    fetchRooms()
      .then((res) => {
        setRooms(res.data);
        if (res.data.length > 0) {
          const firstRoom = res.data[0];
          setSelectedRoomId(firstRoom.id);
          onSelectRoom(firstRoom.id, firstRoom.display_name);
        }
      })
      .catch((err) => console.error("Ошибка получения списка комнат", err));
  }, [onSelectRoom]);

  const handleChange = (e) => {
    const roomId = parseInt(e.target.value, 10);
    setSelectedRoomId(roomId);
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      onSelectRoom(roomId, room.display_name);
    }
  };

  return (
    <div className="room-selector" style={{ padding: "10px", background: "#eee" }}>
      <label htmlFor="room-select">Выберите переговорку: </label>
      <select id="room-select" value={selectedRoomId || ''} onChange={handleChange}>
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.display_name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RoomSelector;
