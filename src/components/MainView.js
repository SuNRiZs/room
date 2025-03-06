import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { getRoomStatus, bookRoom } from '../services/api';
import Header from './Header';
import MeetingList from './MeetingList';
import CircleTimer from './CircleTimer';
import SettingsContext from '../SettingsContext';
import '../App.css';

function MainView() {
  const { roomId } = useParams();
  const { settings } = useContext(SettingsContext);

  // Данные переговорки
  const [roomName, setRoomName] = useState('—');
  const [currentStatus, setCurrentStatus] = useState('СВОБОДНО');
  const [events, setEvents] = useState([]);

  // Таймер (счётчик до окончания события)
  const [timeLeftSec, setTimeLeftSec] = useState(0);
  const [totalSec, setTotalSec] = useState(0);
  const [timerEvent, setTimerEvent] = useState(null);
  const timerRef = useRef(null);
  const lastEventRef = useRef({ status: '', eventData: null });

  // Форма «Выбрать другое время»
  const [showExtraForm, setShowExtraForm] = useState(false);
  const [selectedHours, setSelectedHours] = useState(1);
  const defaultDurations = [15, 30, 45, 60];
  const extraDurations = [120, 180, 240, 480];

  // Стили для кнопок формы
  const buttonStyle = {
    all: 'unset',
    backgroundColor: '#357a5c',
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  };
  const confirmButtonStyle = { ...buttonStyle, backgroundColor: '#357a5c' };
  const cancelButtonStyle = { ...buttonStyle, backgroundColor: '#aaa' };

  // Настройки планшета
  const [tabletSettings, setTabletSettings] = useState(null);
  const [isActive, setIsActive] = useState(true);
  let wakeLock = null;

  // Функция для запроса Wake Lock
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake Lock активирован');
      }
    } catch (err) {
      console.error('Ошибка Wake Lock:', err);
    }
  };

  // Функция для отключения Wake Lock
  const releaseWakeLock = async () => {
    if (wakeLock !== null) {
      await wakeLock.release();
      wakeLock = null;
      console.log('Wake Lock отключён');
    }
  };

  // Увеличить/уменьшить кол-во часов
  const handleIncrease = () => {
    const newHours = selectedHours + 1;
    if (newHours > 12) return; // максимум 12 часов
    if (!canBookDuration(newHours * 60)) return;
    setSelectedHours(newHours);
  };

  const handleDecrease = () => {
    setSelectedHours((prev) => (prev > 1 ? prev - 1 : 1));
  };

  // Подтверждение выбора «Выбрать другое время»
  const handleConfirm = () => {
    const duration = selectedHours * 60;
    handleBook(duration).then(() => {
      setShowExtraForm(false);
    });
  };

  /**
   * Основная функция получения статуса переговорки и расписания планшета
   */
  const fetchStatus = () => {
    const deviceId = localStorage.getItem('device_id');
    getRoomStatus(roomId, deviceId)
      .then((data) => {
        const now = moment();

        // Обновляем имя переговорки
        if (data.display_name) {
          setRoomName(data.display_name);
        } else if (data.roomName) {
          setRoomName(data.roomName);
        }

        // Фильтруем события
        const upcoming = (data.events || []).filter((e) =>
          now.isBefore(moment(e.end))
        );
        upcoming.sort((a, b) => moment(a.start).diff(moment(b.start)));
        setEvents(upcoming);

        // Определяем статус переговорки
        let st = 'СВОБОДНО';
        if (data.roomIsOccupied) {
          st = 'ЗАНЯТО';
        } else if (
          data.timeToNextEvent !== null &&
          data.timeToNextEvent <= 15
        ) {
          st = 'ОЖИДАНИЕ';
        }
        setCurrentStatus(st);

        // Определяем текущее/следующее событие для таймера
        let newTimerEvent = null;
        let newTimeLeft = 0;
        let newTotal = 0;
        if (st === 'ЗАНЯТО') {
          // Ищем текущее событие
          const ongoing = upcoming.find((ev) =>
            now.isBetween(moment(ev.start), moment(ev.end))
          );
          if (ongoing) {
            newTimerEvent = ongoing;
            newTotal = moment(ongoing.end).diff(
              moment(ongoing.start),
              'seconds'
            );
            newTimeLeft = moment(ongoing.end).diff(now, 'seconds');
            if (newTimeLeft < 0) newTimeLeft = 0;
          }
        } else if (st === 'ОЖИДАНИЕ') {
          // Ищем ближайшее
          const nextEv = upcoming.find((ev) =>
            now.isBefore(moment(ev.start))
          );
          if (nextEv) {
            newTimerEvent = nextEv;
            newTotal = 900; // 15 минут
            let left = moment(nextEv.start).diff(now, 'seconds');
            if (left < 0) left = 0;
            if (left > 900) left = 900;
            newTimeLeft = left;
          }
        }

        // Проверяем, изменился ли таймер
        let changed = false;
        if (!newTimerEvent) {
          if (lastEventRef.current.status !== st) {
            changed = true;
          }
        } else {
          const old = lastEventRef.current;
          const oldStart = old.eventData ? old.eventData.start : null;
          if (old.status !== st || oldStart !== newTimerEvent.start) {
            changed = true;
          }
        }

        if (changed) {
          // Сбрасываем прошлый таймер
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          if (newTimerEvent) {
            setTimerEvent(newTimerEvent);
            setTotalSec(newTotal);
            setTimeLeftSec(newTimeLeft);
            startInterval(); // Запуск нового отсчёта
          } else {
            setTimerEvent(null);
            setTotalSec(0);
            setTimeLeftSec(0);
          }
          lastEventRef.current = {
            status: st,
            eventData: newTimerEvent
              ? { start: newTimerEvent.start, end: newTimerEvent.end }
              : null,
          };
        }

        // Настройки планшета (если есть)
        if (data.tablet_settings) {
          setTabletSettings(data.tablet_settings);
          setIsActive(data.tablet_settings.is_active);
        } else {
          setTabletSettings(null);
          setIsActive(false);
        }
      })
      .catch((err) => {
        console.error('Ошибка API:', err);
      });
  };

  /**
   * Запуск обратного отсчёта (таймер)
   */
  const startInterval = () => {
    timerRef.current = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev > 1) return prev - 1;
        clearInterval(timerRef.current);
        return 0;
      });
    }, 1000);
  };

  /**
   * Проверка конфликтов для бронирования
   */
  const isTimeConflict = (start, end) => {
    for (const e of events) {
      const es = moment(e.start);
      const ee = moment(e.end);
      if (start.isBefore(ee) && end.isAfter(es)) return true;
    }
    return false;
  };

  /**
   * Проверяем, можно ли забронировать на заданную длительность
   */
  const canBookDuration = (dur) => {
    if (currentStatus === 'ОЖИДАНИЕ' || currentStatus === 'ЗАНЯТО') return false;
    const begin = moment().add(1, 'minute');
    const finish = begin.clone().add(dur, 'minutes');
    return !isTimeConflict(begin, finish);
  };

  /**
   * Бронирование переговорки
   */
  const handleBook = (dur) => {
    return bookRoom(roomId, dur, `Бронировано(${dur} мин)`, settings)
      .then((result) => {
        if (result.success) {
          fetchStatus();
        } else {
          alert('Ошибка бронирования');
        }
      })
      .catch((err) => {
        console.error('Ошибка бронирования', err);
        alert('Ошибка бронирования');
      });
  };

  // Обновление статуса переговорки каждые 30 сек
  useEffect(() => {
    const deviceId = localStorage.getItem('device_id');
    fetchStatus(roomId, deviceId);
    const poll = setInterval(() => fetchStatus(roomId, deviceId), 30000);
    return () => clearInterval(poll);
    // eslint-disable-next-line
  }, [roomId]);

  // Управление видимостью экрана и Wake Lock
  useEffect(() => {
    if (isActive) {
      document.body.style.opacity = '1';
      requestWakeLock();
    } else {
      document.body.style.opacity = '0.2';
      releaseWakeLock();
    }
    return () => releaseWakeLock();
  }, [isActive]);

  let statusColor = '#fff';
  if (currentStatus === 'ЗАНЯТО') {
    statusColor = '#ff1200';
  } else if (currentStatus === 'ОЖИДАНИЕ') {
    statusColor = '#eb9e00';
  }

  return (
    <div className="wrapper">
      <Header roomName={roomName} currentStatus={currentStatus} />
      <div className="content" style={{ overflow: 'visible' }}>
        {/* Левый блок */}
        <div
          className="left-block-container"
          style={{
            width: '45%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '2rem',
            gap: '2rem',
            overflow: 'visible',
            position: 'relative',
          }}
        >
          {/* Имя переговорки */}
          <div>
            <h4
              style={{
                fontSize: '1.8rem',
                padding: '0.5rem 1rem',
                borderRadius: '15px',
                backgroundColor: 'rgba(255,255,255,0.6)',
                color: '#003f8f',
                textAlign: 'center',
                margin: 0,
              }}
            >
              {roomName}
            </h4>
          </div>

          {/* Статус */}
          <div
            id="status"
            style={{
              fontSize: '3rem',
              textAlign: 'center',
              color: statusColor,
              textShadow: '0 0 3px rgba(0,0,0,0.3)',
              fontWeight: 'bold',
              marginBottom: '4rem',
            }}
          >
            {isActive ? currentStatus : 'Планшет выключен'}
          </div>

          {/* Круговой таймер */}
          {timerEvent && totalSec > 0 && (
            <CircleTimer
              timeLeftSec={timeLeftSec}
              totalSec={totalSec}
              fillMode="forward"
              circleColor={statusColor}
              size={240}
              radius={70}
            />
          )}

          {/* Если СВОБОДНО, рисуем кнопки бронирования */}
          {currentStatus === 'СВОБОДНО' && (
            <div
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  justifyContent: 'center',
                }}
              >
                {defaultDurations.map((dur) => {
                  const canB = canBookDuration(dur);
                  return (
                    <button
                      key={dur}
                      style={{
                        all: 'unset',
                        backgroundColor: canB
                          ? 'rgba(255,255,255,0.25)'
                          : 'rgba(255,255,255,0.1)',
                        color: canB ? '#fff' : '#bbb',
                        padding: '0.9rem 1.5rem',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: canB ? 'pointer' : 'not-allowed',
                      }}
                      disabled={!canB}
                      onClick={() => handleBook(dur)}
                    >
                      {dur} мин
                    </button>
                  );
                })}
              </div>

              {/* «Выбрать другое время» */}
              <div style={{ marginTop: '5rem' }}>
                {!showExtraForm ? (
                  <button
                    style={{
                      all: 'unset',
                      padding: '0.8rem 1.5rem',
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      color: '#fff',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => setShowExtraForm(true)}
                  >
                    Выбрать другое время
                  </button>
                ) : (
                  <div
                    style={{
                      marginTop: '1rem',
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      color: '#333',
                      padding: '1rem',
                      borderRadius: '8px',
                      width: '340px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                      Выберите время (в часах)
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                      }}
                    >
                      <button onClick={handleDecrease} style={buttonStyle}>
                        –
                      </button>
                      <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {selectedHours}
                      </span>
                      <button onClick={handleIncrease} style={buttonStyle}>
                        +
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button onClick={handleConfirm} style={confirmButtonStyle}>
                        Забронировать
                      </button>
                      <button
                        onClick={() => setShowExtraForm(false)}
                        style={cancelButtonStyle}
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Правый блок - список встреч */}
        <div className="right-block">
          <MeetingList
            events={events}
            showDays={true}
            currentEvent={
              timerEvent && currentStatus !== 'СВОБОДНО' ? timerEvent : null
            }
            statusColor={statusColor}
          />
        </div>
      </div>
    </div>
  );
}

export default MainView;