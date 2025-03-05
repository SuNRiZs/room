import React from 'react';
import moment from 'moment';

const Header = () => {
  const now = moment();
  return (
    <div className="header">
        <object type="image/svg+xml" data="/logo.svg" className="header-logo" aria-label="Logo"></object>
        <div className="header-time">
          <div className="current-time">{now.format('HH:mm')}</div>
          <div className="header-date-day">
            <div className="current-day">{now.format('dddd')}</div>
            <div className="current-date">{now.format('DD.MM.YYYY')}</div>
          </div>
        </div>
    </div>
  );
};

export default Header;
