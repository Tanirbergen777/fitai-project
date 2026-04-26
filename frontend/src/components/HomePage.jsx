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

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

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

  const fetchUserData = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/user-stats/${userId}`);

      if (res.ok) {
        const data = await res.json();
        setCurrentRating(data.rating);
        setCurrentStreak(data.streak_count);
        setCurrentUser((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const fetchSessions = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/ai/sessions/${userId}`);
      if (res.ok) setSessions(await res.json());
    } catch (err) {
      console.error(err);
    }
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
      const res = await fetch(`${API_BASE_URL}/ai/sessions/${sessionToDelete}`, {
        method: 'DELETE',
      });

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
        return (
          <MainDashboard
            user={{ ...currentUser, rating: currentRating, streak_count: currentStreak }}
            aiResult={aiResult}
            setActiveTab={setActiveTab}
          />
        );

      case 'profile':
        return (
          <ProfilePage
            user={currentUser}
            aiResult={aiResult}
            onProfileUpdate={onProfileUpdate}
          />
        );

      case 'knowledge':
        return <KnowledgePage />;

      case 'nutrition':
        return <NutritionPage aiResult={aiResult} userId={userId} />;

      case 'training':
        return (
          <TrainingPage
            aiResult={aiResult}
            setActiveTab={setActiveTab}
            onComplete={async (points) => {
              setShowSuccess(true);

              try {
                const response = await fetch(
                  `${API_BASE_URL}/users/${userId}/complete-workout`,
                  {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ points }),
                  }
                );

                if (response.ok) {
                  const data = await response.json();
                  setCurrentRating(data.rating);
                  setCurrentStreak(data.streak_count);
                  console.log('Рейтинг обновлен:', data.rating);
                }
              } catch (err) {
                console.error('Ошибка при обновлении рейтинга:', err);
              }
            }}
          />
        );

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
            openDeleteModal={(e, sid) => {
              setSessionToDelete(sid);
              setShowDeleteModal(true);
            }}
          />
        );

      default:
        return (
          <MainDashboard
            user={currentUser}
            aiResult={aiResult}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  const activeMenuItem = menuItems.find((item) => item.id === activeTab);

  const themeToggleStyle = {
    background: theme === 'light' ? '#eee' : '#3e4451',
    border: 'none',
    borderRadius: '50%',
    width: '38px',
    height: '38px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    transition: 'all 0.3s ease',
  };

  return (
    <div
      className="hp-root"
      style={{
        ...homeContainerStyle,
        background: 'var(--bg-main)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="hp-sidebar-wrap">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          menuItems={menuItems}
          handleLogout={handleLogout}
        />
      </div>

      <main
        className="hp-content-area"
        style={{
          ...contentAreaStyle,
          marginLeft: isSidebarCollapsed ? '80px' : '260px',
          width: isSidebarCollapsed ? 'calc(100vw - 80px)' : 'calc(100vw - 260px)',
        }}
      >
        <header
          className="hp-header"
          style={{
            ...headerStyle,
            background: 'var(--bg-header)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="hp-header-left">
            <button onClick={toggleTheme} style={themeToggleStyle} title="Сменить тему">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <h3 className="hp-page-title">
              {activeMenuItem?.label}
            </h3>

            <div className="hp-badges">
              <StreakBadge count={currentStreak} />
              <RatingBadge rating={currentRating} />
            </div>
          </div>

          <div className="hp-header-right">
            <div style={langHeaderContainerStyle} className="hp-lang-switch">
              <button
                onClick={() => changeLanguage('ru')}
                style={langButtonStyle(i18n.language === 'ru')}
              >
                RU
              </button>
              <button
                onClick={() => changeLanguage('en')}
                style={langButtonStyle(i18n.language === 'en')}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('kaz')}
                style={langButtonStyle(i18n.language === 'kaz')}
              >
                KZ
              </button>
            </div>

            <div className="hp-user-profile-wrap">
              <UserProfile username={currentUser?.username} handleLogout={handleLogout} />
            </div>
          </div>
        </header>

        <section className="hp-main-view" style={mainViewStyle}>
          {renderContent()}
        </section>
      </main>

      <nav className="hp-mobile-nav" aria-label="Mobile navigation">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`hp-mobile-nav-btn ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="hp-mobile-nav-icon">{item.icon}</span>
            <span className="hp-mobile-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {showDeleteModal && sessionToDelete && (
        <div style={modalOverlayStyle} className="hp-modal-overlay">
          <div style={deleteModalStyle} className="hp-delete-modal">
            <h3 style={{ marginTop: 0, color: '#e06c75' }}>
              {t('modal.delete_title')}
            </h3>

            <p style={{ color: '#abb2bf' }}>
              {t('modal.delete_desc')}
            </p>

            <div className="hp-delete-modal-actions">
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

      <SuccessModal
        isOpen={showSuccess}
        points={50}
        onClose={() => setShowSuccess(false)}
      />

      <style>{`
.hp-header-left,
.hp-header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.hp-page-title {
  margin: 0;
}

.hp-badges {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hp-delete-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 25px;
}

.hp-mobile-nav {
  display: none;
}

/* PHONE UI */
@media (max-width: 768px) {
  .hp-root {
    width: 100vw !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    overflow: hidden !important;
    position: fixed !important;
    inset: 0 !important;
  }

  .hp-sidebar-wrap {
    display: none !important;
  }

  .hp-content-area {
    margin-left: 0 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100dvh !important;
    min-height: 100dvh !important;
    overflow: hidden !important;
  }

  .hp-header {
    height: auto !important;
    min-height: 104px !important;
    padding: 10px 12px 10px !important;
    flex-direction: column !important;
    align-items: stretch !important;
    justify-content: flex-start !important;
    gap: 10px !important;
    position: relative;
    z-index: 40;
    box-sizing: border-box !important;
  }

  .hp-header-left {
    width: 100%;
    display: grid !important;
    grid-template-columns: 40px minmax(0, 1fr) auto;
    gap: 10px !important;
    align-items: center !important;
  }

  .hp-page-title {
    min-width: 0;
    font-size: 18px !important;
    font-weight: 900 !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .hp-badges {
    justify-content: flex-end;
    gap: 6px !important;
    min-width: 0;
  }

  .hp-header-right {
    width: 100%;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    gap: 10px !important;
    min-width: 0;
  }

  .hp-lang-switch {
    flex-shrink: 0;
    transform: scale(0.94);
    transform-origin: left center;
  }

  .hp-user-profile-wrap {
    min-width: 0;
    max-width: 52%;
    overflow: hidden;
    display: flex;
    justify-content: flex-end;
  }

  .hp-main-view {
    height: calc(100dvh - 104px) !important;
    min-height: 0 !important;
    padding: 10px 10px 96px !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
    box-sizing: border-box !important;
  }

  .hp-mobile-nav {
    position: fixed;
    left: 8px;
    right: 8px;
    bottom: calc(8px + env(safe-area-inset-bottom));
    height: 66px;
    z-index: 1000;
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 4px;
    padding: 6px;
    border-radius: 22px;
    background: rgba(28, 31, 36, 0.94);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 18px 50px rgba(0,0,0,0.42);
    backdrop-filter: blur(16px);
    box-sizing: border-box;
  }

  .hp-mobile-nav-btn {
    min-width: 0;
    border: none;
    border-radius: 16px;
    background: transparent;
    color: #aab3c2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    cursor: pointer;
    padding: 4px 2px;
    font-family: inherit;
    touch-action: manipulation;
  }

  .hp-mobile-nav-btn.active {
    background: rgba(97, 218, 251, 0.14);
    color: #61dafb;
  }

  .hp-mobile-nav-icon {
    font-size: 19px;
    line-height: 1;
  }

  .hp-mobile-nav-label {
    max-width: 100%;
    font-size: 9px;
    font-weight: 800;
    line-height: 1.05;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .hp-delete-modal {
    width: min(350px, calc(100vw - 28px)) !important;
    padding: 22px !important;
    border-radius: 18px !important;
  }

  .hp-delete-modal-actions {
    flex-direction: column-reverse;
    gap: 10px;
  }

  .hp-delete-modal-actions button {
    width: 100%;
    min-height: 44px;
  }
}

/* SMALL PHONE */
@media (max-width: 430px) {
  .hp-header {
    min-height: 112px !important;
    padding: 9px 10px 10px !important;
  }

  .hp-main-view {
    height: calc(100dvh - 112px) !important;
    padding-left: 8px !important;
    padding-right: 8px !important;
    padding-bottom: 96px !important;
  }

  .hp-mobile-nav {
    left: 6px;
    right: 6px;
    height: 64px;
    border-radius: 20px;
  }

  .hp-mobile-nav-icon {
    font-size: 18px;
  }

  .hp-mobile-nav-label {
    font-size: 8px;
  }

  .hp-lang-switch {
    transform: scale(0.9);
  }
}
      `}</style>
    </div>
  );
};

const langHeaderContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  background: 'rgba(28, 30, 34, 0.2)',
  padding: '4px',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  gap: '4px',
};

const langButtonStyle = (isActive) => ({
  background: isActive
    ? 'linear-gradient(135deg, #61dafb 0%, #4a90e2 100%)'
    : 'transparent',
  color: isActive ? '#1c1e22' : '#abb2bf',
  border: 'none',
  padding: '6px 14px',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  boxShadow: isActive ? '0 4px 12px rgba(97, 218, 251, 0.3)' : 'none',
});

const homeContainerStyle = {
  display: 'flex',
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
  position: 'fixed',
  top: 0,
  left: 0,
};

const contentAreaStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  transition: 'margin-left 0.4s ease',
  position: 'relative',
  zIndex: 10,
  minHeight: 0,
  height: '100vh',
  overflow: 'hidden',
  backgroundColor: 'transparent',
};

const headerStyle = {
  height: '70px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 30px',
  borderBottom: '1px solid',
};

const mainViewStyle = {
  flex: 1,
  minHeight: 0,
  padding: '16px 20px',
  overflowY: 'auto',
  overflowX: 'hidden',
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  pointerEvents: 'auto',
};

const deleteModalStyle = {
  background: '#21252b',
  padding: '30px',
  borderRadius: '16px',
  width: '350px',
};

const cancelButtonStyle = {
  padding: '10px 20px',
  borderRadius: '8px',
  border: 'none',
  background: '#3e4451',
  color: 'white',
  cursor: 'pointer',
};

const confirmDeleteButtonStyle = {
  padding: '10px 20px',
  borderRadius: '8px',
  border: 'none',
  background: '#e06c75',
  color: 'white',
  cursor: 'pointer',
};

export default HomePage;