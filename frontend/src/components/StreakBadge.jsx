import React from 'react';

const StreakBadge = ({ count }) => {
    return (
    <div style={streakBadgeStyle} title="Ваша серия посещений!">
      <span style={{ fontSize: '18px' }}>🔥</span>
      <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{count || 0}</span>
    </div>
  );
};

// Стили для огонька
const streakBadgeStyle = {
  background: 'rgba(255, 152, 0, 0.15)',
  color: '#ff9800',
  padding: '6px 14px',
  borderRadius: '20px',
  border: '1px solid #ff9800',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  boxShadow: '0 0 10px rgba(255, 152, 0, 0.1)',
  cursor: 'default',
  transition: 'transform 0.2s ease',
};

export default StreakBadge;