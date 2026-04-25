import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../config/api';
import KnowledgeHome from './knowledge/KnowledgeHome';
import HabitsPage from './knowledge/HabitsPage';
import EnergyPage from './knowledge/EnergyPage';
import FocusPage from './knowledge/FocusPage';
import HealthKnowledgePage from './knowledge/HealthKnowledgePage';

const REMINDER_TEXTS = {
  ru: {
    title: 'Напоминание FitAI',
    habit: {
      drink_water: 'Привет! Ты не забыл выпить воду сегодня?',
      sleep_early: 'Привет! Напоминаем про привычку: постарайся лечь спать пораньше сегодня.',
      no_phone_morning: 'Привет! Не забудь: спокойное утро без телефона помогает фокусу.',
      walk_daily: 'Привет! Небольшая прогулка сегодня поможет телу и голове.',
    },
    challenge: {
      walk_15_daily:
        'Привет! Напоминаем про твой челлендж: 15 минут прогулки сегодня помогут освежить голову и уменьшить усталость.',
      water_7_days:
        'Привет! Не забудь про челлендж: выпей воду сегодня и сохрани ритм.',
      sleep_before_2330:
        'Привет! Напоминаем про челлендж: постарайся лечь спать вовремя сегодня.',
      morning_without_phone:
        'Привет! Напоминаем про челлендж: постарайся начать утро без телефона.',
    },
    fallback: 'У тебя есть запланированное напоминание.',
  },
  en: {
    title: 'FitAI Reminder',
    habit: {
      drink_water: 'Hi! Did you remember to drink water today?',
      sleep_early: 'Hi! Reminder for your habit: try to sleep a bit earlier today.',
      no_phone_morning: 'Hi! A calm phone-free morning helps your focus.',
      walk_daily: 'Hi! A short walk today will help both your body and mind.',
    },
    challenge: {
      walk_15_daily:
        'Hi! Reminder about your challenge: a 15-minute walk today can refresh your mind and reduce fatigue.',
      water_7_days:
        'Hi! Don’t forget your challenge: drink water today and keep the rhythm.',
      sleep_before_2330:
        'Hi! Reminder about your challenge: try to go to bed on time today.',
      morning_without_phone:
        'Hi! Reminder about your challenge: try to start the morning without your phone.',
    },
    fallback: 'You have a scheduled reminder.',
  },
  kaz: {
    title: 'FitAI еске салғышы',
    habit: {
      drink_water: 'Сәлем! Бүгін су ішуді ұмытпадың ба?',
      sleep_early: 'Сәлем! Әдет туралы еске салу: бүгін ертерек ұйықтауға тырыс.',
      no_phone_morning: 'Сәлем! Телефонсыз тыныш таң фокусты жақсартады.',
      walk_daily: 'Сәлем! Бүгінгі қысқа серуен дене мен ойға пайдалы болады.',
    },
    challenge: {
      walk_15_daily:
        'Сәлем! Челлендж туралы еске салу: бүгін 15 минут серуендеу ойды сергітіп, шаршауды азайтады.',
      water_7_days:
        'Сәлем! Челленджді ұмытпа: бүгін су ішіп, ырғақты сақта.',
      sleep_before_2330:
        'Сәлем! Челлендж туралы еске салу: бүгін уақытында ұйықтауға тырыс.',
      morning_without_phone:
        'Сәлем! Челлендж туралы еске салу: таңды телефонсыз бастауға тырыс.',
    },
    fallback: 'Сенде жоспарланған еске салғыш бар.',
  },
};

const normalizeLang = (lang) => {
  if (lang === 'kaz') return 'kaz';
  if (lang === 'en') return 'en';
  return 'ru';
};

const buildReminderMessage = (reminder) => {
  const lang = normalizeLang(reminder?.language);
  const dictionary = REMINDER_TEXTS[lang] || REMINDER_TEXTS.ru;
  const group = dictionary[reminder?.reminder_type] || {};
  return group[reminder?.item_key] || dictionary.fallback;
};

