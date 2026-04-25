import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RecommendedVideos from './RecommendedVideos';
import { API_BASE_URL } from '../../config/api';

const HABITS = [
  {
    key: 'drink_water',
    icon: '💧',
    color: '#61dafb',
    title: {
      ru: 'Пить воду',
      en: 'Drink water',
      kaz: 'Су ішу',
    },
    short: {
      ru: 'Простая привычка для энергии и самочувствия.',
      en: 'A simple habit for energy and well-being.',
      kaz: 'Энергия мен жағдайға пайдалы қарапайым әдет.',
    },
    why: {
      ru: 'Если пить воду регулярно, уменьшается вялость, легче думать и день проходит стабильнее.',
      en: 'Regular water intake reduces sluggishness, helps thinking, and makes the day more stable.',
      kaz: 'Суды тұрақты ішу әлсіздікті азайтып, ойлауды жеңілдетеді және күнді тұрақтырақ етеді.',
    },
  },
  {
    key: 'sleep_early',
    icon: '😴',
    color: '#8b7bff',
    title: {
      ru: 'Ложиться раньше',
      en: 'Sleep earlier',
      kaz: 'Ертерек ұйықтау',
    },
    short: {
      ru: 'Даёт более спокойное и сильное утро.',
      en: 'Gives you a calmer and stronger morning.',
      kaz: 'Таңды тынышырақ әрі сергек бастауға көмектеседі.',
    },
    why: {
      ru: 'Если раньше ложиться, легче просыпаться, спокойнее собираться, меньше спешки и больше энергии.',
      en: 'Earlier sleep makes waking up easier, reduces rush, and improves energy.',
      kaz: 'Ертерек ұйықтасаң, ояну жеңілдеп, асығыс азайып, энергия көбейеді.',
    },
  },
  {
    key: 'no_phone_morning',
    icon: '📵',
    color: '#35d07f',
    title: {
      ru: 'Утро без телефона',
      en: 'No phone in the morning',
      kaz: 'Таңертең телефон алмау',
    },
    short: {
      ru: 'Помогает начинать день без шума в голове.',
      en: 'Helps start the day without mental noise.',
      kaz: 'Күнді ойдағы артық шудан тыс бастауға көмектеседі.',
    },
    why: {
      ru: 'Если не брать телефон сразу после пробуждения, утро становится спокойнее и лучше сохраняется фокус.',
      en: 'Avoiding your phone right after waking up makes the morning calmer and improves focus.',
      kaz: 'Оянғаннан кейін бірден телефон алмау таңды тыныш бастап, фокусты жақсартады.',
    },
  },
  {
    key: 'walk_daily',
    icon: '🚶',
    color: '#ffb347',
    title: {
      ru: 'Короткая прогулка',
      en: 'Short daily walk',
      kaz: 'Қысқа серуен',
    },
    short: {
      ru: 'Небольшое движение каждый день.',
      en: 'A little movement every day.',
      kaz: 'Күн сайын аздап қозғалу.',
    },
    why: {
      ru: 'Даже 10–15 минут ходьбы снижают ментальную усталость, освежают голову и делают день живее.',
      en: 'Even 10–15 minutes of walking can reduce mental fatigue and refresh the mind.',
      kaz: 'Тіпті 10–15 минуттық жүру менталды шаршауды азайтып, ойды сергітеді.',
    },
  },
];

