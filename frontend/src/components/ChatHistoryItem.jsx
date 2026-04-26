import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const ChatHistoryItem = ({ session, isActive, onClick, onRename, onDelete }) => {
  const { t } = useTranslation();

  const [showMenu, setShowMenu] = useState(false);
  const itemRef = useRef(null);

  const sessionId = session.id || session.session_id;
  const title = session.title || t('ai.new_chat', 'Новый чат');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (itemRef.current && !itemRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showMenu]);

  const handleRename = (e) => {
    e.stopPropagation();
    setShowMenu(false);

    if (onRename) {
      onRename(e, sessionId);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);

    if (onDelete) {
      onDelete(e, sessionId);
    }
  };

  return (
    <div ref={itemRef} className="chat-history-wrap">
      <div
        onClick={onClick}
        className={`chat-history-item ${isActive ? 'active' : ''}`}
      >
        <div className="chat-history-main">
          <span className="chat-history-icon">💬</span>

          <span className="chat-history-title">
            {title}
          </span>
        </div>

        <button
          type="button"
          className="chat-history-dots"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu((prev) => !prev);
          }}
          aria-label="Chat menu"
        >
          ⋮
        </button>
      </div>

      {showMenu && (
        <div className="chat-history-actions">
          <button
            type="button"
            className="chat-history-action"
            onClick={handleRename}
          >
            <span>✏️</span>
            <span>{t('ai.rename', 'Переименовать')}</span>
          </button>

          <button
            type="button"
            className="chat-history-action danger"
            onClick={handleDelete}
          >
            <span>🗑️</span>
            <span>{t('modal.delete', 'Удалить')}</span>
          </button>
        </div>
      )}

      <style>{`
.chat-history-wrap {
  position: relative;
  width: 100%;
  min-width: 0;
}

.chat-history-item {
  width: 100%;
  min-width: 0;
  min-height: 54px;
  padding: 12px 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  transition: all 0.22s ease;
  border-radius: 14px;
  border: 1px solid transparent;
  background: transparent;
  color: #abb2bf;
  box-sizing: border-box;
}

.chat-history-item:hover {
  background: rgba(255, 255, 255, 0.035);
}

.chat-history-item.active {
  background: rgba(97, 218, 251, 0.10);
  border-color: rgba(97, 218, 251, 0.25);
  color: #61dafb;
}

.chat-history-main {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  gap: 10px;
}

.chat-history-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.chat-history-title {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 700;
}

.chat-history-item.active .chat-history-title {
  font-weight: 900;
}

.chat-history-dots {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #abb2bf;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.chat-history-item:hover .chat-history-dots,
.chat-history-dots:focus,
.chat-history-item.active .chat-history-dots {
  opacity: 1;
}

.chat-history-dots:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.chat-history-actions {
  position: absolute;
  top: 48px;
  right: 8px;
  z-index: 40;
  min-width: 190px;
  border-radius: 14px;
  background: #21252b;
  border: 1px solid #3e4451;
  box-shadow: 0 18px 50px rgba(0,0,0,0.55);
  overflow: hidden;
}

.chat-history-action {
  width: 100%;
  min-height: 46px;
  border: none;
  background: transparent;
  color: #abb2bf;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
}

.chat-history-action:hover {
  background: rgba(255,255,255,0.07);
  color: #fff;
}

.chat-history-action.danger {
  color: #ff7777;
  border-top: 1px solid rgba(255,255,255,0.06);
}

@media (max-width: 768px) {
  .chat-history-item {
    min-height: 58px;
    padding: 12px;
    border-radius: 16px;
    background: rgba(255,255,255,0.035);
    border-color: rgba(255,255,255,0.04);
  }

  .chat-history-item.active {
    background: rgba(97, 218, 251, 0.11);
    border-color: rgba(97, 218, 251, 0.30);
  }

  .chat-history-title {
    font-size: 13px;
  }

  .chat-history-dots {
    opacity: 1;
    width: 38px;
    height: 38px;
    border-radius: 14px;
    background: rgba(255,255,255,0.04);
  }

  .chat-history-actions {
    position: static;
    width: 100%;
    min-width: 0;
    margin-top: 8px;
    border-radius: 16px;
    background: rgba(255,255,255,0.045);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: none;
  }

  .chat-history-action {
    min-height: 50px;
    font-size: 14px;
    border-radius: 0;
  }

  .chat-history-action:first-child {
    border-radius: 16px 16px 0 0;
  }

  .chat-history-action:last-child {
    border-radius: 0 0 16px 16px;
  }
}
      `}</style>
    </div>
  );
};

export default ChatHistoryItem;