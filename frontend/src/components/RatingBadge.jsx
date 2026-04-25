import React from 'react';

const RatingBadge = ({ rating }) => {
  return (
    <div style={ratingBadgeStyle} title="Ваш общий рейтинг!">
      <span style={{ fontSize: '18px' }}>⭐</span>
      <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{rating || 0}</span>
    </div>
  );
};

// Стили полностью повторяют StreakBadge для симметрии
const ratingBadgeStyle = {
  background: 'rgba(255, 215, 0, 0.15)', // Золотистый полупрозрачный фон
  color: '#ffd700',                      // Золотой цвет текста
  padding: '6px 14px',
  borderRadius: '20px',
  border: '1px solid #ffd700',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  boxShadow: '0 0 10px rgba(255, 215, 0, 0.2)', // Свечение как у огонька
  cursor: 'default',
  transition: 'transform 0.2s ease',
  marginLeft: '10px' // Отступ от огонька
};

export default RatingBadge;