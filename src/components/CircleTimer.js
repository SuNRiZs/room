import React from 'react';
import moment from 'moment';

function CircleTimer({ currentStatus, timerEvent, totalSec, timeLeftSec }) {
  if (!timerEvent || totalSec <= 0 || timeLeftSec <= 0) {
    return null;
  }

  const progress = timeLeftSec > 0 ? ((totalSec - timeLeftSec) / totalSec) * 100 : 100;
  const timeLeftFormatted = `${Math.floor(timeLeftSec / 60)}:${(timeLeftSec % 60).toString().padStart(2, '0')}`;

  return (
    <div className="progress-container">
      <div className={`progress-bar ${currentStatus === 'ОЖИДАНИЕ' ? 'waiting' : ''}`}>
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="timer">{timeLeftFormatted}</div>
    </div>
  );
}

export default CircleTimer;