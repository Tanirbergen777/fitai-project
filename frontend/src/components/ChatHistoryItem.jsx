import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const ChatHistoryItem = ({ session, isActive, onClick, onRename, onDelete }) => {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef(null);

  // Используем правильный ID (либо id, либо session_id)
  const sessionId = session.id || session.session_id;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="chat-history-item"
      style={{
  ...itemStyle,
  backgroundColor: isActive
    ? 'rgba(97, 218, 251, 0.08)'
    : (isHovered ? 'rgba(255, 255, 255, 0.03)' : 'transparent'),
  borderColor: isActive ? 'rgba(97, 218, 251, 0.2)' : 'transparent',
  color: isActive ? '#61dafb' : '#abb2bf',
}}
    >
      <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', flex: 1 }}>
        <span style={{ marginRight: '10px', fontSize: '14px' }}>💬</span>
        <span style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontWeight: isActive ? 'bold' : 'normal'
        }}>
          {session.title || t('ai.new_chat')}
        </span>
      </div>

      <div style={{ position: 'relative' }} ref={menuRef}>
        <div
          onClick={(e) => {
            e.stopPropagation(); // Важно! Чтобы не сработал onClick всего элемента
            setShowMenu(!showMenu);
          }}
          style={{
            ...threeDotsStyle,
            opacity: isHovered || showMenu ? 1 : 0 // Показываем точки только при наведении
          }}
        >
          ⋮
        </div>

        {showMenu && (
          <div style={dropdownStyle}>
            <div style={menuOptionStyle} onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
              if (onRename) onRename(e, sessionId); // Передаем правильный ID
            }}>
              <span style={{fontSize: '14px'}}>✏️</span> {t('ai.rename', 'Переименовать')}
            </div>
            <div
              style={{ ...menuOptionStyle, color: '#ff4d4f', borderTop: '1px solid #333' }}
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                if (onDelete) onDelete(e, sessionId); // Передаем правильный ID
              }}
            >
              <span style={{fontSize: '14px'}}>🗑️</span> {t('modal.delete', 'Удалить')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- УЛУЧШЕННЫЕ СТИЛИ ---
const itemStyle = {
  padding: '12px 16px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: '13px',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  margin: '4px 12px',
  borderRadius: '10px',
  position: 'relative',
  border: '1px solid transparent'
};
const threeDotsStyle = {
  padding: '5px 10px',
  fontSize: '18px',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
  color: '#abb2bf'
};

const dropdownStyle = {
  position: 'absolute',
  top: '30px',
  right: '0',
  backgroundColor: '#21252b',
  border: '1px solid #3e4451',
  borderRadius: '10px',
  zIndex: 1000,
  minWidth: '170px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
  overflow: 'hidden'
};

const menuOptionStyle = {
  padding: '12px 15px',
  cursor: 'pointer',
  fontSize: '13px',
  color: '#abb2bf',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  background: 'transparent'
};

// Добавь это в свой App.css или в секцию стилей, если хочешь эффект наведения на пункты меню:
// .menu-option:hover { background-color: #3e4451; color: white; }

export default ChatHistoryItem;