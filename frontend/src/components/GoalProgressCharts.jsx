import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { useTranslation } from 'react-i18next';

const VerticalBarProgress = ({ current, target, label, color, suffix = "" }) => {
  const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <div style={styles.barContainer}>
      <div style={styles.targetContainer}>
        <span style={styles.targetValue}>{target} {suffix}</span>
      </div>
      <div style={styles.barTrack}>
        <div 
          style={{
            ...styles.barFill,
            height: `${percent}%`,
            background: `linear-gradient(to top, ${color}aa, ${color})`,
            boxShadow: `0 -5px 15px ${color}50`
          }} 
        />
      </div>
      <div style={styles.textContainer}>
        <span style={{...styles.currentValue, color: color}}>{current}</span>
        <span style={styles.label}>{label}</span>
      </div>
    </div>
  );
};

const GoalProgressCharts = () => {
  const [stats, setStats] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    fetch(`${API_BASE_URL}/user-progress-stats/${userId}`)
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (data && data.weeks && data.workouts_week && data.calories_today && data.duration_today) {
          setStats(data);
        }
      })
      .catch(err => console.error("Error fetching progress stats:", err));
  }, []);

  if (!stats) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>{t('dashboard.ml_progress.title', 'Прогресс целей')}</h3>
      </div>
      <div style={styles.grid}>
        <VerticalBarProgress 
          current={stats.weeks.current} 
          target={stats.weeks.target} 
          label={t('dashboard.ml_progress.weeks_label', 'Срок (недели)')} 
          color="#3b82f6" 
        />
        <VerticalBarProgress 
          current={stats.workouts_week.current} 
          target={stats.workouts_week.target} 
          label={t('dashboard.ml_progress.workouts_label', 'Тренировки (неделя)')} 
          color="#10b981" 
        />
        <VerticalBarProgress 
          current={stats.calories_today.current} 
          target={stats.calories_today.target} 
          label={t('dashboard.ml_progress.calories_label', 'Калории (сегодня)')} 
          color="#f59e0b" 
          suffix={t('dashboard.ml_progress.calories_suffix', 'ккал')}
        />
        <VerticalBarProgress 
          current={stats.duration_today.current} 
          target={stats.duration_today.target} 
          label={t('dashboard.ml_progress.duration_label', 'Время (сегодня)')} 
          color="#ec4899" 
          suffix={t('dashboard.ml_progress.duration_suffix', 'мин')}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginTop: '30px',
    padding: '30px',
    background: 'var(--card-bg)',
    borderRadius: '24px',
    border: '1px solid var(--border-color)',
    marginBottom: '30px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '30px',
  },
  title: {
    margin: 0,
    color: 'var(--text-primary)',
    fontSize: '22px',
    fontWeight: '800',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '600',
  },
  grid: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '20px',
  },
  barContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: '1 1 120px',
    minWidth: '120px',
  },
  targetContainer: {
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  barTrack: {
    width: '60px',
    height: '140px',
    background: 'var(--bg-main)',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    border: '1px solid var(--border-color)',
  },
  barFill: {
    width: '100%',
    transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: '6px',
  },
  textContainer: {
    marginTop: '15px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  currentValue: {
    fontSize: '24px',
    fontWeight: '900',
    lineHeight: '1',
    marginBottom: '6px',
  },
  targetValue: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    fontWeight: '700',
  },
  label: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    lineHeight: '1.4',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    maxWidth: '100px',
  }
};

export default GoalProgressCharts;
