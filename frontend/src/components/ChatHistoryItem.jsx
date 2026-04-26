import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

const ChatHistoryItem = ({ session, isActive, onClick, onRename, onDelete }) => {
  const { t } = useTranslation();

  const [showMenu, setShowMenu] = useState(false);

  const itemRef = useRef(null);
  const desktopMenuRef = useRef(null);
  const mobileSheetRef = useRef(null);

  const sessionId = session.id || session.session_id;
  const title = session.title || t('ai.new_chat', 'Новый чат');

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;

      const clickedInsideItem = itemRef.current?.contains(target);
      const clickedInsideDesktopMenu = desktopMenuRef.current?.contains(target);
      const clickedInsideMobileSheet = mobileSheetRef.current?.contains(target);

      if (!clickedInsideItem && !clickedInsideDesktopMenu && !clickedInsideMobileSheet) {
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

  const openMenu = (e) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

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

  const closeMenu = (e) => {
    e.stopPropagation();
    setShowMenu(false);
  };

  const mobileMenu =
    showMenu && typeof document !== 'undefined'
      ? createPortal(
          <>
            <div
              className="chat-history-mobile-backdrop"
              onClick={closeMenu}
            />

            <div
              ref={mobileSheetRef}
              className="chat-history-mobile-sheet"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="chat-history-mobile-sheet-title">
                {title}
              </div>

              <button
                type="button"
                className="chat-history-mobile-action"
                onClick={handleRename}
              >
                <span>✏️</span>
                <span>{t('ai.rename', 'Переименовать')}</span>
              </button>

              <button
                type="button"
                className="chat-history-mobile-action danger"
                onClick={handleDelete}
              >
                <span>🗑️</span>
                <span>{t('modal.delete', 'Удалить')}</span>
              </button>

              <button
                type="button"
                className="chat-history-mobile-action cancel"
                onClick={closeMenu}
              >
                {t('modal.cancel', 'Отмена')}
              </button>
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <>
      <div
        ref={itemRef}
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
          onClick={openMenu}
          aria-label="Chat menu"
        >
          ⋮
        </button>

        {showMenu && (
          <div
            ref={desktopMenuRef}
            className="chat-history-dropdown"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="chat-history-menu-option"
              onClick={handleRename}
            >
              <span>✏️</span>
              <span>{t('ai.rename', 'Переименовать')}</span>
            </button>

            <button
              type="button"
              className="chat-history-menu-option danger"
              onClick={handleDelete}
            >
              <span>🗑️</span>
              <span>{t('modal.delete', 'Удалить')}</span>
            </button>
          </div>
        )}

        <style>{`
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
  position: relative;
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

.chat-history-dropdown {
  position: absolute;
  top: 46px;
  right: 8px;
  background: #21252b;
  border: 1px solid #3e4451;
  border-radius: 14px;
  z-index: 2000;
  min-width: 190px;
  box-shadow: 0 18px 50px rgba(0,0,0,0.55);
  overflow: hidden;
}

.chat-history-menu-option {
  width: 100%;
  border: none;
  background: transparent;
  padding: 13px 15px;
  cursor: pointer;
  font-size: 13px;
  color: #abb2bf;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  font-family: inherit;
}

.chat-history-menu-option:hover {
  background: rgba(255,255,255,0.07);
  color: #fff;
}

.chat-history-menu-option.danger {
  color: #ff6b6b;
  border-top: 1px solid rgba(255,255,255,0.06);
}

/* Phone item */
@media (max-width: 768px) {
  .chat-history-item {
    min-height: 58px;
    padding: 12px 12px;
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

  .chat-history-dropdown {
    display: none;
  }
}

/* Portal mobile menu */
.chat-history-mobile-backdrop {
  display: none;
}

.chat-history-mobile-sheet {
  display: none;
}

@media (max-width: 768px) {
  .chat-history-mobile-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 12000;
    background: rgba(0,0,0,0.58);
    backdrop-filter: blur(2px);
  }

  .chat-history-mobile-sheet {
    display: flex;
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: calc(92px + env(safe-area-inset-bottom, 0px));
    z-index: 12001;
    flex-direction: column;
    gap: 8px;
    padding: 14px;
    border-radius: 22px;
    background: rgba(31, 36, 46, 0.98);
    border: 1px solid rgba(255,255,255,0.10);
    box-shadow: 0 18px 70px rgba(0,0,0,0.65);
    backdrop-filter: blur(16px);
    box-sizing: border-box;
  }

  .chat-history-mobile-sheet-title {
    color: #fff;
    font-size: 14px;
    font-weight: 900;
    padding: 6px 6px 10px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chat-history-mobile-action {
    width: 100%;
    min-height: 52px;
    border: none;
    border-radius: 16px;
    background: rgba(255,255,255,0.06);
    color: #eef4ff;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 14px;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    font-family: inherit;
    text-align: left;
    touch-action: manipulation;
  }

  .chat-history-mobile-action.danger {
    color: #ff7777;
    background: rgba(255, 88, 88, 0.10);
  }

  .chat-history-mobile-action.cancel {
    justify-content: center;
    color: #abb2bf;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.08);
    margin-top: 4px;
  }
}

@media (max-width: 430px) {
  .chat-history-mobile-sheet {
    left: 8px;
    right: 8px;
    bottom: calc(88px + env(safe-area-inset-bottom, 0px));
    padding: 12px;
    border-radius: 20px;
  }

  .chat-history-mobile-action {
    min-height: 50px;
    font-size: 14px;
  }
}
        `}</style>
      </div>

      {mobileMenu}
    </>
  );
};

export default ChatHistoryItem;