import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ChatHistoryItem from './ChatHistoryItem';
import { API_BASE_URL } from '../config/api';

const AiAssistantPage = ({
  aiResult,
  userId,
  currentSessionId,
  setCurrentSessionId,
  refreshSessions,
  sessions,
  handleCreateNewChat,
  openDeleteModal,
  handleRenameChat
}) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentSessionId) {
      const fetchHistory = async () => {
        try {
          setIsLoading(true);

          const response = await fetch(`${API_BASE_URL}/ai/history/${currentSessionId}`);
          const data = await response.json();

          if (data.messages) {
            setMessages(
              data.messages.map((msg) => ({
                text: msg.content,
                isBot: msg.role !== 'user'
              }))
            );
          }
        } catch (error) {
          console.error('Ошибка загрузки истории:', error);
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
  }, [currentSessionId, t, aiResult]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();

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
          session_id: currentSessionId ? Number(currentSessionId) : null
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.session_id) {
          const isNew = !currentSessionId;
          setCurrentSessionId(data.session_id);

          if (isNew) {
            setTimeout(() => {
              refreshSessions();
            }, 600);
          } else {
            refreshSessions();
          }
        }

        if (data.reply) {
          setMessages((prev) => [...prev, { text: data.reply, isBot: true }]);
        }
      } else {
        const errorDetail = data.detail || 'Неизвестная ошибка сервера';
        setMessages((prev) => [
          ...prev,
          { text: `❌ Ошибка: ${errorDetail}`, isBot: true }
        ]);
      }
    } catch (err) {
      console.error('Chat Error:', err);

      setMessages((prev) => [
        ...prev,
        {
          text: '⚠️ Ошибка соединения. Проверьте, запущен ли бэкенд.',
          isBot: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="ai-page">
      <aside className="ai-history-sidebar">
        <button
          type="button"
          onClick={handleCreateNewChat}
          className="ai-new-chat-btn"
        >
          + {t('ai.new_chat', 'Новый чат')}
        </button>

        <div className="ai-history-title">
          {t('ai.history_title', 'История чатов')}
        </div>

        <div className="ai-history-list">
          {sessions.map((session) => {
            const sessionId = session.id || session.session_id;

            return (
              <ChatHistoryItem
                key={sessionId}
                session={session}
                isActive={currentSessionId === sessionId}
                onClick={() => setCurrentSessionId(sessionId)}
                onRename={handleRenameChat}
                onDelete={openDeleteModal}
              />
            );
          })}
        </div>
      </aside>

      <section className="ai-chat-container">
        <div className="ai-messages-list">
          {messages.map((msg, idx) => (
            <div
              key={`${msg.text}-${idx}`}
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
          <input
            className="ai-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('ai.input_placeholder', 'Напишите сообщение...')}
            disabled={isLoading}
          />

          <button
            type="submit"
            className="ai-send-button"
            disabled={isLoading || !input.trim()}
          >
            {t('ai.send_btn', 'Отправить')}
          </button>
        </form>
      </section>

      <style>{`
.ai-page {
  display: flex;
  gap: 20px;
  height: 90vh;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  min-width: 0;
}

.ai-history-sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: rgba(28, 30, 34, 0.2);
  padding: 15px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.05);
  box-sizing: border-box;
  min-width: 280px;
}

.ai-new-chat-btn {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(97, 218, 251, 0.2) 0%,
    rgba(74, 144, 226, 0.2) 100%
  );
  color: #61dafb;
  border: 1px solid rgba(97, 218, 251, 0.3);
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
  min-height: 46px;
  touch-action: manipulation;
}

.ai-new-chat-btn:hover {
  transform: translateY(-2px);
  border-color: rgba(97, 218, 251, 0.55);
  box-shadow: 0 12px 28px rgba(97, 218, 251, 0.12);
}

.ai-history-title {
  color: #61dafb;
  font-size: 12px;
  font-weight: 800;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
  opacity: 0.8;
  padding: 10px 0;
  border-bottom: 1px solid rgba(97, 218, 251, 0.1);
  margin-bottom: 15px;
}

.ai-history-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.ai-chat-container {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: rgba(20, 22, 26, 0.5);
  border-radius: 24px;
  border: 1px solid rgba(255,255,255,0.05);
  overflow: hidden;
}

.ai-messages-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
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
  padding: 14px 20px;
  max-width: 85%;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.55;
  box-sizing: border-box;
}

.ai-message-bubble.bot {
  background: rgba(40, 44, 52, 0.6);
  border-radius: 20px 20px 20px 5px;
  color: #e0e0e0;
}

.ai-message-bubble.user {
  background: linear-gradient(135deg, #61dafb 0%, #4a90e2 100%);
  border-radius: 20px 20px 5px 20px;
  color: #1c1e22;
  font-weight: 600;
}

.typing-container {
  display: flex;
  gap: 5px;
  align-items: center;
}

.typing-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #61dafb;
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
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
  box-sizing: border-box;
}

.ai-input {
  flex: 1;
  min-width: 0;
  background: #20232a;
  border: 1px solid #444;
  border-radius: 10px;
  padding: 12px;
  color: white;
  outline: none;
  font-size: 15px;
  box-sizing: border-box;
}

.ai-input:focus {
  border-color: rgba(97, 218, 251, 0.65);
  box-shadow: 0 0 0 4px rgba(97, 218, 251, 0.10);
}

.ai-send-button {
  background: #61dafb;
  border: none;
  border-radius: 10px;
  padding: 0 20px;
  font-weight: bold;
  cursor: pointer;
  color: #1c1e22;
  min-height: 44px;
  touch-action: manipulation;
}

.ai-send-button:disabled,
.ai-input:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* PHONE UI */
@media (max-width: 768px) {
  .ai-page {
    width: 100%;
    height: calc(100dvh - 120px);
    min-height: 0;
    padding: 0 0 96px;
    gap: 10px;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
  }

  .ai-history-sidebar {
    width: 100%;
    min-width: 0;
    flex-shrink: 0;
    padding: 10px;
    border-radius: 20px;
    gap: 10px;
    background: rgba(28, 30, 34, 0.72);
    backdrop-filter: blur(14px);
  }

  .ai-new-chat-btn {
    min-height: 44px;
    border-radius: 14px;
    font-size: 14px;
  }

  .ai-history-title {
    display: none;
  }

  .ai-history-list {
    max-height: 72px;
    min-height: 72px;
    overflow-x: auto;
    overflow-y: hidden;
    flex-direction: row;
    gap: 8px;
    padding-bottom: 2px;
    -webkit-overflow-scrolling: touch;
  }

  .ai-history-list > * {
    flex: 0 0 220px;
    max-width: 220px;
  }

  .ai-chat-container {
    flex: 1;
    min-height: 0;
    border-radius: 20px;
  }

  .ai-messages-list {
    padding: 14px 12px;
    gap: 12px;
  }

  .ai-message-bubble {
    max-width: 92%;
    padding: 12px 14px;
    font-size: 14px;
    line-height: 1.5;
  }

  .ai-message-bubble.bot {
    border-radius: 18px 18px 18px 5px;
  }

  .ai-message-bubble.user {
    border-radius: 18px 18px 5px 18px;
  }

  .ai-input-area {
    position: sticky;
    bottom: 0;
    z-index: 20;
    padding: 10px;
    gap: 8px;
    background: rgba(20, 22, 26, 0.96);
    backdrop-filter: blur(14px);
  }

  .ai-input {
    min-height: 48px;
    border-radius: 16px;
    padding: 0 14px;
    font-size: 16px;
  }

  .ai-send-button {
    min-width: 92px;
    min-height: 48px;
    border-radius: 16px;
    padding: 0 14px;
    font-size: 13px;
  }
}

/* SMALL PHONE */
@media (max-width: 430px) {
  .ai-page {
    height: calc(100dvh - 122px);
    padding-bottom: 94px;
  }

  .ai-history-sidebar {
    padding: 8px;
    border-radius: 18px;
  }

  .ai-history-list {
    max-height: 66px;
    min-height: 66px;
  }

  .ai-history-list > * {
    flex-basis: 190px;
    max-width: 190px;
  }

  .ai-messages-list {
    padding: 12px 10px;
  }

  .ai-message-bubble {
    max-width: 94%;
    font-size: 13px;
  }

  .ai-input-area {
    padding: 8px;
  }

  .ai-input {
    min-height: 46px;
  }

  .ai-send-button {
    min-width: 78px;
    min-height: 46px;
    font-size: 12px;
  }
}
      `}</style>
    </div>
  );
};

export default AiAssistantPage;