const CHALLENGES = [
  {
    key: 'walk_15_daily',
    icon: '🌿',
    color: '#35d07f',
    days: 7,
    title: {
      ru: 'Гулять 15 минут каждый день',
      en: 'Walk 15 minutes every day',
      kaz: 'Күнде 15 минут серуендеу',
    },
    short: {
      ru: 'Простой челлендж для тела и головы.',
      en: 'A simple challenge for body and mind.',
      kaz: 'Дене мен ойға пайдалы қарапайым челлендж.',
    },
    benefit: {
      ru: 'В последнее время люди стали меньше двигаться. Даже короткая прогулка помогает уменьшить ментальную усталость, освежить голову и добавить движения в день.',
      en: 'People move less than before. Even a short walk can reduce mental fatigue, refresh the mind, and add movement to the day.',
      kaz: 'Соңғы уақытта адамдар аз қозғалады. Қысқа серуеннің өзі менталды шаршауды азайтып, ойды сергітіп, күнге қозғалыс қосады.',
    },
  },
  {
    key: 'water_7_days',
    icon: '💧',
    color: '#61dafb',
    days: 7,
    title: {
      ru: 'Пить воду 7 дней подряд',
      en: 'Drink water for 7 days',
      kaz: '7 күн қатарынан су ішу',
    },
    short: {
      ru: 'Челлендж на стабильность и самочувствие.',
      en: 'A consistency challenge for well-being.',
      kaz: 'Тұрақтылық пен жағдайға арналған челлендж.',
    },
    benefit: {
      ru: 'Когда человек забывает про воду, усиливается слабость и падает тонус. Этот челлендж помогает закрепить базовую полезную привычку.',
      en: 'When people forget water, weakness increases. This challenge helps build a basic healthy habit.',
      kaz: 'Адам су ішуді ұмытқанда әлсіздік күшейеді. Бұл челлендж пайдалы негізгі әдетті бекітуге көмектеседі.',
    },
  },
  {
    key: 'sleep_before_2330',
    icon: '🌙',
    color: '#8b7bff',
    days: 7,
    title: {
      ru: 'Ложиться до 23:30',
      en: 'Sleep before 11:30 PM',
      kaz: '23:30-ға дейін ұйықтау',
    },
    short: {
      ru: 'Челлендж для режима и утренней энергии.',
      en: 'A challenge for routine and morning energy.',
      kaz: 'Режим мен таңғы энергияға арналған челлендж.',
    },
    benefit: {
      ru: 'Если человек раньше ложится спать, утро становится спокойнее, энергии больше, а режим дня постепенно выстраивается.',
      en: 'Sleeping earlier improves mornings, boosts energy, and helps build a stable daily routine.',
      kaz: 'Ертерек ұйықтау таңды жақсартып, энергияны арттырып, күн тәртібін қалыптастыруға көмектеседі.',
    },
  },
  {
    key: 'morning_without_phone',
    icon: '📴',
    color: '#ff7b7b',
    days: 5,
    title: {
      ru: '5 дней без телефона утром',
      en: '5 mornings without phone',
      kaz: '5 күн таңертең телефонсыз',
    },
    short: {
      ru: 'Челлендж для фокуса и спокойного начала дня.',
      en: 'A challenge for focus and a calm start.',
      kaz: 'Фокус пен тыныш таңға арналған челлендж.',
    },
    benefit: {
      ru: 'Утро без телефона помогает не перегружать голову сразу после пробуждения и начинать день осознаннее.',
      en: 'A phone-free morning helps avoid overload right after waking up and makes the day start more mindfully.',
      kaz: 'Таңертең телефонсыз болу оянғаннан кейін бастың артық жүктелуін азайтып, күнді саналырақ бастауға көмектеседі.',
    },
  },
];

const getLang = (language) =>
  language === 'kaz' ? 'kaz' : language === 'en' ? 'en' : 'ru';

const getLocalized = (item, lang) => ({
  title: item.title[lang] || item.title.ru,
  short: item.short[lang] || item.short.ru,
  why: item.why ? item.why[lang] || item.why.ru : '',
  benefit: item.benefit ? item.benefit[lang] || item.benefit.ru : '',
});

const Toast = ({ toast }) => {
  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div style={styles.toastWrapper}>
      <div
        style={{
          ...styles.toastCard,
          ...(isError ? styles.toastCardError : styles.toastCardSuccess),
        }}
      >
        <div style={styles.toastIconBox}>{isError ? '!' : '✔'}</div>
        <div>
          <div style={styles.toastTitle}>{toast.title}</div>
          {toast.message ? <div style={styles.toastMessage}>{toast.message}</div> : null}
        </div>
      </div>
    </div>
  );
};

