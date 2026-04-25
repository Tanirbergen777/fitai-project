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

  return (
    <div style={styles.container}>
      <header style={styles.hero}>
        <h1 style={{...styles.welcome, color: 'var(--text-primary)'}}>
          {t('dashboard.welcome')}, {user.username}!
        </h1>
        <p style={{...styles.subtitle, color: 'var(--text-secondary)'}}>
          {t('dashboard.subtitle')}
        </p>
      </header>

      <div style={styles.grid}>
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => setActiveTab(card.id)}
            className="dashboard-card"
            style={{
              ...styles.card,
              background: 'var(--card-bg)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div style={styles.iconWrapper}>
                <span>{card.icon}</span>
            </div>
            <h3 style={{ color: card.color, marginBottom: '10px' }}>{card.title}</h3>
            <p style={{...styles.cardDesc, color: 'var(--text-secondary)'}}>{card.desc}</p>
            <div style={styles.arrow}>→</div>
          </div>
        ))}
      </div>

      <div style={{
        ...styles.statusBox,
        background: 'rgba(97, 218, 251, 0.05)',
        borderColor: 'rgba(97, 218, 251, 0.3)'
      }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
            <span>🔥 {t('dashboard.current_status')}: </span>
            <strong style={{ color: '#61dafb' }}>
              {aiResult?.status || t('dashboard.analyzing')}
            </strong>
         </div>
      </div>
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
  hero: { marginBottom: '40px' },
  welcome: { fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' },
  subtitle: { fontSize: '18px' },
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
  iconWrapper: { fontSize: '40px', marginBottom: '20px' },
  cardDesc: { fontSize: '14px', lineHeight: '1.5' },
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