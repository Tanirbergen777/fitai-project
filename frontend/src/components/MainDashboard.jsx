import React from 'react';
import { useTranslation } from 'react-i18next';

const MainDashboard = ({ user, aiResult, setActiveTab }) => {
  const { t } = useTranslation();

  const cards = [
    {
      id: 'nutrition',
      title: t('menu.nutrition'),
      desc: t('dashboard.nutrition_desc'),
      icon: '🍎',
      color: '#61dafb'
    },
    {
      id: 'training',
      title: t('menu.training'),
      desc: t('dashboard.training_desc'),
      icon: '💪',
      color: '#61dafb'
    },
    {
      id: 'knowledge',
      title: t('menu.knowledge'),
      desc: t('dashboard.knowledge_desc'),
      icon: '📚',
      color: '#61dafb'
    },
    {
      id: 'ai',
      title: t('menu.ai'),
      desc: t('dashboard.ai_desc'),
      icon: '🤖',
      color: '#61dafb'
    },
  ];

  const username = user?.username || t('profile.user', 'Пользователь');

  return (
    <div className="main-dashboard" style={styles.container}>
      <header className="main-dashboard-hero" style={styles.hero}>
        <div className="main-dashboard-hero-badge">
          <span>⚡</span>
          <span>FitAI</span>
        </div>

        <h1
          className="main-dashboard-welcome"
          style={{ ...styles.welcome, color: 'var(--text-primary)' }}
        >
          {t('dashboard.welcome')}, {username}!
        </h1>

        <p
          className="main-dashboard-subtitle"
          style={{ ...styles.subtitle, color: 'var(--text-secondary)' }}
        >
          {t('dashboard.subtitle')}
        </p>
      </header>

      <div className="main-dashboard-grid" style={styles.grid}>
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setActiveTab(card.id)}
            className={`dashboard-card dashboard-card-${card.id}`}
            style={{
              ...styles.card,
              background: 'var(--card-bg)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="dashboard-card-top">
              <div className="dashboard-card-icon" style={styles.iconWrapper}>
                <span>{card.icon}</span>
              </div>

              <div className="dashboard-card-arrow" style={styles.arrow}>
                →
              </div>
            </div>

            <div className="dashboard-card-body">
              <h3
                className="dashboard-card-title"
                style={{ color: card.color, marginBottom: '10px' }}
              >
                {card.title}
              </h3>

              <p
                className="dashboard-card-desc"
                style={{ ...styles.cardDesc, color: 'var(--text-secondary)' }}
              >
                {card.desc}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div
        className="main-dashboard-status"
        style={{
          ...styles.statusBox,
          background: 'rgba(97, 218, 251, 0.05)',
          borderColor: 'rgba(97, 218, 251, 0.3)'
        }}
      >
        <div className="main-dashboard-status-inner">
          <span className="main-dashboard-status-icon">🔥</span>

          <div className="main-dashboard-status-text">
            <span>{t('dashboard.current_status')}: </span>

            <strong>
              {aiResult?.status || t('dashboard.analyzing')}
            </strong>
          </div>
        </div>
      </div>

      <style>{`
.main-dashboard {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.main-dashboard-hero {
  position: relative;
}

.main-dashboard-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(97, 218, 251, 0.09);
  border: 1px solid rgba(97, 218, 251, 0.22);
  color: #61dafb;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.5px;
}

.dashboard-card {
  text-align: left;
  color: inherit;
  font-family: inherit;
}

.dashboard-card:hover {
  transform: translateY(-8px);
  border-color: rgba(97, 218, 251, 0.45) !important;
  box-shadow: 0 18px 45px rgba(0,0,0,0.22) !important;
}

.dashboard-card:active {
  transform: scale(0.985);
}

.dashboard-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.dashboard-card-icon {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background: rgba(97, 218, 251, 0.09);
  border: 1px solid rgba(97, 218, 251, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dashboard-card-icon span {
  display: block;
}

.dashboard-card-body {
  min-width: 0;
}

.dashboard-card-title {
  font-size: 22px;
  line-height: 1.15;
  font-weight: 900;
}

.dashboard-card-desc {
  min-width: 0;
}

.main-dashboard-status-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-primary);
  min-width: 0;
}

.main-dashboard-status-icon {
  width: 42px;
  height: 42px;
  border-radius: 16px;
  background: rgba(97, 218, 251, 0.10);
  border: 1px solid rgba(97, 218, 251, 0.20);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.main-dashboard-status-text {
  min-width: 0;
  line-height: 1.5;
}

.main-dashboard-status-text strong {
  color: #61dafb;
}

/* Tablet */
@media (max-width: 900px) {
  .main-dashboard {
    padding: 18px 10px 110px !important;
  }

  .main-dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 16px !important;
  }
}

/* Phone UI */
@media (max-width: 768px) {
  .main-dashboard {
    width: 100% !important;
    max-width: 100% !important;
    padding: 16px 6px 104px !important;
    margin: 0 !important;
    overflow: visible !important;
    box-sizing: border-box !important;
  }

  .main-dashboard-hero {
    margin-bottom: 22px !important;
    padding: 18px 16px !important;
    border-radius: 24px !important;
    background: var(--hero-bg) !important;
    border: 1px solid var(--border-color) !important;
    box-shadow: var(--hero-shadow);
  }

  .main-dashboard-hero-badge {
    margin-bottom: 12px;
    padding: 7px 11px;
    font-size: 11px;
  }

  .main-dashboard-welcome {
    font-size: clamp(28px, 8vw, 38px) !important;
    line-height: 1.08 !important;
    margin: 0 0 10px !important;
    word-break: break-word !important;
  }

  .main-dashboard-subtitle {
    font-size: 14px !important;
    line-height: 1.55 !important;
    margin: 0 !important;
  }

  .main-dashboard-grid {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 14px !important;
  }

  .dashboard-card {
    width: 100% !important;
    min-height: 138px !important;
    padding: 18px !important;
    border-radius: 22px !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    box-sizing: border-box !important;
    touch-action: manipulation;
  }

  .dashboard-card:hover {
    transform: none;
  }

  .dashboard-card-top {
    margin-bottom: 12px;
  }

  .dashboard-card-icon {
    width: 50px !important;
    height: 50px !important;
    border-radius: 16px !important;
    font-size: 30px !important;
    margin-bottom: 0 !important;
  }

  .dashboard-card-title {
    font-size: 21px !important;
    line-height: 1.18 !important;
    margin: 0 0 7px !important;
  }

  .dashboard-card-desc {
    font-size: 13px !important;
    line-height: 1.5 !important;
    margin: 0 !important;
  }

  .dashboard-card-arrow {
    position: static !important;
    width: 38px !important;
    height: 38px !important;
    border-radius: 14px !important;
    background: rgba(97, 218, 251, 0.10);
    border: 1px solid rgba(97, 218, 251, 0.22);
    display: flex !important;
    align-items: center;
    justify-content: center;
    font-size: 19px !important;
    flex-shrink: 0;
  }

  .main-dashboard-status {
    margin-top: 18px !important;
    padding: 16px !important;
    border-radius: 20px !important;
  }

  .main-dashboard-status-inner {
    align-items: flex-start;
    gap: 12px;
  }

  .main-dashboard-status-icon {
    width: 40px;
    height: 40px;
    border-radius: 15px;
  }

  .main-dashboard-status-text {
    font-size: 14px;
  }

  .main-dashboard-status-text strong {
    display: block;
    margin-top: 3px;
    overflow-wrap: anywhere;
  }
}

/* Small phone */
@media (max-width: 430px) {
  .main-dashboard {
    padding-left: 4px !important;
    padding-right: 4px !important;
    padding-bottom: 100px !important;
  }

  .main-dashboard-hero {
    padding: 16px 14px !important;
    border-radius: 22px !important;
  }

  .main-dashboard-welcome {
    font-size: 29px !important;
  }

  .dashboard-card {
    padding: 16px !important;
    border-radius: 20px !important;
    min-height: 132px !important;
  }

  .dashboard-card-icon {
    width: 46px !important;
    height: 46px !important;
    font-size: 28px !important;
  }

  .dashboard-card-title {
    font-size: 20px !important;
  }

  .dashboard-card-desc {
    font-size: 12.5px !important;
  }
}
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    transition: 'all 0.3s ease'
  },
  hero: {
    marginBottom: '40px'
  },
  welcome: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '18px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },
  card: {
    padding: '30px',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    border: '1px solid',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
  },
  iconWrapper: {
    fontSize: '40px',
    marginBottom: '20px'
  },
  cardDesc: {
    fontSize: '14px',
    lineHeight: '1.5'
  },
  arrow: {
    position: 'absolute',
    right: '20px',
    bottom: '20px',
    fontSize: '20px',
    color: '#61dafb'
  },
  statusBox: {
    marginTop: '40px',
    padding: '20px',
    borderRadius: '16px',
    border: '1px dashed'
  }
};

export default MainDashboard;