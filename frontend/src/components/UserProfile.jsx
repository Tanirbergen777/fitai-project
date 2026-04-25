import React, { useState, useRef, useEffect } from 'react';

const UserProfile = ({ username, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      {/* Сама кнопка профиля */}
      <div
        className="profile-badge-animated"
        onClick={() => setIsOpen(!isOpen)}
        style={userBadgeStyle}
      >
        <span style={{ fontSize: '18px' }}>👤</span>
        <span style={{ fontWeight: '500' }}>{username}</span>
      </div>

      {/* Выпадающее меню */}
      {isOpen && (
        <div className="history-dropdown" style={dropdownStyle}>
          <div style={menuItemStyle} onClick={() => alert('Настройки в разработке')}>
            ⚙️ Настройки
          </div>
          <div
            style={{ ...menuItemStyle, color: '#e06c75' }}
            onClick={handleLogout}
          >
            🚪 Выйти
          </div>
        </div>
      )}
    </div>
  );
};

// Стили внутри компонента
const userBadgeStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  background: 'rgba(97, 218, 251, 0.05)',
  padding: '8px 18px',
  borderRadius: '25px',
  border: '1px solid rgba(97, 218, 251, 0.3)',
  fontSize: '14px',
  cursor: 'pointer',
  backdropFilter: 'blur(10px)',
  color: 'white',
  transition: 'all 0.3s ease'
};

const dropdownStyle = {
  position: 'absolute',
  top: '50px',
  right: '0',
  backgroundColor: '#21252b',
  border: '1px solid #3e4451',
  borderRadius: '12px',
  padding: '8px',
  minWidth: '160px',
  zIndex: 1000,
  boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
};

const menuItemStyle = {
  padding: '10px 15px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '13px',
  transition: 'background 0.2s',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  color: '#abb2bf'
};

export default UserProfile;