const HabitsPage = ({ onBack }) => {
  const { t, i18n } = useTranslation();
  const lang = getLang(i18n.language);
  const toastTimerRef = useRef(null);

  const tr = (key, fallback) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const getReminderScheduledMessage = (time) => {
    const translated = t('knowledgeModule.habits.reminderScheduled', { time });

    if (translated && translated !== 'knowledgeModule.habits.reminderScheduled') {
      return translated;
    }

    if (lang === 'kaz') {
      return `Сіздің поштаңызға еске салу жіберіледі: ${time}`;
    }

    if (lang === 'en') {
      return `A reminder will be sent to your email at ${time}`;
    }

    return `Напоминание будет отправлено на вашу почту в ${time}`;
  };

  const [activeMode, setActiveMode] = useState('habits');
  const [selectedHabit, setSelectedHabit] = useState('drink_water');
  const [selectedChallenge, setSelectedChallenge] = useState('walk_15_daily');

  const [habitReminderEnabled, setHabitReminderEnabled] = useState(false);
  const [habitReminderTime, setHabitReminderTime] = useState('09:00');

  const [challengeReminderEnabled, setChallengeReminderEnabled] = useState(false);
  const [challengeReminderTime, setChallengeReminderTime] = useState('18:00');

  const [loadingReminder, setLoadingReminder] = useState(false);
  const [savingReminder, setSavingReminder] = useState(false);
  const [toast, setToast] = useState(null);

  const userId = localStorage.getItem('userId');

  const showToast = (type, title, message = '') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ type, title, message });

    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const loadRemindersFromBackend = async () => {
    if (!userId) return;

    try {
      setLoadingReminder(true);

      const response = await fetch(`${API_BASE_URL}/habit-reminders/${userId}`);
      if (!response.ok) return;

      const reminders = await response.json();
      if (!Array.isArray(reminders)) return;

      const habitReminder = reminders.find((item) => item.reminder_type === 'habit');
      const challengeReminder = reminders.find((item) => item.reminder_type === 'challenge');

      if (habitReminder) {
        setSelectedHabit(habitReminder.item_key || 'drink_water');
        setHabitReminderEnabled(Boolean(habitReminder.is_enabled));
        setHabitReminderTime(habitReminder.send_time || '09:00');
      }

      if (challengeReminder) {
        setSelectedChallenge(challengeReminder.item_key || 'walk_15_daily');
        setChallengeReminderEnabled(Boolean(challengeReminder.is_enabled));
        setChallengeReminderTime(challengeReminder.send_time || '18:00');
      }
    } catch (error) {
      console.error('Failed to load reminders:', error);
    } finally {
      setLoadingReminder(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('fitai_habits_ui');

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (parsed.activeMode) setActiveMode(parsed.activeMode);
        if (parsed.selectedHabit) setSelectedHabit(parsed.selectedHabit);
        if (parsed.selectedChallenge) setSelectedChallenge(parsed.selectedChallenge);

        if (typeof parsed.habitReminderEnabled === 'boolean') {
          setHabitReminderEnabled(parsed.habitReminderEnabled);
        }

        if (parsed.habitReminderTime) setHabitReminderTime(parsed.habitReminderTime);

        if (typeof parsed.challengeReminderEnabled === 'boolean') {
          setChallengeReminderEnabled(parsed.challengeReminderEnabled);
        }

        if (parsed.challengeReminderTime) {
          setChallengeReminderTime(parsed.challengeReminderTime);
        }
      } catch (e) {
        console.error('Failed to parse local habits UI state:', e);
      }
    }
  }, []);

  useEffect(() => {
    loadRemindersFromBackend();
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(
      'fitai_habits_ui',
      JSON.stringify({
        activeMode,
        selectedHabit,
        selectedChallenge,
        habitReminderEnabled,
        habitReminderTime,
        challengeReminderEnabled,
        challengeReminderTime,
      })
    );
  }, [
    activeMode,
    selectedHabit,
    selectedChallenge,
    habitReminderEnabled,
    habitReminderTime,
    challengeReminderEnabled,
    challengeReminderTime,
  ]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const currentHabit = useMemo(
    () => HABITS.find((item) => item.key === selectedHabit) || HABITS[0],
    [selectedHabit]
  );

  const currentChallenge = useMemo(
    () => CHALLENGES.find((item) => item.key === selectedChallenge) || CHALLENGES[0],
    [selectedChallenge]
  );

  const currentHabitContent = getLocalized(currentHabit, lang);
  const currentChallengeContent = getLocalized(currentChallenge, lang);

  const habitChain = useMemo(() => {
    if (selectedHabit === 'sleep_early') {
      return [
        tr('knowledgeModule.habits.ui.chainSleep1', 'Раньше лёг спать'),
        tr('knowledgeModule.habits.ui.chainSleep2', 'Легче проснулся'),
        tr('knowledgeModule.habits.ui.chainSleep3', 'Спокойнее начал утро'),
        tr('knowledgeModule.habits.ui.chainSleep4', 'Меньше спешки и опозданий'),
        tr('knowledgeModule.habits.ui.chainSleep5', 'День стал лучше'),
      ];
    }

    if (selectedHabit === 'drink_water') {
      return [
        tr('knowledgeModule.habits.ui.chainWater1', 'Выпил воду'),
        tr('knowledgeModule.habits.ui.chainWater2', 'Меньше вялости'),
        tr('knowledgeModule.habits.ui.chainWater3', 'Лучше самочувствие'),
        tr('knowledgeModule.habits.ui.chainWater4', 'Больше энергии'),
        tr('knowledgeModule.habits.ui.chainWater5', 'Стабильнее день'),
      ];
    }

    if (selectedHabit === 'no_phone_morning') {
      return [
        tr('knowledgeModule.habits.ui.chainPhone1', 'Не взял телефон утром'),
        tr('knowledgeModule.habits.ui.chainPhone2', 'Меньше шума в голове'),
        tr('knowledgeModule.habits.ui.chainPhone3', 'Спокойнее начало дня'),
        tr('knowledgeModule.habits.ui.chainPhone4', 'Лучше фокус'),
        tr('knowledgeModule.habits.ui.chainPhone5', 'Меньше хаоса'),
      ];
    }

    return [
      tr('knowledgeModule.habits.ui.chainGeneric1', 'Маленькое действие'),
      tr('knowledgeModule.habits.ui.chainGeneric2', 'Лучше состояние'),
      tr('knowledgeModule.habits.ui.chainGeneric3', 'Лучше день'),
      tr('knowledgeModule.habits.ui.chainGeneric4', 'Больше стабильности'),
      tr('knowledgeModule.habits.ui.chainGeneric5', 'Полезный образ жизни'),
    ];
  }, [selectedHabit, t]);

  const saveReminderToBackend = async (type) => {
    if (!userId) {
      showToast(
        'error',
        tr('common.error', 'Ошибка'),
        tr(
          'knowledgeModule.habits.ui.noUser',
          'Сначала нужно войти в аккаунт, чтобы сохранить напоминание.'
        )
      );
      return;
    }

    const isHabit = type === 'habit';
    const selectedTime = isHabit ? habitReminderTime : challengeReminderTime;
    const isEnabled = isHabit ? habitReminderEnabled : challengeReminderEnabled;

    const payload = {
      reminder_type: type,
      item_key: isHabit ? selectedHabit : selectedChallenge,
      send_time: selectedTime,
      language: lang,
      is_enabled: isEnabled,
      timezone: 'Asia/Almaty',
    };

    try {
      setSavingReminder(true);

      const response = await fetch(`${API_BASE_URL}/habit-reminders/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorText =
          typeof data?.detail === 'string'
            ? data.detail
            : tr('common.error', 'Ошибка');

        showToast('error', tr('common.error', 'Ошибка'), errorText);
        return;
      }

      if ('Notification' in window && Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch (error) {
          console.error('Notification permission request failed:', error);
        }
      }

      await loadRemindersFromBackend();

      if (isEnabled) {
        showToast(
          'success',
          tr('common.success', 'Сәтті орындалды!'),
          getReminderScheduledMessage(selectedTime)
        );
      } else {
        showToast(
          'success',
          tr('common.success', 'Сәтті орындалды!'),
          tr(
            'knowledgeModule.habits.ui.reminderDisabledSaved',
            'Напоминание сохранено, но сейчас оно выключено.'
          )
        );
      }
    } catch (error) {
      console.error('Failed to save reminder:', error);

      showToast(
        'error',
        tr('common.error', 'Ошибка'),
        tr(
          'knowledgeModule.habits.ui.saveError',
          'Не удалось сохранить напоминание. Проверь сервер.'
        )
      );
    } finally {
      setSavingReminder(false);
    }
  };

  return (
    <div>
      <Toast toast={toast} />

      <div style={styles.headerCard}>
        <div style={styles.icon}>🎯</div>
        <div>
          <div style={styles.badge}>
            {tr('knowledgeModule.habits.ui.badge', 'Habit Builder')}
          </div>
          <h2 style={styles.title}>
            {tr('knowledgeModule.habits.title', 'Полезные привычки')}
          </h2>
          <p style={styles.text}>
            {tr(
              'knowledgeModule.habits.ui.heroText',
              'Здесь пользователь выбирает привычку или челлендж, понимает зачем это нужно и включает напоминание для повседневной жизни.'
            )}
          </p>
        </div>
      </div>

      <div style={styles.switcher}>
        <button
          type="button"
          onClick={() => setActiveMode('habits')}
          style={{
            ...styles.switchButton,
            ...(activeMode === 'habits' ? styles.switchButtonActive : {}),
          }}
        >
          {tr('knowledgeModule.habits.ui.habitsTab', 'Привычки')}
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('challenges')}
          style={{
            ...styles.switchButton,
            ...(activeMode === 'challenges' ? styles.switchButtonActive : {}),
          }}
        >
          {tr('knowledgeModule.habits.ui.challengeTab', 'Челленджи')}
        </button>
      </div>

      {activeMode === 'habits' && (
        <>
          <div style={styles.grid}>
            {HABITS.map((habit) => {
              const item = getLocalized(habit, lang);
              const active = selectedHabit === habit.key;

              return (
                <button
                  key={habit.key}
                  type="button"
                  onClick={() => setSelectedHabit(habit.key)}
                  style={{
                    ...styles.itemCard,
                    borderColor: active ? habit.color : 'rgba(255,255,255,0.08)',
                    boxShadow: active ? `0 10px 24px ${habit.color}22` : 'none',
                    transform: active ? 'translateY(-2px)' : 'translateY(0)',
                  }}
                >
                  <div
                    style={{
                      ...styles.itemIcon,
                      background: `${habit.color}18`,
                      color: habit.color,
                    }}
                  >
                    {habit.icon}
                  </div>
                  <h3 style={styles.itemTitle}>{item.title}</h3>
                  <p style={styles.itemDesc}>{item.short}</p>
                </button>
              );
            })}
          </div>

          <div style={styles.mainPanel}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                {tr('knowledgeModule.habits.ui.currentHabit', 'Выбранная привычка')}
              </h3>

              <div style={styles.currentHeader}>
                <div
                  style={{
                    ...styles.bigIcon,
                    background: `${currentHabit.color}18`,
                    color: currentHabit.color,
                  }}
                >
                  {currentHabit.icon}
                </div>
                <div>
                  <div style={styles.currentTitle}>{currentHabitContent.title}</div>
                  <div style={styles.currentDesc}>{currentHabitContent.short}</div>
                </div>
              </div>

              <div style={styles.infoBlock}>
                <div style={styles.infoLabel}>
                  {tr('knowledgeModule.habits.ui.whyItMatters', 'Почему это важно')}
                </div>
                <div style={styles.infoText}>{currentHabitContent.why}</div>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                {tr('knowledgeModule.habits.ui.chainTitle', 'Как это влияет на день')}
              </h3>

              <div style={styles.chainList}>
                {habitChain.map((step, index) => (
                  <div key={index} style={styles.chainItem}>
                    <div style={styles.chainNum}>{index + 1}</div>
                    <div style={styles.chainText}>{step}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                {tr('knowledgeModule.habits.ui.reminderTitle', 'Напоминание о привычке')}
              </h3>

              <div style={styles.reminderRow}>
                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={habitReminderEnabled}
                    onChange={(e) => setHabitReminderEnabled(e.target.checked)}
                  />
                  <span>
                    {tr(
                      'knowledgeModule.habits.ui.enableEmail',
                      'Включить напоминание на почту'
                    )}
                  </span>
                </label>

                <div style={styles.timeBlock}>
                  <span style={styles.timeLabel}>
                    {tr('knowledgeModule.habits.ui.timeLabel', 'Время')}
                  </span>
                  <input
                    type="time"
                    value={habitReminderTime}
                    onChange={(e) => setHabitReminderTime(e.target.value)}
                    style={styles.timeInput}
                  />
                </div>
              </div>

              <div style={styles.previewBox}>
                <div style={styles.previewLabel}>
                  {tr('knowledgeModule.habits.ui.previewLabel', 'Пример письма')}
                </div>
                <div style={styles.previewText}>
                  {selectedHabit === 'drink_water'
                    ? tr(
                        'knowledgeModule.habits.ui.previewWater',
                        'Привет! Ты не забыл выпить воду сегодня?'
                      )
                    : selectedHabit === 'sleep_early'
                    ? tr(
                        'knowledgeModule.habits.ui.previewSleep',
                        'Привет! Напоминаем про привычку: постарайся лечь спать пораньше сегодня.'
                      )
                    : selectedHabit === 'no_phone_morning'
                    ? tr(
                        'knowledgeModule.habits.ui.previewPhone',
                        'Привет! Не забудь: спокойное утро без телефона помогает фокусу.'
                      )
                    : tr(
                        'knowledgeModule.habits.ui.previewWalk',
                        'Привет! Небольшая прогулка сегодня поможет телу и голове.'
                      )}
                </div>
              </div>

              <button
                type="button"
                style={{
                  ...styles.primaryButton,
                  ...(savingReminder ? styles.primaryButtonDisabled : {}),
                }}
                onClick={() => saveReminderToBackend('habit')}
                disabled={savingReminder}
              >
                {savingReminder
                  ? tr('knowledgeModule.habits.ui.saving', 'Сохранение...')
                  : tr('knowledgeModule.habits.ui.saveReminder', 'Сохранить напоминание')}
              </button>
            </div>
          </div>
        </>
      )}

      {activeMode === 'challenges' && (
        <>
          <div style={styles.grid}>
            {CHALLENGES.map((challenge) => {
              const item = getLocalized(challenge, lang);
              const active = selectedChallenge === challenge.key;

              return (
                <button
                  key={challenge.key}
                  type="button"
                  onClick={() => setSelectedChallenge(challenge.key)}
                  style={{
                    ...styles.itemCard,
                    borderColor: active ? challenge.color : 'rgba(255,255,255,0.08)',
                    boxShadow: active ? `0 10px 24px ${challenge.color}22` : 'none',
                    transform: active ? 'translateY(-2px)' : 'translateY(0)',
                  }}
                >
                  <div
                    style={{
                      ...styles.itemIcon,
                      background: `${challenge.color}18`,
                      color: challenge.color,
                    }}
                  >
                    {challenge.icon}
                  </div>
                  <h3 style={styles.itemTitle}>{item.title}</h3>
                  <p style={styles.itemDesc}>{item.short}</p>
                  <div style={styles.daysBadge}>
                    {challenge.days} {tr('knowledgeModule.habits.ui.days', 'дней')}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={styles.mainPanel}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                {tr('knowledgeModule.habits.ui.currentChallenge', 'Выбранный челлендж')}
              </h3>

              <div style={styles.currentHeader}>
                <div
                  style={{
                    ...styles.bigIcon,
                    background: `${currentChallenge.color}18`,
                    color: currentChallenge.color,
                  }}
                >
                  {currentChallenge.icon}
                </div>
                <div>
                  <div style={styles.currentTitle}>{currentChallengeContent.title}</div>
                  <div style={styles.currentDesc}>
                    {currentChallenge.days} {tr('knowledgeModule.habits.ui.days', 'дней')}
                  </div>
                </div>
              </div>

              <div style={styles.infoBlock}>
                <div style={styles.infoLabel}>
                  {tr('knowledgeModule.habits.ui.challengeBenefitTitle', 'Почему это полезно')}
                </div>
                <div style={styles.infoText}>{currentChallengeContent.benefit}</div>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                {tr(
                  'knowledgeModule.habits.ui.challengeReminderTitle',
                  'Напоминание о челлендже'
                )}
              </h3>

              <div style={styles.reminderRow}>
                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={challengeReminderEnabled}
                    onChange={(e) => setChallengeReminderEnabled(e.target.checked)}
                  />
                  <span>
                    {tr(
                      'knowledgeModule.habits.ui.enableChallengeEmail',
                      'Включить напоминание о челлендже на почту'
                    )}
                  </span>
                </label>

                <div style={styles.timeBlock}>
                  <span style={styles.timeLabel}>
                    {tr('knowledgeModule.habits.ui.timeLabel', 'Время')}
                  </span>
                  <input
                    type="time"
                    value={challengeReminderTime}
                    onChange={(e) => setChallengeReminderTime(e.target.value)}
                    style={styles.timeInput}
                  />
                </div>
              </div>

              <div style={styles.previewBox}>
                <div style={styles.previewLabel}>
                  {tr('knowledgeModule.habits.ui.previewLabel', 'Пример письма')}
                </div>
                <div style={styles.previewText}>
                  {selectedChallenge === 'walk_15_daily'
                    ? tr(
                        'knowledgeModule.habits.ui.challengePreviewWalk',
                        'Привет! Напоминаем про твой челлендж: 15 минут прогулки сегодня помогут освежить голову и уменьшить усталость.'
                      )
                    : selectedChallenge === 'water_7_days'
                    ? tr(
                        'knowledgeModule.habits.ui.challengePreviewWater',
                        'Привет! Не забудь про челлендж: выпей воду сегодня и сохрани ритм.'
                      )
                    : selectedChallenge === 'sleep_before_2330'
                    ? tr(
                        'knowledgeModule.habits.ui.challengePreviewSleep',
                        'Привет! Напоминаем про челлендж: постарайся лечь спать вовремя сегодня.'
                      )
                    : tr(
                        'knowledgeModule.habits.ui.challengePreviewPhone',
                        'Привет! Напоминаем про челлендж: постарайся начать утро без телефона.'
                      )}
                </div>
              </div>

              <button
                type="button"
                style={{
                  ...styles.primaryButton,
                  ...(savingReminder ? styles.primaryButtonDisabled : {}),
                }}
                onClick={() => saveReminderToBackend('challenge')}
                disabled={savingReminder}
              >
                {savingReminder
                  ? tr('knowledgeModule.habits.ui.saving', 'Сохранение...')
                  : tr(
                      'knowledgeModule.habits.ui.saveChallengeReminder',
                      'Сохранить напоминание'
                    )}
              </button>
            </div>
          </div>
        </>
      )}

      {loadingReminder ? (
        <div style={styles.statusBox}>
          {tr('knowledgeModule.habits.ui.loadingReminder', 'Загрузка напоминаний...')}
        </div>
      ) : null}

      <RecommendedVideos topic="habits" />
    </div>
  );
};

const styles = {
  toastWrapper: {
    position: 'fixed',
    top: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 99999,
    width: 'calc(100% - 32px)',
    maxWidth: '520px',
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastCard: {
    width: '100%',
    minHeight: '70px',
    padding: '16px 20px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    color: '#fff',
    boxShadow: '0 18px 45px rgba(0,0,0,0.30)',
    animation: 'fitaiToastIn 0.28s ease',
    pointerEvents: 'auto',
  },
  toastCardSuccess: {
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  },
  toastCardError: {
    background: 'linear-gradient(135deg, #ff5f6d 0%, #d90429 100%)',
  },
  toastIconBox: {
    minWidth: '34px',
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '19px',
    fontWeight: '900',
  },
  toastTitle: {
    fontSize: '17px',
    fontWeight: '900',
    lineHeight: 1.25,
  },
  toastMessage: {
    marginTop: '3px',
    fontSize: '13px',
    lineHeight: 1.45,
    fontWeight: '600',
    opacity: 0.96,
  },
  headerCard: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
    padding: '22px',
    borderRadius: '24px',
    background: 'var(--card-bg, rgba(255,255,255,0.03))',
    border: '1px solid rgba(255,255,255,0.08)',
    marginBottom: '16px',
  },
  icon: {
    width: '54px',
    height: '54px',
    borderRadius: '16px',
    background: 'rgba(97,218,251,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
    flexShrink: 0,
  },
  badge: {
    display: 'inline-flex',
    padding: '7px 12px',
    borderRadius: '999px',
    background: 'rgba(97,218,251,0.12)',
    border: '1px solid rgba(97,218,251,0.20)',
    color: '#61dafb',
    fontSize: '12px',
    fontWeight: '800',
    marginBottom: '10px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  text: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: '15px',
    lineHeight: 1.75,
  },
  switcher: {
    display: 'inline-flex',
    padding: '4px',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    gap: '4px',
    marginBottom: '18px',
  },
  switchButton: {
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    padding: '10px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
  },
  switchButtonActive: {
    background:
      'linear-gradient(135deg, rgba(97,218,251,0.18) 0%, rgba(97,218,251,0.08) 100%)',
    color: 'var(--text-primary)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  itemCard: {
    textAlign: 'left',
    padding: '18px',
    borderRadius: '22px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'var(--card-bg, rgba(255,255,255,0.03))',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    position: 'relative',
    color: 'var(--text-primary)',
  },
  itemIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    marginBottom: '12px',
  },
  itemTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: '800',
  },
  itemDesc: {
    margin: 0,
    color: 'var(--text-secondary)',
    lineHeight: 1.65,
    fontSize: '14px',
  },
  daysBadge: {
    marginTop: '12px',
    display: 'inline-flex',
    padding: '6px 10px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--text-secondary)',
    fontSize: '12px',
    fontWeight: '700',
  },
  mainPanel: {
    display: 'grid',
    gap: '16px',
  },
  card: {
    padding: '22px',
    borderRadius: '24px',
    background: 'var(--card-bg, rgba(255,255,255,0.03))',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  cardTitle: {
    margin: '0 0 14px 0',
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  currentHeader: {
    display: 'flex',
    gap: '14px',
    alignItems: 'center',
    marginBottom: '16px',
  },
  bigIcon: {
    width: '62px',
    height: '62px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '30px',
    flexShrink: 0,
  },
  currentTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '6px',
  },
  currentDesc: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  infoBlock: {
    padding: '16px',
    borderRadius: '18px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  infoLabel: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#61dafb',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  infoText: {
    color: 'var(--text-primary)',
    fontSize: '15px',
    lineHeight: 1.75,
  },
  chainList: {
    display: 'grid',
    gap: '12px',
  },
  chainItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  chainNum: {
    minWidth: '32px',
    height: '32px',
    borderRadius: '10px',
    background: 'rgba(97,218,251,0.15)',
    color: '#61dafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
  },
  chainText: {
    color: 'var(--text-primary)',
    lineHeight: 1.6,
    fontSize: '14px',
  },
  reminderRow: {
    display: 'grid',
    gap: '14px',
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontWeight: '600',
  },
  timeBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  timeLabel: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    fontWeight: '600',
  },
  timeInput: {
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.04)',
    color: 'var(--text-primary)',
  },
  previewBox: {
    marginTop: '16px',
    padding: '16px',
    borderRadius: '18px',
    background: 'rgba(97,218,251,0.06)',
    border: '1px dashed rgba(97,218,251,0.22)',
  },
  previewLabel: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#61dafb',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  previewText: {
    color: 'var(--text-primary)',
    lineHeight: 1.7,
    fontSize: '14px',
  },
  primaryButton: {
    marginTop: '16px',
    padding: '12px 18px',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #61dafb 0%, #4a90e2 100%)',
    color: '#13202b',
    fontWeight: '800',
    cursor: 'pointer',
    fontSize: '14px',
  },
  primaryButtonDisabled: {
    opacity: 0.65,
    cursor: 'not-allowed',
  },
  statusBox: {
    marginTop: '16px',
    marginBottom: '6px',
    padding: '14px 16px',
    borderRadius: '16px',
    background: 'rgba(97,218,251,0.08)',
    border: '1px solid rgba(97,218,251,0.16)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    lineHeight: 1.6,
  },
};

export default HabitsPage;