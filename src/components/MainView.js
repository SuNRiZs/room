import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faClock } from '@fortawesome/free-solid-svg-icons';
import { getRoomStatus, bookRoom } from '../services/api';
import Header from './Header';
import MeetingList from './MeetingList';
import CircleTimer from './CircleTimer'; // Импортируем новый компонент
import SettingsContext from '../SettingsContext';
import '../App.css';

// Вспомогательная функция для преобразования VAPID-ключа
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function MainView() {
  const { roomId } = useParams();
  const { settings } = useContext(SettingsContext);

  const [roomName, setRoomName] = useState('—');
  const [currentStatus, setCurrentStatus] = useState('СВОБОДНО');
  const [events, setEvents] = useState([]);

  const [timeLeftSec, setTimeLeftSec] = useState(0);
  const [totalSec, setTotalSec] = useState(0);
  const [timerEvent, setTimerEvent] = useState(null);
  const timerRef = useRef(null);
  const lastEventRef = useRef({ status: 'СВОБОДНО', eventData: null });

  const [showExtraForm, setShowExtraForm] = useState(false);
  const [selectedHours, setSelectedHours] = useState(1);
  const defaultDurations = [15, 30, 45, 60];

  const [tabletSettings, setTabletSettings] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const wakeLockRef = useRef(null);
  const lastIsActiveRef = useRef(null);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('Wake Lock успешно запрошен');
      }
    } catch (err) {
      console.error('Ошибка запроса Wake Lock:', err);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current !== null) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Wake Lock успешно освобождён');
      } catch (err) {
        console.error('Ошибка освобождения Wake Lock:', err);
      }
    } else {
      console.log('Wake Lock уже освобождён или не запрошен');
    }
  };

  const handleIncrease = () => {
    const newHours = selectedHours + 1;
    if (newHours > 12) return;
    if (!canBookDuration(newHours * 60)) return;
    setSelectedHours(newHours);
  };

  const handleDecrease = () => {
    setSelectedHours((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleConfirm = () => {
    const duration = selectedHours * 60;
    handleBook(duration).then(() => {
      setShowExtraForm(false);
    });
  };

  const shouldTabletBeActive = (settings) => {
    console.log('Проверка активности планшета, настройки:', settings);

    if (!settings || typeof settings !== 'object') {
      console.log('Настройки отсутствуют или не являются объектом');
      return false;
    }

    const dayOfWeek = settings.day_of_week;
    const startHour = settings.start_hour;
    const endHour = settings.end_hour;

    if (
      dayOfWeek === undefined ||
      dayOfWeek === null ||
      startHour === undefined ||
      startHour === null ||
      endHour === undefined ||
      endHour === null
    ) {
      console.log('Одно или несколько полей отсутствует:', {
        dayOfWeek,
        startHour,
        endHour,
      });
      return false;
    }

    const parsedDayOfWeek = parseInt(dayOfWeek, 10);
    const parsedStartHour = parseInt(startHour, 10);
    const parsedEndHour = parseInt(endHour, 10);

    if (
      isNaN(parsedDayOfWeek) ||
      parsedDayOfWeek < 0 || parsedDayOfWeek > 6 ||
      isNaN(parsedStartHour) ||
      parsedStartHour < 0 || parsedStartHour >= 24 ||
      isNaN(parsedEndHour) ||
      parsedEndHour < 0 || parsedEndHour > 24
    ) {
      console.log('Невалидные значения настроек:', {
        parsedDayOfWeek,
        parsedStartHour,
        parsedEndHour,
      });
      return false;
    }

    const now = moment();
    const currentDay = now.day();
    const currentHour = now.hour();
    const currentTime = now.format('YYYY-MM-DD HH:mm:ss');
    console.log(`Текущий день недели (moment): ${currentDay}, текущее время: ${currentTime}`);

    const targetDay = (parsedDayOfWeek + 1) % 7;
    console.log(`Серверный день недели: ${parsedDayOfWeek}, преобразованный день (moment): ${targetDay}`);

    if (currentDay !== targetDay) {
      console.log(`День недели не совпадает: текущий день ${currentDay}, целевой день ${targetDay}`);
      return false;
    }

    console.log(`Диапазон времени: start_hour=${parsedStartHour}, end_hour=${parsedEndHour}, текущий час=${currentHour}`);

    const isInRange = parsedStartHour <= parsedEndHour
      ? currentHour >= parsedStartHour && currentHour < parsedEndHour
      : currentHour >= parsedStartHour || currentHour < parsedEndHour;
    console.log(`Время в диапазоне: ${isInRange}`);

    return isInRange;
  };

  const fetchStatus = async () => {
    const deviceId = localStorage.getItem('device_id');
    try {
      const data = await getRoomStatus(roomId, deviceId);
      const now = moment();

      console.log('Данные от сервера:', data);

      if (data.display_name) {
        setRoomName(data.display_name);
      } else if (data.roomName) {
        setRoomName(data.roomName);
      }

      const upcoming = (data.events || []).filter((e) =>
        now.isBefore(moment(e.end))
      );
      upcoming.sort((a, b) => moment(a.start).diff(moment(b.start)));
      setEvents(upcoming);

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

      let newTimerEvent = null;
      let newTimeLeft = 0;
      let newTotal = 0;
      if (st === 'ЗАНЯТО') {
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
        const nextEv = upcoming.find((ev) =>
          now.isBefore(moment(ev.start))
        );
        if (nextEv) {
          newTimerEvent = nextEv;
          newTotal = 900; // 15 минут в секундах
          let left = moment(nextEv.start).diff(now, 'seconds');
          if (left < 0) left = 0;
          if (left > 900) left = 900;
          newTimeLeft = left;
        }
      }

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
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (newTimerEvent) {
          setTimerEvent(newTimerEvent);
          setTotalSec(newTotal);
          setTimeLeftSec(newTimeLeft);
          startInterval();
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

      if (data.tablet_settings) {
        setTabletSettings(data.tablet_settings);

        const shouldBeActive = shouldTabletBeActive(data.tablet_settings);
        console.log('Планшет должен быть активен:', shouldBeActive);

        setIsActive(prev => {
          const updated = shouldBeActive;
          console.log('Обновление isActive: prev=', prev, 'updated=', updated, 'lastIsActiveRef.current=', lastIsActiveRef.current);
          if (prev !== updated) {
            localStorage.setItem('lastIsActive', updated.toString());

            if (lastIsActiveRef.current === null) {
              lastIsActiveRef.current = updated;
            } else {
              if (updated) {
                console.log('Отправляем уведомление для deviceId:', deviceId);
                fetch('/api/send-notification', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ deviceId })
                })
                  .then((response) => {
                    if (!response.ok) {
                      throw new Error(`Ошибка отправки уведомления, статус: ${response.status}`);
                    }
                    console.log('Уведомление успешно запланировано на сервере');
                  })
                  .catch((err) => {
                    console.error('Ошибка отправки уведомления:', err);
                  });
              }
              lastIsActiveRef.current = updated;
            }
          }
          return updated;
        });
      } else {
        if (tabletSettings !== null || isActive !== false) {
          console.log('tablet_settings отсутствует, выключаем планшет');
          setIsActive(false);
          localStorage.setItem('lastIsActive', 'false');
          lastIsActiveRef.current = false;
        }
      }
    } catch (err) {
      console.error('Ошибка API:', err);
    }
  };

  const startInterval = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const isTimeConflict = (start, end) => {
    for (const e of events) {
      const es = moment(e.start);
      const ee = moment(e.end);
      if (start.isBefore(ee) && end.isAfter(es)) return true;
    }
    return false;
  };

  const canBookDuration = (dur) => {
    if (currentStatus === 'ОЖИДАНИЕ' || currentStatus === 'ЗАНЯТО') return false;
    const begin = moment().add(1, 'minute');
    const finish = begin.clone().add(dur, 'minutes');
    return !isTimeConflict(begin, finish);
  };

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

  useEffect(() => {
    const subscribeToPush = async () => {
      try {
        if (Notification.permission === 'denied') {
          return;
        }
        if (Notification.permission !== 'granted') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            return;
          }
        }

        const registration = await navigator.serviceWorker.ready;

        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
        } else {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_PUBLIC_VAPID_KEY)
          });

          const deviceId = localStorage.getItem('device_id') || `device_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('device_id', deviceId);
          await fetch('/api/save-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription, deviceId })
          });
        }
      } catch (error) {
        console.error('Ошибка подписки:', error);
      }
    };

    const handleServiceWorkerMessage = (event) => {
      if (event.data && event.data.type === 'reload') {
        window.location.reload();
      } else if (event.data && event.data.type === 'activate') {
        setIsActive(true);
        requestWakeLock();
      }
    };

    const initializeStatus = async () => {
      await fetchStatus();
      const poll = setInterval(fetchStatus, 30000);
      return () => clearInterval(poll);
    };

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
      subscribeToPush();
    }

    const cleanup = initializeStatus();

    return () => {
      if (typeof cleanup === 'function') cleanup();
      if (timerRef.current) clearInterval(timerRef.current);
      releaseWakeLock().catch(err => console.error('Ошибка при очистке Wake Lock:', err));
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, [roomId]);

  useEffect(() => {
    const handleWakeLock = async () => {
      if (isActive) {
        document.body.classList.remove('inactive');
        document.body.style.display = 'block';
        await requestWakeLock();
      } else {
        document.body.classList.add('inactive');
        document.body.style.display = 'none';
        await releaseWakeLock();
      }
    };

    handleWakeLock().catch(err => console.error('Ошибка управления Wake Lock:', err));
  }, [isActive]);

  return (
    <div className="wrapper">
      <Header roomName={roomName} currentStatus={currentStatus} />
      <div className="content">
        {/* Левый блок */}
        <div className="left-block-container">
          <div>
            <h4 className="room-name">{roomName}</h4>
          </div>
          <div id="status" className="status-container">
            {isActive ? currentStatus : 'Планшет выключен'}
          </div>
          {currentStatus === 'ЗАНЯТО' && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="icon-container"
            >
              <FontAwesomeIcon
                icon={faLock}
                size="4x"
                color="#fff"
                style={{ fontSize: '15rem' }}
              />
            </motion.div>
          )}
          {currentStatus === 'ОЖИДАНИЕ' && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="icon-container"
            >
              <FontAwesomeIcon
                icon={faClock}
                size="4x"
                color="#fff"
                style={{ fontSize: '15rem' }}
              />
            </motion.div>
          )}
          {/* Добавляем CircleTimer */}
          {(currentStatus === 'ЗАНЯТО' || currentStatus === 'ОЖИДАНИЕ') && (
            <CircleTimer
              currentStatus={currentStatus}
              timerEvent={timerEvent}
              totalSec={totalSec}
              timeLeftSec={timeLeftSec}
            />
          )}
          {currentStatus === 'СВОБОДНО' && (
            <div className="booking-container">
              <div className="booking-buttons-container">
                {defaultDurations.map((dur) => {
                  const canB = canBookDuration(dur);
                  return (
                    <button
                      key={dur}
                      className="booking-button"
                      disabled={!canB}
                      onClick={() => handleBook(dur)}
                    >
                      {dur} мин
                    </button>
                  );
                })}
              </div>
              <div className="extra-time-container">
                {!showExtraForm ? (
                  <button
                    className="extra-time-button"
                    onClick={() => setShowExtraForm(true)}
                  >
                    Выбрать другое время
                  </button>
                ) : (
                  <div className="extra-time-form">
                    <div className="extra-time-text">Выберите время (в часах)</div>
                    <div className="hours-selector">
                      <button onClick={handleDecrease} className="hours-button">
                        –
                      </button>
                      <span className="hours-value">{selectedHours}</span>
                      <button onClick={handleIncrease} className="hours-button">
                        +
                      </button>
                    </div>
                    <div className="form-buttons-container">
                      <button onClick={handleConfirm} className="confirm-button">
                        Забронировать
                      </button>
                      <button
                        onClick={() => setShowExtraForm(false)}
                        className="cancel-button"
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
        <div className="right-block">
          <MeetingList
            events={events}
            showDays={true}
            currentEvent={timerEvent && currentStatus !== 'СВОБОДНО' ? timerEvent : null}
            statusColor="#ff1200"
            showMeetingSubject={tabletSettings?.show_meeting_subject !== false}
          />
        </div>
      </div>
    </div>
  );
}

export default MainView;