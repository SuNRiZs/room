import React from 'react';
import moment from 'moment';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faHourglassHalf } from '@fortawesome/free-solid-svg-icons';

function MeetingList({
  events,
  showDays = false,
  currentEvent = null,
  statusColor = '#ff1200',
  showMeetingSubject = true,
}) {
  if (!events || events.length === 0) {
    return <div className="meeting-list">Нет событий</div>;
  }

  const now = moment();

  let mainList = events;
  if (currentEvent) {
    mainList = mainList.filter(e => !(e.start === currentEvent.start && e.end === currentEvent.end));
  }

  let currentDayLabel = null;

  const renderEvent = (ev, idx, dayLabel = '') => {
    const start = moment(ev.start);
    const end = moment(ev.end);

    let showDayHeader = false;
    if (dayLabel && dayLabel !== currentDayLabel) {
      showDayHeader = true;
      currentDayLabel = dayLabel;
    }

    return (
      <React.Fragment key={idx}>
        {showDayHeader && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="day-label"
          >
            {dayLabel}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.1 }}
          className="event-container"
        >
          <FontAwesomeIcon icon={faCalendar} size="2x" color="#fff" />
          <div className="event-details">
            <div className="event-time">
              <span>{start.format('HH:mm')}</span>
              <span className="event-time-arrow">→</span>
              <span>{end.format('HH:mm')}</span>
            </div>
            {showMeetingSubject && (
              <div className="event-subject">{ev.subject || 'Без темы'}</div>
            )}
            <div className="event-booked-by">
              Забронировал: {ev.booked_by || 'Неизвестно'}
            </div>
          </div>
        </motion.div>
      </React.Fragment>
    );
  };

  let nowBlock = null;
  if (currentEvent) {
    nowBlock = (
      <motion.div
        className="current-event-wrapper"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="current-event-label">Сейчас</div>
        <motion.div
          className="current-event-container"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <FontAwesomeIcon icon={faHourglassHalf} size="2x" color="#003f8f" />
          <div className="event-details">
            <div className="event-time">
              <span>{moment(currentEvent.start).format('HH:mm')}</span>
              <span className="event-time-arrow">→</span>
              <span>{moment(currentEvent.end).format('HH:mm')}</span>
            </div>
            {showMeetingSubject && (
              <div className="event-subject">{currentEvent.subject || 'Без темы'}</div>
            )}
            <div className="event-booked-by">
              Забронировал: {currentEvent.booked_by || 'Неизвестно'}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const dayBlocks = [];
  let i = 0;
  mainList.forEach(ev => {
    const start = moment(ev.start);
    let dayLabel = '';
    if (showDays) {
      if (start.isSame(now, 'day')) {
        dayLabel = 'Сегодня';
      } else if (start.isSame(now.clone().add(1, 'day'), 'day')) {
        dayLabel = 'Завтра';
      } else if (start.isSame(now.clone().add(2, 'day'), 'day')) {
        dayLabel = 'Послезавтра';
      } else {
        dayLabel = start.format('D MMMM, dddd');
      }
    }
    dayBlocks.push(renderEvent(ev, i++, dayLabel));
  });

  return (
    <motion.div
      className="meeting-list"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {nowBlock}
      {dayBlocks}
    </motion.div>
  );
}

export default MeetingList;