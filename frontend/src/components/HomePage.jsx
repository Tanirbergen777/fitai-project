import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import KnowledgePage from './KnowledgePage';
import NutritionPage from './NutritionPage';
import TrainingPage from './TrainingPage';
import AiAssistantPage from './AiAssistantPage';
import StreakBadge from './StreakBadge';
import MainDashboard from './MainDashboard';
import RatingBadge from './RatingBadge';
import SuccessModal from './SuccessModal';
import UserProfile from './UserProfile';
import ProfilePage from './ProfilePage';
import { API_BASE_URL } from '../config/api';
const HomePage = ({ aiResult, user, userId, handleLogout, onProfileUpdate }) => {
  const { t, i18n } = useTranslation();

  // --- ТЕМА (НОЧЬ/ДЕНЬ) ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // --- МЕНЮ ---
  const menuItems = [
    { id: 'main', label: t('menu.main', 'Главная'), icon: '🏠' },
    { id: 'profile', label: t('menu.profile', 'Профиль'), icon: '👤' },
    { id: 'knowledge', label: t('menu.knowledge', 'Знания'), icon: '📚' },
    { id: 'nutrition', label: t('menu.nutrition', 'Питание'), icon: '🍎' },
    { id: 'training', label: t('menu.training', 'Тренировки'), icon: '💪' },
    { id: 'ai', label: t('menu.ai', 'AI Ассистент'), icon: '🤖' },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // --- СОСТОЯНИЕ ДАННЫХ ---
  const [currentUser, setCurrentUser] = useState(() => {
    const cachedName = localStorage.getItem('username');
    if (cachedName && user) return { ...user, username: cachedName };
    return user;
  });

  const [currentRating, setCurrentRating] = useState(user?.rating || 0);
  const [currentStreak, setCurrentStreak] = useState(user?.streak_count || 0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('main');
  const [sessions, setSessions] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    const saved = localStorage.getItem('lastSessionId');
    return saved ? Number(saved) : null;
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  // --- ЭФФЕКТЫ ---
  const fetchUserData = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/user-stats/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentRating(data.rating);
        setCurrentStreak(data.streak_count);
        setCurrentUser(prev => ({ ...prev, ...data }));
      }
    } catch (err) { console.error(err); }
  }, [userId]);

  useEffect(() => { fetchUserData(); }, [fetchUserData]);

  const fetchSessions = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/ai/sessions/${userId}`);
      if (res.ok) setSessions(await res.json());
    } catch (err) { console.error(err); }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchSessions();
  }, [userId, activeTab, fetchSessions]);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      if (user.rating !== undefined) setCurrentRating(user.rating);
      if (user.streak_count !== undefined) setCurrentStreak(user.streak_count);
    }
  }, [user]);

  const handleCreateNewChat = () => {
    localStorage.removeItem('lastSessionId');
    setCurrentSessionId(null);
    setActiveTab('ai');
  };

  const confirmDeleteChat = async () => {
    if (!sessionToDelete) return;
    try {
      const res = await fetch(`${API_BASE_URL}/ai/sessions/${sessionToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        if (currentSessionId === sessionToDelete) {
          setCurrentSessionId(null);
          localStorage.removeItem('lastSessionId');
        }
        fetchSessions();
      }
    } finally {
      setShowDeleteModal(false);
      setSessionToDelete(null);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'main':
        return <MainDashboard user={{...currentUser, rating: currentRating, streak_count: currentStreak}} aiResult={aiResult} setActiveTab={setActiveTab} />;
      case 'profile':
        return <ProfilePage user={currentUser} aiResult={aiResult} onProfileUpdate={onProfileUpdate} />;
      case 'knowledge':
        return <KnowledgePage />;
      case 'nutrition':
        return <NutritionPage aiResult={aiResult} userId={userId} />;
      case 'training':
        return <TrainingPage
          aiResult={aiResult}
          setActiveTab={setActiveTab}
          onComplete={async (points) => {
            // 1. Показываем модалку сразу для красоты
            setShowSuccess(true);

            // 2. Отправляем данные на сервер
            try {
              const response = await fetch(`${API_BASE_URL}/users/${userId}/complete-workout`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ points: points }) // передаем 50 очков
              });

              if (response.ok) {
                const data = await response.json();
                // 3. ОБНОВЛЯЕМ СОСТОЯНИЕ В REACT, чтобы цифры изменились сразу
                setCurrentRating(data.rating);
                setCurrentStreak(data.streak_count);

                console.log("Рейтинг обновлен:", data.rating);
              }
            } catch (err) {
              console.error("Ошибка при обновлении рейтинга:", err);
            }
          }}
        />
      case 'ai':
        return (
          <AiAssistantPage
            aiResult={aiResult}
            userId={userId}
            currentSessionId={currentSessionId}
            setCurrentSessionId={setCurrentSessionId}
            refreshSessions={fetchSessions}
            sessions={sessions}
            handleCreateNewChat={handleCreateNewChat}
            openDeleteModal={(e, sid) => { setSessionToDelete(sid); setShowDeleteModal(true); }}
          />
        );
      default:
        return <MainDashboard user={currentUser} aiResult={aiResult} setActiveTab={setActiveTab} />;
    }
  };

  // --- СТИЛИ ---
  const themeToggleStyle = {
    background: theme === 'light' ? '#eee' : '#3e4451',
    border: 'none', borderRadius: '50%', width: '38px', height: '38px',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px', transition: 'all 0.3s ease',
  };

  return (
    <div style={{...homeContainerStyle, background: 'var(--bg-main)', color: 'var(--text-primary)'}}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        menuItems={menuItems}
        handleLogout={handleLogout}
      />

      <main style={{
        ...contentAreaStyle,
        marginLeft: isSidebarCollapsed ? '80px' : '260px',
        width: isSidebarCollapsed ? 'calc(100vw - 80px)' : 'calc(100vw - 260px)',
      }}>
        <header style={{...headerStyle, background: 'var(--bg-header)', borderColor: 'var(--border-color)'}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={toggleTheme} style={themeToggleStyle} title="Сменить тему">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <h3 style={{ margin: 0 }}>{menuItems.find(i => i.id === activeTab)?.label}</h3>
            <StreakBadge count={currentStreak} />
            <RatingBadge rating={currentRating} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={langHeaderContainerStyle}>
              <button onClick={() => changeLanguage('ru')} style={langButtonStyle(i18n.language === 'ru')}>RU</button>
              <button onClick={() => changeLanguage('en')} style={langButtonStyle(i18n.language === 'en')}>EN</button>
              <button onClick={() => changeLanguage('kaz')} style={langButtonStyle(i18n.language === 'kaz')}>KZ</button>
            </div>
            <UserProfile username={currentUser?.username} handleLogout={handleLogout}/>
          </div>
        </header>

        <section style={mainViewStyle}>{renderContent()}</section>
      </main>

      {/* Исправленное условие показа модалки */}
      {showDeleteModal && sessionToDelete && (
        <div style={modalOverlayStyle}>
          <div style={deleteModalStyle}>
            <h3 style={{ marginTop: 0, color: '#e06c75' }}>{t('modal.delete_title')}</h3>
            <p style={{ color: '#abb2bf' }}>{t('modal.delete_desc')}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '25px' }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSessionToDelete(null);
                }}
                style={cancelButtonStyle}
              >
                {t('modal.cancel')}
              </button>
              <button onClick={confirmDeleteChat} style={confirmDeleteButtonStyle}>
                {t('modal.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
      <SuccessModal isOpen={showSuccess} points={50} onClose={() => setShowSuccess(false)} />
    </div>
  );
};

// СТИЛИ (оставляем как были)
const langHeaderContainerStyle = { display: 'flex', alignItems: 'center', background: 'rgba(28, 30, 34, 0.2)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', gap: '4px' };
const langButtonStyle = (isActive) => ({ background: isActive ? 'linear-gradient(135deg, #61dafb 0%, #4a90e2 100%)' : 'transparent', color: isActive ? '#1c1e22' : '#abb2bf', border: 'none', padding: '6px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', transition: 'all 0.3s ease', boxShadow: isActive ? '0 4px 12px rgba(97, 218, 251, 0.3)' : 'none' });
const homeContainerStyle = {
  display: 'flex',
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
  position: 'fixed', // Изменили с relative на fixed, чтобы закрепить подложку
  top: 0,
  left: 0
};
const contentAreaStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  transition: 'margin-left 0.4s ease', // Анимируем только отступ
  position: 'relative',
  zIndex: 10,
     minHeight: 0,
  height: '100vh',
  overflow: 'hidden',
  backgroundColor: 'transparent' // Чтобы видеть фон темы
};
const headerStyle = { height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', borderBottom: '1px solid' };
const mainViewStyle = {
  flex: 1,
  minHeight: 0,
  padding: '16px 20px',
  overflowY: 'auto',
  overflowX: 'hidden'
};const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.7)', // Сделали чуть темнее, чтобы ты видел, когда она открыта
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999, // Подняли еще выше, чтобы точно была над всем
  pointerEvents: 'auto' // Убеждаемся, что она ловит клики только когда активна
};const deleteModalStyle = { background: '#21252b', padding: '30px', borderRadius: '16px', width: '350px' };
const cancelButtonStyle = { padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3e4451', color: 'white', cursor: 'pointer' };
const confirmDeleteButtonStyle = { padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#e06c75', color: 'white', cursor: 'pointer' };

export default HomePage;