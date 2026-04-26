import React, { useState, useRef, useEffect } from 'react';

const UserProfile = ({ username, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div className="user-profile-root" style={{ position: 'relative' }} ref={menuRef}>
      <button
        type="button"
        className="profile-badge-animated user-profile-badge"
        onClick={() => setIsOpen((prev) => !prev)}
        style={userBadgeStyle}
      >
        <span className="user-profile-icon" style={{ fontSize: '18px' }}>
          👤
        </span>

        <span className="user-profile-name" style={{ fontWeight: '500' }}>
          {username || 'User'}
        </span>
      </button>

      {isOpen && (
        <div className="history-dropdown user-profile-dropdown" style={dropdownStyle}>
          <button
            type="button"
            className="user-profile-menu-item"
            style={menuItemStyle}
            onClick={() => alert('Настройки в разработке')}
          >
            <span>⚙️</span>
            <span>Настройки</span>
          </button>

          <button
            type="button"
            className="user-profile-menu-item user-profile-menu-item--danger"
            style={{ ...menuItemStyle, color: '#e06c75' }}
            onClick={handleLogout}
          >
            <span>🚪</span>
            <span>Выйти</span>
          </button>
        </div>
      )}

      <style>{`
.user-profile-root {
  max-width: 100%;
}

.user-profile-badge {
  border: 1px solid rgba(97, 218, 251, 0.3);
}

.user-profile-badge:hover {
  transform: translateY(-1px);
  border-color: rgba(97, 218, 251, 0.55) !important;
  box-shadow: 0 8px 24px rgba(97, 218, 251, 0.12);
}

.user-profile-badge:active {
  transform: scale(0.985);
}

.user-profile-name {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-profile-menu-item {
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  font-family: inherit;
}

.user-profile-menu-item:hover {
  background: rgba(255,255,255,0.06) !important;
}

/* Phone UI */
@media (max-width: 768px) {
  .user-profile-root {
    max-width: 100%;
    display: flex;
    justify-content: flex-end;
  }

  .user-profile-badge {
    max-width: 100%;
    min-width: 0;
    min-height: 42px;
    padding: 8px 12px !important;
    border-radius: 999px !important;
    gap: 8px !important;
    font-size: 13px !important;
    box-sizing: border-box !important;
  }

  .user-profile-icon {
    font-size: 17px !important;
    flex-shrink: 0;
  }

  .user-profile-name {
    max-width: 88px;
    min-width: 0;
    font-size: 13px;
    font-weight: 800 !important;
  }

  .user-profile-dropdown {
    position: fixed !important;
    top: 112px !important;
    right: 12px !important;
    left: auto !important;
    width: min(260px, calc(100vw - 24px)) !important;
    min-width: 0 !important;
    padding: 10px !important;
    border-radius: 18px !important;
    z-index: 2000 !important;
    box-sizing: border-box !important;
    background: rgba(33, 37, 43, 0.98) !important;
    backdrop-filter: blur(16px);
    box-shadow: 0 18px 60px rgba(0,0,0,0.46) !important;
  }

  .user-profile-menu-item {
    min-height: 48px !important;
    padding: 12px 14px !important;
    border-radius: 14px !important;
    font-size: 14px !important;
    font-weight: 800 !important;
    touch-action: manipulation;
  }
}

/* Small phone */
@media (max-width: 430px) {
  .user-profile-badge {
    min-height: 40px;
    padding: 7px 10px !important;
  }

  .user-profile-name {
    max-width: 70px;
    font-size: 12px;
  }

  .user-profile-dropdown {
    top: 110px !important;
    right: 8px !important;
    width: min(240px, calc(100vw - 16px)) !important;
  }
}
      `}</style>
    </div>
  );
};

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
  transition: 'all 0.3s ease',
  fontFamily: 'inherit'
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