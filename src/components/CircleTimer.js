import React from 'react';

function CircleTimer({
  timeLeftSec,
  totalSec,
  fillMode = "forward",
  circleColor = "#fff",
  trackColor = "rgba(255,255,255,0.2)",
  size = 240,
  radius = 70,
  strokeWidth = 8
}) {
  const padding = strokeWidth / 2;
  const dimension = 2 * radius + 2 * padding;
  const circumference = 2 * Math.PI * radius;
  let offset = circumference;
  let label = "0:00";

  if (totalSec > 0) {
    const progress = fillMode === "forward"
      ? 1 - (timeLeftSec / totalSec)
      : (timeLeftSec / totalSec);
    offset = circumference - (progress * circumference);
    const m = Math.floor(timeLeftSec / 60);
    const s = timeLeftSec % 60;
    label = `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  return (
    <div style={{
      position: 'relative',
      width: `${size}px`,
      height: `${size}px`,
      overflow: 'visible'
    }}>
      <svg
        width={size}
        height={size}
        viewBox={`-${padding} -${padding} ${dimension} ${dimension}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Фоновый трек */}
        <circle
          cx={radius}
          cy={radius}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Прогрессирующий круг */}
        <circle
          cx={radius}
          cy={radius}
          r={radius}
          fill="none"
          stroke={circleColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s linear' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: circleColor,
        // Используем tabular-nums, чтобы цифры занимали одинаковое пространство:
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.05em', // добавлен небольшой промежуток между цифрами
        textAlign: 'center'
      }}>
        {label}
      </div>
    </div>
  );
}

export default CircleTimer;
