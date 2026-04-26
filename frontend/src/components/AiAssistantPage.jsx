import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ChatHistoryItem from './ChatHistoryItem';
import { API_BASE_URL } from '../config/api';

const AiAssistantPage = ({
  aiResult,
  userId,
  currentSessionId,
  setCurrentSessionId,
  refreshSessions,
  sessions = [],
  handleCreateNewChat,
  openDeleteModal,
  handleRenameChat
}) => {
  const { t } = useTranslation();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const safeSessions = useMemo(() => {
    return Array.isArray(sessions) ? sessions : [];
  }, [sessions]);

  const sessionExists = useCallback(
    (sid) => {
      if (!sid) return false;

      return safeSessions.some((session) => {
        const sessionId = session.id || session.session_id;
        return Number(sessionId) === Number(sid);
      });
    },
    [safeSessions]
  );

  const currentSessionTitle = useMemo(() => {
    if (!currentSessionId) return t('ai.new_chat', 'Новый чат');

    const found = safeSessions.find((session) => {
      const sessionId = session.id || session.session_id;
      return Number(sessionId) === Number(currentSessionId);
    });

    return found?.title || t('ai.new_chat', 'Новый чат');
  }, [currentSessionId, safeSessions, t]);

  useEffect(() => {
    if (!currentSessionId) return;
    if (safeSessions.length === 0) return;

    if (!sessionExists(currentSessionId)) {
      setCurrentSessionId(null);
      localStorage.removeItem('lastSessionId');
      setMessages([
        {
          text: t('ai.welcome_message', {
            status: aiResult?.status || 'Анализирую...'
          }),
          isBot: true
        }
      ]);
    }
  }, [currentSessionId, safeSessions, sessionExists, setCurrentSessionId, t, aiResult]);

  useEffect(() => {
    if (currentSessionId) {
      const fetchHistory = async () => {
        try {
          setIsLoading(true);

          const response = await fetch(`${API_BASE_URL}/ai/history/${currentSessionId}`);

          if (response.status === 404) {
            setCurrentSessionId(null);
            localStorage.removeItem('lastSessionId');

            setMessages([
              {
                text: t('ai.session_not_found', 'Этот чат был удалён. Начните новый чат.'),
                isBot: true
              }
            ]);

            if (typeof refreshSessions === 'function') {
              refreshSessions();
            }

            return;
          }

          const data = await response.json();

          if (data.messages) {
            setMessages(
              data.messages.map((msg) => ({
                text: msg.content,
                isBot: msg.role !== 'user'
              }))
            );
          } else {
            setMessages([]);
          }
        } catch (error) {
          console.error('Ошибка загрузки истории:', error);
          setMessages([
            {
              text: t('ai.history_load_error', '⚠️ История чата не загрузилась. Попробуйте снова.'),
              isBot: true
            }
          ]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchHistory();
    } else {
      setMessages([
        {
          text: t('ai.welcome_message', {
            status: aiResult?.status || 'Анализирую...'
          }),
          isBot: true
        }
      ]);
    }
  }, [currentSessionId, t, aiResult, setCurrentSessionId, refreshSessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const activeSessionId = sessionExists(currentSessionId) ? Number(currentSessionId) : null;

    setMessages((prev) => [...prev, { text: userMessage, isBot: false }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: Number(userId),
          message: userMessage,
          session_id: activeSessionId
        })
      });

      const data = await res.json();

      if (res.ok) {
        if (data.session_id) {
          const isNew = !activeSessionId;

          setCurrentSessionId(data.session_id);
          localStorage.setItem('lastSessionId', String(data.session_id));

          if (typeof refreshSessions === 'function') {
            if (isNew) {
              setTimeout(() => {
                refreshSessions();
              }, 600);
            } else {
              refreshSessions();
            }
          }
        }

        if (data.reply) {
          setMessages((prev) => [...prev, { text: data.reply, isBot: true }]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              text: t('ai.empty_reply_error', '⚠️ Сервер не вернул ответ. Попробуйте ещё раз.'),
              isBot: true
            }
          ]);
        }
      } else {
        const errorDetail = data.detail || t('ai.server_error', 'Неизвестная ошибка сервера');

        if (String(errorDetail).includes('Сессия не найдена')) {
          setCurrentSessionId(null);
          localStorage.removeItem('lastSessionId');

          setMessages((prev) => [
            ...prev,
            {
              text: t('ai.session_not_found', 'Этот чат был удалён. Я начал новый чат. Отправьте сообщение ещё раз.'),
              isBot: true
            }
          ]);

          if (typeof refreshSessions === 'function') {
            refreshSessions();
          }

          return;
        }

        setMessages((prev) => [
          ...prev,
          { text: `❌ ${errorDetail}`, isBot: true }
        ]);
      }
    } catch (err) {
      console.error('Chat Error:', err);

      setMessages((prev) => [
        ...prev,
        {
          text: t('ai.connection_error', '⚠️ Ошибка соединения. Проверьте, работает ли сервер.'),
          isBot: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSessionClick = (sessionId) => {
    setCurrentSessionId(sessionId);
    localStorage.setItem('lastSessionId', String(sessionId));
    setIsMobileHistoryOpen(false);
  };

  const handleNewChat = () => {
    setIsMobileHistoryOpen(false);

    if (typeof handleCreateNewChat === 'function') {
      handleCreateNewChat();
    }
  };

  return (
    <div className="ai-page">
      <div className="ai-mobile-toolbar">
        <button
          type="button"
          className="ai-mobile-history-btn"
          onClick={() => setIsMobileHistoryOpen(true)}
        >
          ☰ {t('ai.history_title', 'История')}
        </button>

        <div className="ai-mobile-current-chat">
          💬 {currentSessionTitle}
        </div>
      </div>

      <div
        className={`ai-mobile-history-backdrop ${isMobileHistoryOpen ? 'show' : ''}`}
        onClick={() => setIsMobileHistoryOpen(false)}
      />

      <aside className={`ai-history-sidebar ${isMobileHistoryOpen ? 'mobile-open' : ''}`}>
        <div className="ai-mobile-drawer-head">
          <strong>{t('ai.history_title', 'История чатов')}</strong>

          <button
            type="button"
            className="ai-mobile-drawer-close"
            onClick={() => setIsMobileHistoryOpen(false)}
          >
            ×
          </button>
        </div>

        <button
          type="button"
          onClick={handleNewChat}
          className="ai-new-chat-btn"
        >
          + {t('ai.new_chat', 'Новый чат')}
        </button>

        <div className="ai-history-title">
          {t('ai.history_title', 'История чатов')}
        </div>

        <div className="ai-history-list">
          {safeSessions.length > 0 ? (
            safeSessions.map((session) => {
              const sessionId = session.id || session.session_id;

              return (
                <ChatHistoryItem
                  key={sessionId}
                  session={session}
                  isActive={Number(currentSessionId) === Number(sessionId)}
                  onClick={() => handleSessionClick(sessionId)}
                  onRename={handleRenameChat}
                  onDelete={openDeleteModal}
                />
              );
            })
          ) : (
            <div className="ai-history-empty">
              {t('ai.no_history', 'История пока пуста')}
            </div>
          )}
        </div>
      </aside>

      <section className="ai-chat-container">
        <div className="ai-messages-list">
          {messages.map((msg, idx) => (
            <div
              key={`${idx}-${String(msg.text).slice(0, 30)}`}
              className={`ai-message-wrapper ${msg.isBot ? 'bot' : 'user'}`}
            >
              <div className={`ai-message-bubble ${msg.isBot ? 'bot' : 'user'}`}>
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="ai-message-wrapper bot">
              <div className="ai-message-bubble bot">
                <div className="typing-container">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className="ai-input-area" onSubmit={handleSubmit}>
          <div className="ai-composer-box">
            <textarea
              ref={textareaRef}
              className="ai-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('ai.input_placeholder', 'Спроси про диету или упражнения...')}
              disabled={isLoading}
              rows={1}
            />

            <button
              type="submit"
              className="ai-send-button"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? t('ai.sending', 'Отправка...') : t('ai.send_btn', 'Отправить')}
            </button>
          </div>
        </form>
      </section>

      <style>{`
.ai-page {
  position: relative;
  display: flex;
  gap: 20px;
  width: 100%;
  height: calc(100vh - 130px);
  min-height: 620px;
  padding: 10px;
  box-sizing: border-box;
  min-width: 0;
}

.ai-mobile-toolbar,
.ai-mobile-history-backdrop,
.ai-mobile-drawer-head {
  display: none;
}

.ai-history-sidebar {
  width: 300px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border-radius: 24px;
  background: rgba(20, 24, 32, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  box-sizing: border-box;
  overflow: hidden;
}

.ai-new-chat-btn {
  width: 100%;
  min-height: 50px;
  border: 1px solid rgba(97, 218, 251, 0.35);
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(97, 218, 251, 0.18) 0%, rgba(74, 144, 226, 0.12) 100%);
  color: #72dfff;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.25s ease;
}

.ai-new-chat-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(97, 218, 251, 0.55);
  box-shadow: 0 10px 24px rgba(97, 218, 251, 0.12);
}

.ai-history-title {
  color: #72dfff;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-align: center;
  opacity: 0.9;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.ai-history-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 2px;
  -webkit-overflow-scrolling: touch;
}

.ai-history-empty {
  color: rgba(255,255,255,0.6);
  padding: 16px;
  border-radius: 16px;
  border: 1px dashed rgba(255,255,255,0.1);
  text-align: center;
  font-size: 14px;
}

.ai-chat-container {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  background: rgba(12, 15, 22, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.ai-messages-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
}

.ai-message-wrapper {
  display: flex;
  width: 100%;
}

.ai-message-wrapper.bot {
  justify-content: flex-start;
}

.ai-message-wrapper.user {
  justify-content: flex-end;
}

.ai-message-bubble {
  max-width: min(78%, 760px);
  padding: 14px 18px;
  border-radius: 18px;
  line-height: 1.6;
  font-size: 15px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  box-sizing: border-box;
}

.ai-message-bubble.bot {
  background: rgba(34, 39, 49, 0.9);
  color: #eef4ff;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 18px 18px 18px 6px;
}

.ai-message-bubble.user {
  background: linear-gradient(135deg, #66d9ff 0%, #52bdf2 100%);
  color: #102033;
  font-weight: 700;
  border-radius: 18px 18px 6px 18px;
}

.typing-container {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 18px;
}

.typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #69dfff;
  animation: aiTyping 1s infinite ease-in-out;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.15s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes aiTyping {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.45;
  }
  40% {
    transform: translateY(-5px);
    opacity: 1;
  }
}

.ai-input-area {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 18, 25, 0.94);
  box-sizing: border-box;
}

.ai-composer-box {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.ai-input {
  flex: 1;
  min-width: 0;
  min-height: 52px;
  max-height: 140px;
  resize: none;
  overflow-y: auto;
  border-radius: 16px;
  border: 1px solid rgba(97, 218, 251, 0.2);
  background: rgba(25, 31, 41, 0.98) !important;
  color: #f2f7ff !important;
  -webkit-text-fill-color: #f2f7ff !important;
  outline: none;
  padding: 14px 16px;
  font-size: 15px;
  line-height: 1.45;
  box-sizing: border-box;
  appearance: none;
  -webkit-appearance: none;
  font-family: inherit;
  caret-color: #69dfff;
}

.ai-input::placeholder {
  color: rgba(229, 236, 250, 0.5);
  -webkit-text-fill-color: rgba(229, 236, 250, 0.5);
}

.ai-input:focus {
  border-color: rgba(97, 218, 251, 0.6);
  box-shadow: 0 0 0 4px rgba(97, 218, 251, 0.12);
}

.ai-input:-webkit-autofill,
.ai-input:-webkit-autofill:hover,
.ai-input:-webkit-autofill:focus,
.ai-input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px rgba(25, 31, 41, 1) inset !important;
  -webkit-text-fill-color: #f2f7ff !important;
  caret-color: #f2f7ff !important;
  transition: background-color 9999s ease-in-out 0s;
}

.ai-send-button {
  min-width: 140px;
  min-height: 52px;
  padding: 0 20px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 800;
  color: #102033;
  background: linear-gradient(135deg, #69dfff 0%, #52bdf2 100%);
  transition: 0.25s ease;
  touch-action: manipulation;
}

.ai-send-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 1100px) {
  .ai-history-sidebar {
    width: 260px;
    min-width: 260px;
  }

  .ai-message-bubble {
    max-width: 86%;
  }
}

/* PHONE UI */
@media (max-width: 768px) {
  .ai-page {
    flex-direction: column;
    gap: 10px;
    height: calc(100dvh - 112px);
    min-height: 0;
    padding: 0 0 calc(86px + env(safe-area-inset-bottom, 0px));
    overflow: hidden;
  }

  .ai-mobile-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .ai-mobile-history-btn {
    min-height: 44px;
    border: 1px solid rgba(97, 218, 251, 0.35);
    border-radius: 14px;
    background: rgba(97, 218, 251, 0.12);
    color: #72dfff;
    font-size: 14px;
    font-weight: 900;
    padding: 0 14px;
    cursor: pointer;
  }

  .ai-mobile-current-chat {
    min-width: 0;
    flex: 1;
    height: 44px;
    padding: 0 12px;
    border-radius: 14px;
    background: rgba(255,255,255,0.035);
    border: 1px solid rgba(255,255,255,0.06);
    color: #cdd6e5;
    display: flex;
    align-items: center;
    font-size: 13px;
    font-weight: 800;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .ai-mobile-history-backdrop {
    display: none;
    position: absolute;
    inset: 0;
    z-index: 80;
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(2px);
  }

  .ai-mobile-history-backdrop.show {
    display: block;
  }

  .ai-history-sidebar {
    position: absolute;
    top: 54px;
    left: 0;
    bottom: calc(86px + env(safe-area-inset-bottom, 0px));
    width: min(88vw, 360px);
    min-width: 0;
    z-index: 90;
    transform: translateX(calc(-100% - 16px));
    transition: transform 0.25s ease;
    padding: 12px;
    border-radius: 20px;
    background: rgba(20, 24, 32, 0.98);
    box-shadow: 0 24px 80px rgba(0,0,0,0.55);
  }

  .ai-history-sidebar.mobile-open {
    transform: translateX(0);
  }

  .ai-mobile-drawer-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: white;
    font-size: 16px;
    padding: 4px 2px 2px;
  }

  .ai-mobile-drawer-close {
    width: 38px;
    height: 38px;
    border: none;
    border-radius: 14px;
    background: rgba(255,255,255,0.06);
    color: white;
    font-size: 28px;
    cursor: pointer;
  }

  .ai-history-title {
    display: none;
  }

  .ai-history-list {
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    gap: 10px;
    padding-right: 0;
  }

  .ai-chat-container {
    flex: 1;
    min-height: 0;
    border-radius: 18px;
  }

  .ai-messages-list {
    padding: 12px 10px;
    gap: 10px;
  }

  .ai-message-bubble {
    max-width: 94%;
    padding: 12px 14px;
    font-size: 14px;
    line-height: 1.5;
  }

  .ai-input-area {
    padding: 8px;
    background: rgba(15, 18, 25, 0.98);
  }

  .ai-composer-box {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .ai-input {
    min-height: 48px;
    max-height: 120px;
    font-size: 16px;
    border-radius: 15px;
    padding: 13px 14px;
  }

  .ai-send-button {
    width: 100%;
    min-width: 0;
    min-height: 46px;
    border-radius: 15px;
    font-size: 14px;
  }
}

@media (max-width: 430px) {
  .ai-page {
    height: calc(100dvh - 108px);
    padding-bottom: calc(84px + env(safe-area-inset-bottom, 0px));
  }

  .ai-history-sidebar {
    top: 52px;
    bottom: calc(84px + env(safe-area-inset-bottom, 0px));
    width: min(90vw, 340px);
  }
}
      `}</style>
    </div>
  );
};

export default AiAssistantPage;