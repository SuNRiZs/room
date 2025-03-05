import React from 'react';
import moment from 'moment';

function MeetingList({
  events,
  showDays = false,
  currentEvent = null,
  statusColor = '#fff'
}) {
  if (!events || events.length === 0) {
    return <div className="meeting-list">Нет событий</div>;
  }

  const now = moment();

  // Исключаем currentEvent из общего списка
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

    // Полупрозрачный фон для встречи, белый текст
    const containerStyle = {
      backgroundColor: 'rgba(255,255,255,0.25)',
      color: '#fff',
      borderRadius: '8px',
      marginBottom: '1rem',
      padding: '1rem'
    };

    return (
      <React.Fragment key={idx}>
        {showDayHeader && (
          <div style={{
            fontSize: '1.3rem',
            fontWeight: 'bold',
            margin: '1.5rem 0 0.5rem',
            color: '#003f8f'
          }}>
            {dayLabel}
          </div>
        )}

        <div style={containerStyle}>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start' // выравнивание слева
          }}>
            <span>{start.format('HH:mm')}</span>
            <img
              src="/right-arrow.svg"
              alt="→"
              style={{
                verticalAlign: 'middle',
                margin: '0 5px',
                height: '1em',
                filter: 'brightness(0) invert(1)' // делаем стрелку белой
              }}
            />
            <span>{end.format('HH:mm')}</span>
          </div>
          <div style={{ fontSize: '1rem', marginTop: '0.3rem' }}>
            {ev.subject || 'Без темы'}
          </div>
          <div style={{ fontSize: '0.9rem', marginTop: '0.2rem', opacity: 0.9 }}>
            Забронировал: {ev.booked_by || 'Неизвестно'}
          </div>
        </div>
      </React.Fragment>
    );
  };

  // Блок "Сейчас"
  let nowBlock = null;
  if (currentEvent) {
    let textCol = '#fff';
    if (statusColor === '#ffc857') {
      textCol = '#333';
    }
    nowBlock = (
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          fontSize: '1.3rem',
          fontWeight: 'bold',
          margin: '1.5rem 0 0.5rem',
          color: textCol
        }}>
          Сейчас
        </div>
        <div style={{
          backgroundColor: statusColor,
          color: textCol,
          borderRadius: '8px',
          marginBottom: '1rem',
          padding: '1rem'
        }}>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start'
          }}>
            <span>{moment(currentEvent.start).format('HH:mm')}</span>
            <img
              src="/right-arrow.svg"
              alt="→"
              style={{
                verticalAlign: 'middle',
                margin: '0 5px',
                height: '1em',
                filter: 'brightness(0) invert(1)'
              }}
            />
            <span>{moment(currentEvent.end).format('HH:mm')}</span>
          </div>
          <div style={{ fontSize: '1rem', marginTop: '0.3rem' }}>
            {currentEvent.subject || 'Без темы'}
          </div>
          <div style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Забронировал: {currentEvent.booked_by || 'Неизвестно'}
          </div>
        </div>
      </div>
    );
  }

  // Остальные события
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
    <div className="meeting-list">
      {nowBlock}
      {dayBlocks}
    </div>
  );
}

export default MeetingList;
