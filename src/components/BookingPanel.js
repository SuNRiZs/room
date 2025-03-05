import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { bookRoom, getRoomStatus } from '../services/api';

const BookingPanel = ({ roomId, displayName }) => {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingVisible, setBookingVisible] = useState(false);

  const fetchStatus = () => {
    setLoading(true);
    getRoomStatus(roomId)
      .then(res => {
        setStatusData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching room status:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [roomId]);

  // При желании можно анимировать кольца таймеров через setInterval + React state,
  // но в данном примере мы делаем упрощённо: обновляемся каждые 30 секунд
  const formatTimeFromSeconds = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleBook = (duration) => {
    bookRoom(roomId, duration, `Бронирование React на ${duration} мин`)
      .then(res => {
        if (res.data.success) {
          setBookingVisible(false);
          fetchStatus();
        } else {
          alert('Ошибка бронирования');
        }
      })
      .catch(err => {
        console.error('Booking error:', err);
        alert('Ошибка при бронировании');
      });
  };

  if (!statusData) {
    return (
      <div className="left-block">
        <div className="room-name">
          <h4>{displayName}</h4>
        </div>
        <div id="status">{loading ? 'Загрузка...' : 'Нет данных'}</div>
      </div>
    );
  }

  const roomIsOccupied = statusData.roomIsOccupied;
  const nextEvent = (() => {
    if (!statusData.events) return null;
    const now = moment();
    const upcoming = statusData.events.filter(e => moment(e.start).isAfter(now));
    if (upcoming.length === 0) return null;
    // сортируем
    upcoming.sort((a, b) => moment(a.start).diff(moment(b.start)));
    return upcoming[0];
  })();

  const currentEvent = (() => {
    if (!statusData.events) return null;
    const now = moment();
    return statusData.events.find(e =>
      now.isBetween(moment(e.start), moment(e.end))
    );
  })();

  return (
    <div className="left-block">
      <div className="room-name">
        <h4>{displayName}</h4>
      </div>
      <div id="status">
        {loading ? 'Загрузка...' : (roomIsOccupied ? 'ЗАНЯТО' : 'СВОБОДНО')}
      </div>

      {/* Блок «Следующая встреча» */}
      {nextEvent && !roomIsOccupied && (
        <div id="next-meeting" className="meeting-info-awaiting">
          <div className="timer-wrapper-awaiting">
            <svg className="progress-ring-awaiting" width="360" height="360" viewBox="0 0 120 120">
              <circle className="progress-ring__circle-awaiting" cx="60" cy="60" r="54" />
            </svg>
            <div className="timer-text-awaiting" id="time-to-next-meeting">
              {(() => {
                const now = moment();
                const diffSecs = moment(nextEvent.start).diff(now, 'seconds');
                return diffSecs > 0 ? formatTimeFromSeconds(diffSecs) : '00:00';
              })()}
            </div>
          </div>
          <div className="meeting-title-occupied">Тема: {nextEvent.subject}</div>
          <div className="meeting-organizer-occupied">Организатор: {nextEvent.booked_by}</div>
        </div>
      )}

      {/* Блок «Текущая встреча» */}
      {currentEvent && (
        <div id="current-meeting" className="meeting-info-occupied">
          <div className="timer-wrapper">
            <svg className="progress-ring" width="360" height="360" viewBox="0 0 120 120">
              <circle className="progress-ring__circle" cx="60" cy="60" r="54" />
            </svg>
            <div className="timer-text" id="remaining-time">
              {(() => {
                const now = moment();
                const diffSecs = moment(currentEvent.end).diff(now, 'seconds');
                return diffSecs > 0 ? formatTimeFromSeconds(diffSecs) : '00:00';
              })()}
            </div>
          </div>
          <div className="meeting-title-occupied" id="meeting-title">{currentEvent.subject}</div>
          <div className="meeting-organizer-occupied">Организатор: {currentEvent.booked_by}</div>
        </div>
      )}

      {/* Кнопка «Забронировать» (если свободно) */}
      {!roomIsOccupied && !bookingVisible && (
        <div id="add-new-meeting" className="add-new-meeting">
          <button id="circle" className="circle" onClick={() => setBookingVisible(true)}>
            <svg
              width="40%"
              height="40%"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fillRule="evenodd"
              clipRule="evenodd"
              fill="#fff"
            >
              <path d="M11 11v-11h1v11h11v1h-11v11h-1v-11h-11v-1h11z" />
            </svg>
          </button>
          <button className="add-new" onClick={() => setBookingVisible(true)}>
            Забронировать сейчас
          </button>
        </div>
      )}

      {/* Форма быстрого бронирования */}
      {bookingVisible && (
        <div id="booking-form" className="booking-form">
          <button className="btn" onClick={() => handleBook(15)}><b>15</b> мин</button>
          <button className="btn" onClick={() => handleBook(30)}><b>30</b> мин</button>
          <button className="btn" onClick={() => handleBook(45)}><b>45</b> мин</button>
          <button className="btn" onClick={() => handleBook(60)}><b>60</b> мин</button>
          <button id="cancel-meeting" className="cancel-meeting" onClick={() => setBookingVisible(false)}>
            Отменить
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingPanel;