const buildReminderTitle = (reminder) => {
  const lang = normalizeLang(reminder?.language);
  const dictionary = REMINDER_TEXTS[lang] || REMINDER_TEXTS.ru;
  return dictionary.title;
};

const KnowledgePage = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('home');
  const [liveReminderText, setLiveReminderText] = useState('');

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    const checkBrowserReminders = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/habit-reminders/${userId}`);
        if (!response.ok) return;

        const reminders = await response.json();
        if (!Array.isArray(reminders)) return;

        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        const currentDate = now.toISOString().slice(0, 10);

        reminders.forEach((reminder) => {
          if (!reminder?.is_enabled) return;
          if (reminder?.send_time !== currentTime) return;

          const dedupeKey = `fitai_browser_notified_${reminder.id}_${currentDate}_${currentTime}`;
          if (localStorage.getItem(dedupeKey)) return;

          localStorage.setItem(dedupeKey, '1');

          const title = buildReminderTitle(reminder);
          const message = buildReminderMessage(reminder);

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body: message });
          } else {
            alert(message);
          }

          if (isMounted) {
            setLiveReminderText(message);
          }
        });
      } catch (error) {
        console.error('Failed to check browser reminders:', error);
      }
    };

    checkBrowserReminders();
    const intervalId = setInterval(checkBrowserReminders, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [userId]);

  const renderContent = () => {
    switch (activeSection) {
      case 'habits':
        return <HabitsPage onBack={() => setActiveSection('home')} />;
      case 'energy':
        return <EnergyPage onBack={() => setActiveSection('home')} />;
      case 'focus':
        return <FocusPage onBack={() => setActiveSection('home')} />;
      case 'health':
        return <HealthKnowledgePage onBack={() => setActiveSection('home')} />;
      case 'home':
      default:
        return <KnowledgeHome onOpenSection={setActiveSection} />;
    }
  };

  const isInnerPage = activeSection !== 'home';

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.badge}>{t('knowledgePage.badge')}</div>
        <h1 style={styles.title}>{t('knowledgePage.title')}</h1>
        <p style={styles.subtitle}>{t('knowledgePage.subtitle')}</p>

        {isInnerPage && (
          <button style={styles.backButton} onClick={() => setActiveSection('home')}>
            ← {t('common.back')}
          </button>
        )}
      </div>

      {liveReminderText ? (
        <div style={styles.liveReminderBox}>
          {liveReminderText}
        </div>
      ) : null}

      <div style={styles.content}>
        {renderContent()}
      </div>
    </div>
  );
};

const styles = {
  page: {
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '8px 4px 28px',
    color: 'var(--text-primary)',
  },
  hero: {
    background:
      'linear-gradient(135deg, rgba(97,218,251,0.12) 0%, rgba(139,123,255,0.10) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '28px',
    padding: '28px',
    marginBottom: '20px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.10)',
  },
  badge: {
    display: 'inline-flex',
    padding: '8px 14px',
    borderRadius: '999px',
    background: 'rgba(97,218,251,0.14)',
    border: '1px solid rgba(97,218,251,0.22)',
    color: '#61dafb',
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '14px',
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '34px',
    fontWeight: '800',
    lineHeight: 1.15,
  },
  subtitle: {
    margin: 0,
    maxWidth: '900px',
    color: 'var(--text-secondary)',
    fontSize: '16px',
    lineHeight: 1.7,
  },
  backButton: {
    marginTop: '18px',
    padding: '11px 16px',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontWeight: '700',
  },
  liveReminderBox: {
    marginBottom: '16px',
    padding: '14px 16px',
    borderRadius: '16px',
    background: 'rgba(97,218,251,0.08)',
    border: '1px solid rgba(97,218,251,0.18)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    lineHeight: 1.6,
  },
  content: {
    minHeight: '200px',
  },
};

export default KnowledgePage;