import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ChatHistoryItem from './ChatHistoryItem';
import { API_BASE_URL } from '../config/api';
const AiAssistantPage = ({ aiResult, userId, currentSessionId, setCurrentSessionId, refreshSessions, sessions, handleCreateNewChat, openDeleteModal, handleRenameChat }) => {
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

        // ВАЖНО: берем данные из data.messages, так как мы изменили бэкенд выше
        if (data.messages) {
          setMessages(data.messages.map(msg => ({
            text: msg.content,
            isBot: msg.role !== 'user'
          })));
        }
      } catch (error) {
        console.error("Ошибка загрузки истории:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  } else {
    setMessages([{ text: t('ai.welcome_message', { status: aiResult?.status || 'Анализирую...' }), isBot: true }]);
  }
}, [currentSessionId, t, aiResult]);
const handleSend = async () => {
  if (!input.trim() || isLoading) return;

  const userMessage = input.trim();
  setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
  setInput('');
  setIsLoading(true);

  try {
    const res = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: Number(userId),
        message: userMessage,
        // Если session_id есть - шлем число, если нет - шлем null (FastAPI поймет как None)
        session_id: currentSessionId ? Number(currentSessionId) : null
      }),
    });

    const data = await res.json();

    if (res.ok) {
      // 1. Проверяем, пришел ли ID сессии
      if (data.session_id) {
        const isNew = !currentSessionId;
        setCurrentSessionId(data.session_id);

        // 2. Если это ПЕРВОЕ сообщение в чате, даем бэкенду 600мс
        // дописать название в базу, а потом обновляем список сессий
        if (isNew) {
          setTimeout(() => {
            refreshSessions();
          }, 600);
        } else {
          // Если чат уже существующий, просто обновляем список без задержки
          refreshSessions();
        }
      }

      // 3. Выводим ответ бота (используем data.reply, так как в ai.py у нас reply)
      if (data.reply) {
        setMessages(prev => [...prev, { text: data.reply, isBot: true }]);
      }

    } else {
      // Обработка случая, когда сервер ответил, но с ошибкой (например, 400 или 500)
      const errorDetail = data.detail || "Неизвестная ошибка сервера";
      setMessages(prev => [...prev, { text: `❌ Ошибка: ${errorDetail}`, isBot: true }]);
    }
  } catch (err) {
    // Ошибка сети (например, сервер выключен)
    console.error("Chat Error:", err);
    setMessages(prev => [...prev, { text: "⚠️ Ошибка соединения. Проверьте, запущен ли бэкенд.", isBot: true }]);
  } finally {
    setIsLoading(false);
  }
};

  // Автоматический скролл вниз при новом сообщении
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={pageLayout}>
      {/* ЛЕВАЯ КОЛОНКА С ИСТОРИЕЙ (как на фото) */}
      <div style={historySidebar}>
        <button onClick={handleCreateNewChat} style={newChatBtn}>
          + {t('ai.new_chat', 'Новый чат')}
        </button>

        <div style={historyTitle}>{t('ai.history_title', 'История чатов')}</div>

        <div style={historyList}>
          {sessions.map((session) => (
            <ChatHistoryItem
              key={session.id || session.session_id}
              session={session}
              isActive={currentSessionId === (session.id || session.session_id)}
              onClick={() => setCurrentSessionId(session.id || session.session_id)}
              onRename={handleRenameChat}
              onDelete={openDeleteModal}
            />
          ))}
        </div>
      </div>

      {/* ПРАВАЯ ЧАСТЬ - ОКНО ЧАТА */}
      <div style={chatContainer}>
        <div style={messagesList}>
          {messages.map((msg, idx) => (
            <div key={idx} style={msg.isBot ? botWrapper : userWrapper}>
              <div style={msg.isBot ? botBubble : userBubble}>{msg.text}</div>
            </div>
          ))}
            {isLoading && (
  <div style={botWrapper}>
    <div style={botBubble}>
      <div className="typing-container" style={{ display: 'flex', gap: '5px' }}>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
    </div>
  </div>
)}
          <div ref={messagesEndRef} />
        </div>

        <div style={inputArea}>
          <input style={inputStyle} value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="..." />
          <button onClick={handleSend} style={sendButtonStyle}>{t('ai.send_btn', 'Отправить')}</button>
        </div>
      </div>
    </div>
  );
};

// --- НОВЫЕ СТИЛИ ДЛЯ ВЕРСТКИ ---
// Добавь это в самый низ AiAssistantPage.jsx
const pageLayout = {
  display: 'flex',
  gap: '20px',
  height: '90vh',
  width: '100%',
  padding: '10px'
};

const historySidebar = {
  width: '280px',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  background: 'rgba(28, 30, 34, 0.2)',
  padding: '15px',
  borderRadius: '20px',
  border: '1px solid rgba(255,255,255,0.05)'
};

const historyTitle = {
  color: '#61dafb',
  fontSize: '12px',           // Чуть меньше размер для элегантности
  fontWeight: '800',
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: '2px',       // Увеличенный интервал
  opacity: '0.8',             // Слегка приглушенный цвет
  padding: '10px 0',
  borderBottom: '1px solid rgba(97, 218, 251, 0.1)',
    marginBottom: '15px'
};
const historyList = { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' };

const newChatBtn = {
  width: '100%', padding: '12px', borderRadius: '12px',
  background: 'linear-gradient(135deg, rgba(97, 218, 251, 0.2) 0%, rgba(74, 144, 226, 0.2) 100%)',
  color: '#61dafb', border: '1px solid rgba(97, 218, 251, 0.3)',
  cursor: 'pointer', fontWeight: 'bold', transition: '0.3s'
};

const chatContainer = { flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(20, 22, 26, 0.5)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' };
const messagesList = { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' };
const botWrapper = { display: 'flex', justifyContent: 'flex-start' };
const userWrapper = { display: 'flex', justifyContent: 'flex-end' };
const botBubble = { background: 'rgba(40, 44, 52, 0.6)', padding: '14px 20px', borderRadius: '20px 20px 20px 5px', color: '#e0e0e0', maxWidth: '85%' };
const userBubble = { background: 'linear-gradient(135deg, #61dafb 0%, #4a90e2 100%)', padding: '14px 20px', borderRadius: '20px 20px 5px 20px', color: '#1c1e22', fontWeight: '600', maxWidth: '85%' };
const inputArea = { display: 'flex', gap: '10px', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' };
const inputStyle = { flex: 1, background: '#20232a', border: '1px solid #444', borderRadius: '10px', padding: '12px', color: 'white', outline: 'none' };
const sendButtonStyle = { background: '#61dafb', border: 'none', borderRadius: '10px', padding: '0 20px', fontWeight: 'bold', cursor: 'pointer' };
export default AiAssistantPage;