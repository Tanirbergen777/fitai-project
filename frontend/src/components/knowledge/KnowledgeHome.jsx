import React from 'react';
import { useTranslation } from 'react-i18next';

const KnowledgeHome = ({ onOpenSection }) => {
  const { t } = useTranslation();

  const cards = [
    {
      id: 'habits',
      icon: '🎯',
      title: t('knowledgeModule.home.habitsTitle'),
      desc: t('knowledgeModule.home.habitsDesc'),
    },
    {
      id: 'energy',
      icon: '⚡',
      title: t('knowledgeModule.home.energyTitle'),
      desc: t('knowledgeModule.home.energyDesc'),
    },
    {
      id: 'focus',
      icon: '🧠',
      title: t('knowledgeModule.home.focusTitle'),
      desc: t('knowledgeModule.home.focusDesc'),
    },
    {
      id: 'health',
      icon: '📚',
      title: t('knowledgeModule.home.healthTitle'),
      desc: t('knowledgeModule.home.healthDesc'),
    },
  ];

  return (
    <div>
      <div style={styles.topInfo}>
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>🌱</div>
          <div>
            <h3 style={styles.infoTitle}>{t('knowledgeModule.home.mainTitle')}</h3>
            <p style={styles.infoText}>{t('knowledgeModule.home.mainText')}</p>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {cards.map((card) => (
          <button
            key={card.id}
            style={styles.card}
            onClick={() => onOpenSection(card.id)}
          >
            <div style={styles.cardIcon}>{card.icon}</div>
            <h3 style={styles.cardTitle}>{card.title}</h3>
            <p style={styles.cardDesc}>{card.desc}</p>
            <div style={styles.arrow}>→</div>
          </button>
        ))}
      </div>
    </div>
  );
};

const styles = {
  topInfo: {
    marginBottom: '18px',
  },
  infoCard: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
    padding: '20px',
    borderRadius: '22px',
    background: 'var(--card-bg, rgba(255,255,255,0.03))',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  infoIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    background: 'rgba(97,218,251,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
    flexShrink: 0,
  },
  infoTitle: {
    margin: '0 0 8px 0',
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  infoText: {
    margin: 0,
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
    fontSize: '15px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
  },
  card: {
    textAlign: 'left',
    padding: '22px',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'var(--card-bg, rgba(255,255,255,0.03))',
    cursor: 'pointer',
    transition: '0.25s ease',
    color: 'var(--text-primary)',
    position: 'relative',
    minHeight: '210px',
  },
  cardIcon: {
    fontSize: '30px',
    marginBottom: '14px',
  },
  cardTitle: {
    margin: '0 0 10px 0',
    fontSize: '20px',
    fontWeight: '800',
  },
  cardDesc: {
    margin: 0,
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
    fontSize: '14px',
    maxWidth: '92%',
  },
  arrow: {
    position: 'absolute',
    right: '18px',
    bottom: '18px',
    color: '#61dafb',
    fontSize: '22px',
    fontWeight: '800',
  },
};

export default KnowledgeHome;