import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RecommendedVideos from './RecommendedVideos';

const DEFAULT_FORM = {
  sleepHours: 6,
  distraction: 3,
  screenOverload: 3,
  mentalFatigue: 3,
  taskSwitching: 3,
  calmness: 3,
  motivation: 3,
};

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getSleepBonus(hours) {
  if (hours >= 8) return 18;
  if (hours >= 7) return 12;
  if (hours >= 6) return 6;
  if (hours >= 5) return 0;
  return -10;
}

function getFocusLevel(score) {
  if (score >= 75) return 'high';
  if (score >= 45) return 'medium';
  return 'low';
}

function getLevelColor(level) {
  if (level === 'high') return '#35d07f';
  if (level === 'medium') return '#ffb347';
  return '#ff7b7b';
}

function analyzeFocusSurvey(form) {
  const sleepBonus = getSleepBonus(Number(form.sleepHours));

  const focusRaw =
    60 +
    sleepBonus +
    Number(form.calmness) * 8 +
    Number(form.motivation) * 7 -
    Number(form.distraction) * 12 -
    Number(form.screenOverload) * 9 -
    Number(form.mentalFatigue) * 11 -
    Number(form.taskSwitching) * 10;

  const focusScore = clampPercent(focusRaw);

  const distractionRisk = clampPercent(
    Number(form.distraction) * 16 +
      Number(form.taskSwitching) * 14 +
      Number(form.screenOverload) * 12
  );

  const overloadPercent = clampPercent(
    Number(form.mentalFatigue) * 16 +
      Number(form.screenOverload) * 10 +
      (6 - Number(form.calmness)) * 8 +
      (6 - Number(form.motivation)) * 6
  );

  const level = getFocusLevel(focusScore);

  return {
    focusScore,
    distractionRisk,
    overloadPercent,
    level,
  };
}

function CircleGauge({ value, label, color }) {
  const radius = 52;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;

  return (
    <div style={styles.gaugeWrap}>
      <div style={styles.gaugeSvgBox}>
        <svg height={radius * 2} width={radius * 2} style={{ overflow: 'visible' }}>
          <circle
            stroke="rgba(255,255,255,0.08)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              transition: 'stroke-dashoffset 0.6s ease',
            }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        <div style={styles.gaugeCenter}>
          <div style={styles.gaugeValue}>{value}%</div>
        </div>
      </div>

      <div style={styles.gaugeLabel}>{label}</div>
    </div>
  );
}

function ProgressStat({ label, value, color, subtitle }) {
  return (
    <div style={styles.progressCard}>
      <div style={styles.progressTop}>
        <div>
          <div style={styles.progressLabel}>{label}</div>
          {subtitle ? <div style={styles.progressSub}>{subtitle}</div> : null}
        </div>
        <div style={{ ...styles.progressValue, color }}>{value}%</div>
      </div>

      <div style={styles.progressTrack}>
        <div
          style={{
            ...styles.progressFill,
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)`,
            boxShadow: `0 0 18px ${color}44`,
          }}
        />
      </div>
    </div>
  );
}

function SurveySlider({
  label,
  value,
  min = 1,
  max = 5,
  leftText,
  rightText,
  onChange,
}) {
  return (
    <div style={styles.fieldCard}>
      <div style={styles.fieldTop}>
        <label style={styles.label}>{label}</label>
        <span style={styles.valueBadge}>{value}</span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step="1"
        value={value}
        onChange={onChange}
        style={styles.range}
      />

      <div style={styles.scaleRow}>
        <span style={styles.scaleText}>{leftText}</span>
        <span style={styles.scaleText}>{rightText}</span>
      </div>
    </div>
  );
}

const EXERCISES = {
  ru: [
    {
      key: 'mirror',
      icon: '🪞',
      color: '#8b7bff',
      title: 'Разговор с собой перед зеркалом',
      duration: '5–10 мин',
      desc: 'Смотри на себя в зеркало, держи взгляд и спокойно говори вслух на одну тему.',
      why: 'Помогает удерживать внимание на одном объекте, снижает внутренний хаос и тренирует самоконтроль.',
      benefits: [
        'Улучшает устойчивость внимания',
        'Учит не убегать мыслями',
        'Помогает спокойнее собраться перед делом',
      ],
      youtubeUrl: 'https://www.youtube.com/results?search_query=mirror+self+talk+focus+exercise',
    },
    {
      key: 'meditation',
      icon: '🧘',
      color: '#35d07f',
      title: 'Короткая медитация на дыхание',
      duration: '3–10 мин',
      desc: 'Закрой глаза и возвращай внимание к дыханию каждый раз, когда ум отвлекается.',
      why: 'Это одно из самых понятных упражнений для тренировки возвращения внимания обратно в фокус.',
      benefits: [
        'Уменьшает ментальный шум',
        'Учит замечать отвлечение',
        'Успокаивает перегруженную голову',
      ],
      youtubeUrl: 'https://www.youtube.com/results?search_query=breathing+meditation+for+focus',
    },
    {
      key: 'warmup',
      icon: '🏃',
      color: '#ffb347',
      title: 'Физическая разминка',
      duration: '5–8 мин',
      desc: 'Лёгкая активность: ходьба на месте, растяжка, повороты, приседания или короткая зарядка.',
      why: 'Когда тело оживает, голове часто становится легче держать внимание на задаче.',
      benefits: [
        'Снижает вялость',
        'Даёт телу движение',
        'Помогает включиться в работу',
      ],
      youtubeUrl: 'https://www.youtube.com/results?search_query=short+warm+up+for+focus',
    },
    {
      key: 'stillness',
      icon: '🪑',
      color: '#ff7b7b',
      title: 'Посидеть неподвижно',
      duration: '5 мин',
      desc: 'Сядь удобно и попробуй 5 минут не ерзать, не трогать телефон и не менять положение без причины.',
      why: 'Это тренирует управление импульсами и помогает мозгу меньше распыляться на лишние действия.',
      benefits: [
        'Улучшает самоконтроль',
        'Снижает внутреннюю суету',
        'Помогает удерживать внимание',
      ],
      youtubeUrl: 'https://www.youtube.com/results?search_query=stillness+exercise+attention+training',
    },
    {
      key: 'listening',
      icon: '🎧',
      color: '#61dafb',
      title: 'Внимательное слушание',
      duration: '10–15 мин',
      desc: 'Послушай лекцию, подкаст или спокойный аудиофрагмент без телефона и без параллельных действий.',
      why: 'Такое упражнение тренирует чистое удержание внимания на одном канале восприятия.',
      benefits: [
        'Улучшает концентрацию на одной задаче',
        'Меньше переключений',
        'Повышает качество восприятия',
      ],
      youtubeUrl: 'https://www.youtube.com/results?search_query=focus+listening+exercise+podcast',
    },
  ],
  en: [
    {
      key: 'mirror',
      icon: '🪞',
      color: '#8b7bff',
      title: 'Mirror self-talk',
      duration: '5–10 min',
      desc: 'Look at yourself in the mirror, keep eye contact, and speak calmly about one topic.',
      why: 'It helps hold attention on one object and improves self-control.',
      benefits: [
        'Improves steady attention',
        'Reduces mental wandering',
        'Helps prepare calmly for work',
      ],
      youtubeUrl: 'https://www.youtube.com/results?search_query=mirror+self+talk+focus+exercise',
    },
    {
      key: 'meditation',
      icon: '🧘',
      color: '#35d07f',
      title: 'Short breathing meditation',
      duration: '3–10 min',
      desc: 'Close your eyes and gently return attention to breathing whenever the mind drifts.',
      why: 'This is one of the clearest ways to train attention to come back into focus.',
      benefits: [
        'Reduces mental noise',
        'Teaches awareness of distraction',
        'Calms an overloaded mind',
      ],
      youtubeUrl: 'https://www.youtube.com/results?search_query=breathing+meditation+for+focus',
    },
    {
      key: 'warmup',
      icon: '🏃',
      color: '#ffb347',
      title: 'Physical warm-up',
      duration: '5–8 min',
      desc: 'Do light movement: walking in place, stretching, turns, squats, or a short warm-up.',
      why: 'When the body wakes up, the mind often focuses more easily.',
      benefits: [
        'Reduces sluggishness',
        'Adds movement',
        'Helps switch into work mode',
      ],
      youtubeUrl: 'https://www.youtube.com/results?search_query=short+warm+up+for+focus',
    },
    {
      key: 'stillness',
      icon: '🪑',
      color: '#ff7b7b',
      title: 'Sit still',
      duration: '5 min',
      desc: 'Sit comfortably and try not to fidget, touch the phone, or move without reason.',
      why: 'It trains impulse control and helps the brain stop scattering attention.',
      benefits: [
        'Improves self-control',
        'Reduces inner restlessness',
        'Helps maintain attention',
      ],
      youtubeUrl: 'https://www.youtube.com/results?search_query=stillness+exercise+attention+training',
    },
    {
      key: 'listening',
      icon: '🎧',
      color: '#61dafb',
      title: 'Focused listening',
      duration: '10–15 min',
      desc: 'Listen to a lecture, podcast, or calm audio without your phone and without multitasking.',
      why: 'It trains the ability to keep attention on one channel of input.',
      benefits: [
        'Improves single-task attention',
        'Reduces switching',
        'Improves depth of perception',
      ],
      youtubeUrl: 'https://www.youtube.com/results?search_query=focus+listening+exercise+podcast',
    },
  ],
  kaz: [
    {
      key: 'mirror',
      icon: '🪞',
      color: '#8b7bff',
      title: 'Айна алдында өзіңмен сөйлесу',
      duration: '5–10 мин',
      desc: 'Айнаға қарап, көзіңді сақтап, бір тақырыпта байыппен дауыстап сөйле.',
      why: 'Бұл зейінді бір нысанда ұстауға және өзін бақылауға көмектеседі.',
      benefits: [
        'Назар тұрақтылығын жақсартады',
        'Ойдың шашырауын азайтады',
        'Іске сабырлырақ кірісуге көмектеседі',
      ],
      youtubeUrl: 'https://www.youtube.com/results?search_query=mirror+self+talk+focus+exercise',
    },
    {
      key: 'meditation',
      icon: '🧘',
      color: '#35d07f',
      title: 'Тынысқа қысқа медитация',
      duration: '3–10 мин',
      desc: 'Көзіңді жұмып, ой бөлінген сайын назарыңды тынысқа қайта әкел.',
      why: 'Бұл назарды қайтадан фокусқа қайтаруды жаттықтырады.',
      benefits: [
        'Ойдағы шуды азайтады',
        'Алаңдауды тезірек байқауға үйретеді',
        'Шаршаған ойды тыныштандырады',
      ],
      youtubeUrl: 'https://www.youtube.com/results?search_query=breathing+meditation+for+focus',
    },
    {
      key: 'warmup',
      icon: '🏃',
      color: '#ffb347',
      title: 'Қысқа дене сергіту',
      duration: '5–8 мин',
      desc: 'Жеңіл қозғалыс жаса: орнында жүру, созылу, бұрылу, отырып-тұру.',
      why: 'Дене сергісе, ойға да фокус ұстау жеңілдейді.',
      benefits: [
        'Әлсіздікті азайтады',
        'Қозғалыс қосады',
        'Жұмысқа кіруге көмектеседі',
      ],
      youtubeUrl: 'https://www.youtube.com/results?search_query=short+warm+up+for+focus',
    },
    {
      key: 'stillness',
      icon: '🪑',
      color: '#ff7b7b',
      title: 'Қозғалмай отыру',
      duration: '5 мин',
      desc: 'Ыңғайлы отыр да, 5 минут артық қозғалыссыз, телефонсыз отыруға тырыс.',
      why: 'Бұл импульстерді басқаруды және назардың шашырамауын жаттықтырады.',
      benefits: [
        'Өзін бақылауды күшейтеді',
        'Ішкі асығыстықты азайтады',
        'Назарды ұстауға көмектеседі',
      ],
      youtubeUrl: 'https://www.youtube.com/results?search_query=stillness+exercise+attention+training',
    },
    {
      key: 'listening',
      icon: '🎧',
      color: '#61dafb',
      title: 'Мұқият тыңдау',
      duration: '10–15 мин',
      desc: 'Телефонсыз және қатар басқа іссіз лекция, подкаст немесе тыныш аудио тыңда.',
      why: 'Бұл бір арнаға назарды ұзақ ұстауды жаттықтырады.',
      benefits: [
        'Бір тапсырмаға назарды жақсартады',
        'Ауысуларды азайтады',
        'Қабылдауды тереңдетеді',
      ],
      youtubeUrl: 'https://www.youtube.com/results?search_query=focus+listening+exercise+podcast',
    },
  ],
};

const FocusPage = ({ onBack }) => {
  const { t, i18n } = useTranslation();

  const tr = (key, fallback) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const lang = i18n.language === 'kaz' ? 'kaz' : i18n.language === 'en' ? 'en' : 'ru';

  const [activeTab, setActiveTab] = useState('check'); // check | exercises
  const [mode, setMode] = useState('overview'); // overview | survey | result
  const [form, setForm] = useState(DEFAULT_FORM);
  const [selectedExercise, setSelectedExercise] = useState('meditation');

  const analysis = useMemo(() => {
    if (mode !== 'result') return null;
    return analyzeFocusSurvey(form);
  }, [form, mode]);

  const exercises = EXERCISES[lang] || EXERCISES.ru;

  const currentExercise = useMemo(
    () => exercises.find((item) => item.key === selectedExercise) || exercises[0],
    [exercises, selectedExercise]
  );

  const focusFoods = useMemo(() => {
    if (!analysis) return [];
    if (analysis.level === 'low') {
      return [
        tr('knowledgeModule.focus.ui.foodLow1', 'Вода'),
        tr('knowledgeModule.focus.ui.foodLow2', 'Лёгкий нормальный завтрак'),
        tr('knowledgeModule.focus.ui.foodLow3', 'Орехи'),
        tr('knowledgeModule.focus.ui.foodLow4', 'Фрукты'),
      ];
    }
    if (analysis.level === 'medium') {
      return [
        tr('knowledgeModule.focus.ui.foodMedium1', 'Вода'),
        tr('knowledgeModule.focus.ui.foodMedium2', 'Белковый перекус'),
        tr('knowledgeModule.focus.ui.foodMedium3', 'Фрукты'),
        tr('knowledgeModule.focus.ui.foodMedium4', 'Лёгкая еда без перегруза'),
      ];
    }
    return [
      tr('knowledgeModule.focus.ui.foodHigh1', 'Вода'),
      tr('knowledgeModule.focus.ui.foodHigh2', 'Сбалансированное питание'),
      tr('knowledgeModule.focus.ui.foodHigh3', 'Белок'),
      tr('knowledgeModule.focus.ui.foodHigh4', 'Еда без тяжести перед важной задачей'),
    ];
  }, [analysis, t]);

  const miniResets = useMemo(() => {
    if (!analysis) return [];
    if (analysis.level === 'low') {
      return [
        tr('knowledgeModule.focus.ui.resetLow1', 'Убрать телефон на 10 минут'),
        tr('knowledgeModule.focus.ui.resetLow2', 'Выпить воды'),
        tr('knowledgeModule.focus.ui.resetLow3', 'Пройтись 5–10 минут'),
        tr('knowledgeModule.focus.ui.resetLow4', 'Вернуться только к 1 задаче'),
      ];
    }
    if (analysis.level === 'medium') {
      return [
        tr('knowledgeModule.focus.ui.resetMedium1', 'Работать коротким блоком 25–40 минут'),
        tr('knowledgeModule.focus.ui.resetMedium2', 'Убрать лишние уведомления'),
        tr('knowledgeModule.focus.ui.resetMedium3', 'Сделать короткий перерыв'),
        tr('knowledgeModule.focus.ui.resetMedium4', 'Выбрать 1 главную задачу'),
      ];
    }
    return [
      tr('knowledgeModule.focus.ui.resetHigh1', 'Использовать это состояние для важной работы'),
      tr('knowledgeModule.focus.ui.resetHigh2', 'Не распыляться на мелочи'),
      tr('knowledgeModule.focus.ui.resetHigh3', 'Сохранять спокойный ритм'),
      tr('knowledgeModule.focus.ui.resetHigh4', 'Не перегружать мозг лишними переключениями'),
    ];
  }, [analysis, t]);

  const resultData = useMemo(() => {
    if (!analysis) return null;

    if (analysis.level === 'high') {
      return {
        icon: '🎯',
        color: '#35d07f',
        title: tr('knowledgeModule.focus.ui.highTitle', 'Хороший уровень фокуса'),
        desc: tr(
          'knowledgeModule.focus.ui.highDesc',
          'Сейчас у тебя достаточно хороший уровень концентрации. Это подходящее состояние для важной работы, учёбы и задач, где нужно внимание.'
        ),
        benefits: [
          tr('knowledgeModule.focus.ui.highBenefit1', 'Легче делать важные задачи'),
          tr('knowledgeModule.focus.ui.highBenefit2', 'Меньше хаоса в голове'),
          tr('knowledgeModule.focus.ui.highBenefit3', 'Выше продуктивность'),
        ],
      };
    }

    if (analysis.level === 'medium') {
      return {
        icon: '🟠',
        color: '#ffb347',
        title: tr('knowledgeModule.focus.ui.mediumTitle', 'Средний уровень фокуса'),
        desc: tr(
          'knowledgeModule.focus.ui.mediumDesc',
          'Фокус есть, но он нестабилен. Тебе могут мешать усталость, уведомления, переключения между делами или перегруз головы.'
        ),
        benefits: [
          tr('knowledgeModule.focus.ui.mediumBenefit1', 'Можно улучшить концентрацию через режим'),
          tr('knowledgeModule.focus.ui.mediumBenefit2', 'Помогают короткие блоки работы'),
          tr('knowledgeModule.focus.ui.mediumBenefit3', 'Меньше отвлечений — больше результата'),
        ],
      };
    }

    return {
      icon: '⚠️',
      color: '#ff7b7b',
      title: tr('knowledgeModule.focus.ui.lowTitle', 'Низкий уровень фокуса'),
      desc: tr(
        'knowledgeModule.focus.ui.lowDesc',
        'Сейчас у тебя низкая концентрация. Скорее всего, на это влияют ментальная усталость, экранная перегрузка, недосып или слишком частые переключения.'
      ),
      benefits: [
        tr('knowledgeModule.focus.ui.lowBenefit1', 'Фокус можно восстановить постепенно'),
        tr('knowledgeModule.focus.ui.lowBenefit2', 'Нужно уменьшить перегруз внимания'),
        tr('knowledgeModule.focus.ui.lowBenefit3', 'Небольшие действия уже помогают'),
      ],
    };
  }, [analysis, t]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  const levelText = () => {
    if (!analysis) return '';
    if (analysis.level === 'high') {
      return tr('knowledgeModule.focus.ui.levelHigh', 'Высокий уровень');
    }
    if (analysis.level === 'medium') {
      return tr('knowledgeModule.focus.ui.levelMedium', 'Средний уровень');
    }
    return tr('knowledgeModule.focus.ui.levelLow', 'Низкий уровень');
  };

  return (
    <div>
      <div style={styles.headerCard}>
        <div style={styles.iconBox}>🧠</div>
        <div>
          <h2 style={styles.title}>
            {tr('knowledgeModule.focus.title', 'Фокус и концентрация')}
          </h2>
          <p style={styles.text}>
            {tr(
              'knowledgeModule.focus.subtitle',
              'Сегодня человеку всё сложнее держать внимание на одном деле. Из-за постоянных уведомлений и перегруза мозг быстро устает.'
            )}
          </p>
        </div>
      </div>

      <div style={styles.switcher}>
        <button
          type="button"
          onClick={() => setActiveTab('check')}
          style={{
            ...styles.switchButton,
            ...(activeTab === 'check' ? styles.switchButtonActive : {}),
          }}
        >
          {tr('knowledgeModule.focus.ui.checkTab', 'Проверка')}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('exercises')}
          style={{
            ...styles.switchButton,
            ...(activeTab === 'exercises' ? styles.switchButtonActive : {}),
          }}
        >
          {tr('knowledgeModule.focus.ui.exerciseTab', 'Упражнения')}
        </button>
      </div>

      {activeTab === 'check' && (
        <>
          {mode === 'overview' && (
            <>
              <div style={styles.heroBlock}>
                <div style={styles.heroLeft}>
                  <div style={styles.overline}>
                    {tr('knowledgeModule.focus.ui.heroBadge', 'Focus Check')}
                  </div>

                  <h3 style={styles.heroTitle}>
                    {tr(
                      'knowledgeModule.focus.ui.heroTitle',
                      'Узнать, насколько сейчас силён твой фокус'
                    )}
                  </h3>

                  <p style={styles.heroText}>
                    {tr(
                      'knowledgeModule.focus.ui.heroText',
                      'Этот интерфейс помогает оценить концентрацию, уровень отвлечения и перегруз внимания. Пока это умная фронтенд-логика, а позже здесь будет работать наша собственная модель.'
                    )}
                  </p>

                  <div style={styles.heroButtons}>
                    <button style={styles.primaryButton} onClick={() => setMode('survey')}>
                      {tr('knowledgeModule.focus.ui.startButton', 'Проверить мой фокус')}
                    </button>

                    <button style={styles.secondaryButton} onClick={() => setMode('survey')}>
                      {tr('knowledgeModule.focus.ui.secondButton', 'Как улучшить концентрацию')}
                    </button>
                  </div>
                </div>

                <div style={styles.heroRight}>
                  <div style={styles.smallInfoCard}>
                    <div style={styles.smallInfoIcon}>📉</div>
                    <div>
                      <div style={styles.smallInfoTitle}>
                        {tr('knowledgeModule.focus.ui.lowMiniTitle', 'Низкий фокус')}
                      </div>
                      <div style={styles.smallInfoText}>
                        {tr(
                          'knowledgeModule.focus.ui.lowMiniText',
                          'Ментальная усталость, хаос в голове, постоянные отвлечения'
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={styles.smallInfoCard}>
                    <div style={styles.smallInfoIcon}>🟡</div>
                    <div>
                      <div style={styles.smallInfoTitle}>
                        {tr('knowledgeModule.focus.ui.mediumMiniTitle', 'Средний фокус')}
                      </div>
                      <div style={styles.smallInfoText}>
                        {tr(
                          'knowledgeModule.focus.ui.mediumMiniText',
                          'Концентрация есть, но быстро теряется из-за переключений'
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={styles.smallInfoCard}>
                    <div style={styles.smallInfoIcon}>🎯</div>
                    <div>
                      <div style={styles.smallInfoTitle}>
                        {tr('knowledgeModule.focus.ui.highMiniTitle', 'Хороший фокус')}
                      </div>
                      <div style={styles.smallInfoText}>
                        {tr(
                          'knowledgeModule.focus.ui.highMiniText',
                          'Подходящее состояние для учёбы, работы и задач на внимание'
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.grid}>
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>
                    {tr('knowledgeModule.focus.problemTitle', 'Почему это стало проблемой')}
                  </h3>
                  <p style={styles.text}>
                    {tr(
                      'knowledgeModule.focus.problemText',
                      'Современный ритм жизни перегружает внимание. Человек часто прыгает между задачами, экраном, сообщениями и делами, из-за чего становится труднее глубоко сосредоточиться.'
                    )}
                  </p>
                </div>

                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>
                    {tr('knowledgeModule.focus.ideaTitle', 'Главная идея')}
                  </h3>
                  <p style={styles.text}>
                    {tr(
                      'knowledgeModule.focus.ideaText',
                      'Фокус — это не врождённый талант, а навык, который можно постепенно укреплять через простые правила и более спокойную организацию дня.'
                    )}
                  </p>
                </div>
              </div>
            </>
          )}

          {mode === 'survey' && (
            <div style={styles.card}>
              <div style={styles.surveyHeader}>
                <div>
                  <h3 style={styles.cardTitle}>
                    {tr('knowledgeModule.focus.ui.surveyTitle', 'Проверка концентрации')}
                  </h3>
                  <p style={styles.text}>
                    {tr(
                      'knowledgeModule.focus.ui.surveyText',
                      'Ответь на несколько вопросов. Интерфейс покажет уровень твоего фокуса, риск отвлечения и что может помочь прямо сейчас.'
                    )}
                  </p>
                </div>
                <div style={styles.surveyHint}>
                  {tr('knowledgeModule.focus.ui.surveyHint', 'Оценка от 1 до 5')}
                </div>
              </div>

              <div style={styles.formGrid}>
                <SurveySlider
                  label={tr('knowledgeModule.focus.ui.sleepLabel', 'Сколько часов ты спал?')}
                  value={form.sleepHours}
                  min={0}
                  max={12}
                  leftText="0"
                  rightText="12"
                  onChange={(e) => handleChange('sleepHours', e.target.value)}
                />

                <SurveySlider
                  label={tr(
                    'knowledgeModule.focus.ui.distractionLabel',
                    'Насколько легко ты отвлекаешься?'
                  )}
                  value={form.distraction}
                  leftText={tr('knowledgeModule.focus.ui.low', 'Низко')}
                  rightText={tr('knowledgeModule.focus.ui.high', 'Высоко')}
                  onChange={(e) => handleChange('distraction', e.target.value)}
                />

                <SurveySlider
                  label={tr(
                    'knowledgeModule.focus.ui.screenLabel',
                    'Насколько голова перегружена экраном?'
                  )}
                  value={form.screenOverload}
                  leftText={tr('knowledgeModule.focus.ui.low', 'Низко')}
                  rightText={tr('knowledgeModule.focus.ui.high', 'Высоко')}
                  onChange={(e) => handleChange('screenOverload', e.target.value)}
                />

                <SurveySlider
                  label={tr(
                    'knowledgeModule.focus.ui.fatigueLabel',
                    'Насколько сильно устала голова?'
                  )}
                  value={form.mentalFatigue}
                  leftText={tr('knowledgeModule.focus.ui.low', 'Низко')}
                  rightText={tr('knowledgeModule.focus.ui.high', 'Высоко')}
                  onChange={(e) => handleChange('mentalFatigue', e.target.value)}
                />

                <SurveySlider
                  label={tr(
                    'knowledgeModule.focus.ui.switchLabel',
                    'Как часто переключаешься между делами?'
                  )}
                  value={form.taskSwitching}
                  leftText={tr('knowledgeModule.focus.ui.low', 'Редко')}
                  rightText={tr('knowledgeModule.focus.ui.high', 'Очень часто')}
                  onChange={(e) => handleChange('taskSwitching', e.target.value)}
                />

                <SurveySlider
                  label={tr(
                    'knowledgeModule.focus.ui.calmnessLabel',
                    'Насколько спокойно чувствует себя твой ум?'
                  )}
                  value={form.calmness}
                  leftText={tr('knowledgeModule.focus.ui.low', 'Низко')}
                  rightText={tr('knowledgeModule.focus.ui.high', 'Высоко')}
                  onChange={(e) => handleChange('calmness', e.target.value)}
                />

                <SurveySlider
                  label={tr('knowledgeModule.focus.ui.motivationLabel', 'Уровень мотивации')}
                  value={form.motivation}
                  leftText={tr('knowledgeModule.focus.ui.lowMotivation', 'Низкая')}
                  rightText={tr('knowledgeModule.focus.ui.highMotivation', 'Высокая')}
                  onChange={(e) => handleChange('motivation', e.target.value)}
                />
              </div>

              <div style={styles.buttonRow}>
                <button style={styles.primaryButton} onClick={() => setMode('result')}>
                  {tr('knowledgeModule.focus.ui.analyzeButton', 'Узнать результат')}
                </button>

                <button style={styles.secondaryButton} onClick={() => setMode('overview')}>
                  {tr('knowledgeModule.focus.ui.backButton', 'Назад')}
                </button>
              </div>
            </div>
          )}

          {mode === 'result' && analysis && resultData && (
            <div style={styles.resultCard}>
              <div
                style={{
                  ...styles.resultBadge,
                  background: `${resultData.color}18`,
                  borderColor: `${resultData.color}55`,
                  color: resultData.color,
                }}
              >
                <span style={{ fontSize: '24px' }}>{resultData.icon}</span>
                <span>{resultData.title}</span>
              </div>

              <p style={styles.resultDesc}>{resultData.desc}</p>

              <div style={styles.topSummaryBar}>
                <div style={styles.summaryItem}>
                  <div style={styles.summaryLabel}>
                    {tr('knowledgeModule.focus.ui.focusState', 'Состояние фокуса')}
                  </div>
                  <div style={styles.summaryValue}>{resultData.title}</div>
                </div>

                <div style={styles.summaryItem}>
                  <div style={styles.summaryLabel}>
                    {tr('knowledgeModule.focus.ui.focusLevel', 'Уровень')}
                  </div>
                  <div
                    style={{
                      ...styles.summaryValue,
                      color: getLevelColor(analysis.level),
                    }}
                  >
                    {levelText()}
                  </div>
                </div>
              </div>

              <div style={styles.gaugesGrid}>
                <CircleGauge
                  value={analysis.focusScore}
                  label={tr('knowledgeModule.focus.ui.focusScore', 'Focus Score')}
                  color={resultData.color}
                />
                <CircleGauge
                  value={analysis.distractionRisk}
                  label={tr('knowledgeModule.focus.ui.distractionRisk', 'Риск отвлечения')}
                  color="#ffb347"
                />
                <CircleGauge
                  value={analysis.overloadPercent}
                  label={tr('knowledgeModule.focus.ui.overloadScore', 'Перегруз внимания')}
                  color="#ff7b7b"
                />
              </div>

              <div style={styles.progressSection}>
                <ProgressStat
                  label={tr('knowledgeModule.focus.ui.focusScore', 'Focus Score')}
                  value={analysis.focusScore}
                  color={resultData.color}
                  subtitle={levelText()}
                />

                <ProgressStat
                  label={tr('knowledgeModule.focus.ui.distractionRisk', 'Риск отвлечения')}
                  value={analysis.distractionRisk}
                  color="#ffb347"
                  subtitle={tr(
                    'knowledgeModule.focus.ui.distractionSub',
                    'Показывает, насколько легко уходит внимание'
                  )}
                />

                <ProgressStat
                  label={tr('knowledgeModule.focus.ui.overloadScore', 'Перегруз внимания')}
                  value={analysis.overloadPercent}
                  color="#ff7b7b"
                  subtitle={tr(
                    'knowledgeModule.focus.ui.overloadSub',
                    'Показывает, насколько уставшим чувствует себя мозг'
                  )}
                />
              </div>

              <div style={styles.cardInner}>
                <h3 style={styles.cardTitle}>
                  {tr('knowledgeModule.focus.ui.nowTitle', 'Что делать прямо сейчас')}
                </h3>

                <div style={styles.actionGrid}>
                  {miniResets.map((item, index) => (
                    <div key={index} style={styles.actionCard}>
                      <div style={styles.actionNum}>{index + 1}</div>
                      <div style={styles.actionText}>{item}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.doubleGrid}>
                <div style={styles.cardInner}>
                  <h3 style={styles.cardTitle}>
                    {tr('knowledgeModule.focus.ui.foodTitle', 'Что может помочь фокусу')}
                  </h3>

                  <div style={styles.foodGrid}>
                    {focusFoods.map((item, index) => (
                      <div key={index} style={styles.foodCard}>
                        <div style={styles.foodIcon}>🍎</div>
                        <div style={styles.foodText}>{item}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.cardInner}>
                  <h3 style={styles.cardTitle}>
                    {tr('knowledgeModule.focus.ui.benefitTitle', 'Что даёт хороший фокус')}
                  </h3>

                  <div style={styles.benefitList}>
                    {resultData.benefits.map((item, index) => (
                      <div key={index} style={styles.benefitItem}>
                        <span style={styles.benefitDot}>✔</span>
                        <span style={styles.benefitText}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={styles.futureAiBlock}>
                <h3 style={styles.cardTitle}>
                  {tr('knowledgeModule.focus.ui.futureAiTitle', 'Что будет в будущем')}
                </h3>
                <p style={styles.text}>
                  {tr(
                    'knowledgeModule.focus.ui.futureAiText',
                    'Позже этот интерфейс будет работать через нашу собственную модель: она будет определять уровень концентрации, риск отвлечения, ментальную перегрузку и давать более персональные советы по еде, режиму и действиям.'
                  )}
                </p>

                <div style={styles.futureAiList}>
                  <div style={styles.futureAiItem}>• focus score</div>
                  <div style={styles.futureAiItem}>• distraction risk</div>
                  <div style={styles.futureAiItem}>• overload level</div>
                  <div style={styles.futureAiItem}>• food suggestions</div>
                </div>
              </div>

              <div style={styles.buttonRow}>
                <button style={styles.primaryButton} onClick={() => setMode('survey')}>
                  {tr('knowledgeModule.focus.ui.retakeButton', 'Пройти заново')}
                </button>

                <button style={styles.secondaryButton} onClick={() => setMode('overview')}>
                  {tr('knowledgeModule.focus.ui.toMainButton', 'К разделу фокуса')}
                </button>
              </div>
            </div>
          )}

          <RecommendedVideos topic="focus" />
        </>
      )}

      {activeTab === 'exercises' && (
        <>
          <div style={styles.exerciseHero}>
            <div style={styles.exerciseHeroLeft}>
              <div style={styles.overline}>
                {tr('knowledgeModule.focus.ui.exerciseBadge', 'Focus Exercises')}
              </div>
              <h3 style={styles.heroTitle}>
                {tr(
                  'knowledgeModule.focus.ui.exerciseHeroTitle',
                  'Упражнения для улучшения концентрации'
                )}
              </h3>
              <p style={styles.heroText}>
                {tr(
                  'knowledgeModule.focus.ui.exerciseHeroText',
                  'Здесь собраны короткие упражнения, которые помогают тренировать внимание, уменьшать шум в голове и лучше удерживать фокус.'
                )}
              </p>
            </div>

            <div style={styles.exerciseHeroStats}>
              <div style={styles.quickStat}>
                <div style={styles.quickStatNum}>5</div>
                <div style={styles.quickStatText}>
                  {tr('knowledgeModule.focus.ui.exerciseCount', 'упражнений')}
                </div>
              </div>
              <div style={styles.quickStat}>
                <div style={styles.quickStatNum}>5–15</div>
                <div style={styles.quickStatText}>
                  {tr('knowledgeModule.focus.ui.exerciseMinutes', 'минут в день')}
                </div>
              </div>
            </div>
          </div>

          <div style={styles.exerciseGrid}>
            {exercises.map((exercise) => {
              const active = selectedExercise === exercise.key;

              return (
                <button
                  key={exercise.key}
                  type="button"
                  onClick={() => setSelectedExercise(exercise.key)}
                  style={{
                    ...styles.exerciseCard,
                    borderColor: active ? exercise.color : 'rgba(255,255,255,0.08)',
                    boxShadow: active ? `0 10px 24px ${exercise.color}22` : 'none',
                    transform: active ? 'translateY(-2px)' : 'translateY(0)',
                  }}
                >
                  <div
                    style={{
                      ...styles.exerciseIcon,
                      background: `${exercise.color}18`,
                      color: exercise.color,
                    }}
                  >
                    {exercise.icon}
                  </div>
                  <div style={styles.exerciseDuration}>{exercise.duration}</div>
                  <h3 style={styles.exerciseTitle}>{exercise.title}</h3>
                  <p style={styles.exerciseDesc}>{exercise.desc}</p>
                </button>
              );
            })}
          </div>

          <div style={styles.exerciseDetails}>
            <div style={styles.card}>
              <div style={styles.exerciseDetailHeader}>
                <div
                  style={{
                    ...styles.bigExerciseIcon,
                    background: `${currentExercise.color}18`,
                    color: currentExercise.color,
                  }}
                >
                  {currentExercise.icon}
                </div>
                <div>
                  <div style={styles.currentExerciseTitle}>{currentExercise.title}</div>
                  <div style={styles.currentExerciseDuration}>{currentExercise.duration}</div>
                </div>
              </div>

              <div style={styles.infoBlock}>
                <div style={styles.infoLabel}>
                  {tr('knowledgeModule.focus.ui.exerciseWhy', 'Почему это полезно')}
                </div>
                <div style={styles.infoText}>{currentExercise.why}</div>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                {tr('knowledgeModule.focus.ui.exerciseBenefitsTitle', 'Что это может улучшить')}
              </h3>
              <div style={styles.benefitList}>
                {currentExercise.benefits.map((item, index) => (
                  <div key={index} style={styles.benefitItem}>
                    <span style={styles.benefitDot}>✔</span>
                    <span style={styles.benefitText}>{item}</span>
                  </div>
                ))}
              </div>

              <a
                href={currentExercise.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                style={styles.videoButton}
              >
                {tr('knowledgeModule.focus.ui.exerciseVideoButton', 'Посмотреть видео на YouTube')}
              </a>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              {tr('knowledgeModule.focus.ui.rescueTitle', 'Я вообще не могу собраться')}
            </h3>
            <div style={styles.actionGrid}>
              {[
                tr('knowledgeModule.focus.ui.rescue1', 'Убери телефон на 10 минут'),
                tr('knowledgeModule.focus.ui.rescue2', 'Выпей воды'),
                tr('knowledgeModule.focus.ui.rescue3', 'Сделай короткую разминку'),
                tr('knowledgeModule.focus.ui.rescue4', 'Сядь на 3 минуты спокойно'),
                tr('knowledgeModule.focus.ui.rescue5', 'Вернись только к одной задаче'),
              ].map((item, index) => (
                <div key={index} style={styles.actionCard}>
                  <div style={styles.actionNum}>{index + 1}</div>
                  <div style={styles.actionText}>{item}</div>
                </div>
              ))}
            </div>
          </div>

          <RecommendedVideos topic="focus" />
        </>
      )}
    </div>
  );
};

const styles = {
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
  iconBox: {
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
    borderRadius: '18px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    gap: '4px',
    marginBottom: '18px',
  },
  switchButton: {
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    padding: '12px 18px',
    borderRadius: '14px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  switchButtonActive: {
    background: 'linear-gradient(135deg, rgba(97,218,251,0.18) 0%, rgba(97,218,251,0.08) 100%)',
    color: 'var(--text-primary)',
    boxShadow: '0 6px 18px rgba(97,218,251,0.14)',
  },
  overline: {
    display: 'inline-flex',
    marginBottom: '10px',
    padding: '7px 12px',
    borderRadius: '999px',
    background: 'rgba(97,218,251,0.12)',
    border: '1px solid rgba(97,218,251,0.20)',
    color: '#61dafb',
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '0.04em',
  },
  heroBlock: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.9fr',
    gap: '16px',
    marginBottom: '16px',
  },
  heroLeft: {
    padding: '24px',
    borderRadius: '24px',
    background:
      'linear-gradient(135deg, rgba(97,218,251,0.12) 0%, rgba(139,123,255,0.10) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
  },
  heroRight: {
    display: 'grid',
    gap: '12px',
  },
  heroTitle: {
    margin: '0 0 12px 0',
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    lineHeight: 1.2,
  },
  heroText: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: '15px',
    lineHeight: 1.8,
  },
  heroButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '18px',
  },
  primaryButton: {
    padding: '12px 18px',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #61dafb 0%, #4a90e2 100%)',
    color: '#13202b',
    fontWeight: '800',
    cursor: 'pointer',
    fontSize: '14px',
    boxShadow: '0 8px 22px rgba(97,218,251,0.22)',
  },
  secondaryButton: {
    padding: '12px 18px',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.04)',
    color: 'var(--text-primary)',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px',
  },
  smallInfoCard: {
    padding: '16px',
    borderRadius: '20px',
    background: 'var(--card-bg, rgba(255,255,255,0.03))',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  smallInfoIcon: {
    fontSize: '24px',
    lineHeight: 1,
  },
  smallInfoTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '6px',
  },
  smallInfoText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },
  card: {
    padding: '22px',
    borderRadius: '24px',
    background: 'var(--card-bg, rgba(255,255,255,0.03))',
    border: '1px solid rgba(255,255,255,0.08)',
    marginBottom: '16px',
  },
  surveyHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '14px',
    marginBottom: '16px',
  },
  surveyHint: {
    padding: '8px 12px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'var(--text-secondary)',
    fontSize: '12px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
  },
  cardInner: {
    marginTop: '18px',
    padding: '18px',
    borderRadius: '20px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  cardTitle: {
    margin: '0 0 12px 0',
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  formGrid: {
    display: 'grid',
    gap: '14px',
    marginTop: '8px',
  },
  fieldCard: {
    padding: '14px',
    borderRadius: '18px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  fieldTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '12px',
  },
  label: {
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontWeight: '600',
    lineHeight: 1.45,
  },
  valueBadge: {
    minWidth: '34px',
    height: '34px',
    borderRadius: '10px',
    background: 'rgba(97,218,251,0.15)',
    color: '#61dafb',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '14px',
  },
  range: {
    width: '100%',
    accentColor: '#61dafb',
    cursor: 'pointer',
  },
  scaleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px',
  },
  scaleText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  buttonRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '18px',
  },
  resultCard: {
    padding: '22px',
    borderRadius: '24px',
    background: 'var(--card-bg, rgba(255,255,255,0.03))',
    border: '1px solid rgba(255,255,255,0.08)',
    marginBottom: '16px',
    boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
  },
  resultBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '16px',
    border: '1px solid',
    fontWeight: '800',
    fontSize: '18px',
    marginBottom: '14px',
  },
  resultDesc: {
    margin: 0,
    color: 'var(--text-secondary)',
    lineHeight: 1.8,
    fontSize: '15px',
  },
  topSummaryBar: {
    marginTop: '18px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '12px',
  },
  summaryItem: {
    padding: '16px',
    borderRadius: '18px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  summaryLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  summaryValue: {
    color: 'var(--text-primary)',
    fontSize: '18px',
    fontWeight: '800',
    lineHeight: 1.4,
  },
  gaugesGrid: {
    marginTop: '20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '18px',
    alignItems: 'stretch',
  },
  gaugeWrap: {
    padding: '18px',
    borderRadius: '22px',
    background: 'rgba(255,255,255,0.035)',
    border: '1px solid rgba(255,255,255,0.07)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeSvgBox: {
    position: 'relative',
    width: '104px',
    height: '104px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeCenter: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeValue: {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  gaugeLabel: {
    marginTop: '12px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: 1.5,
  },
  progressSection: {
    marginTop: '20px',
    display: 'grid',
    gap: '12px',
  },
  progressCard: {
    padding: '16px',
    borderRadius: '18px',
    background: 'rgba(255,255,255,0.035)',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  progressTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '12px',
  },
  progressLabel: {
    fontSize: '15px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  progressSub: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  progressValue: {
    fontSize: '20px',
    fontWeight: '800',
    whiteSpace: 'nowrap',
  },
  progressTrack: {
    width: '100%',
    height: '12px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 0.5s ease',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '12px',
  },
  actionCard: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    padding: '14px',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  actionNum: {
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
  actionText: {
    color: 'var(--text-primary)',
    lineHeight: 1.65,
    fontSize: '14px',
  },
  doubleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
  },
  foodGrid: {
    display: 'grid',
    gap: '10px',
  },
  foodCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '14px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  foodIcon: {
    fontSize: '20px',
  },
  foodText: {
    color: 'var(--text-primary)',
    fontSize: '14px',
    lineHeight: 1.55,
  },
  benefitList: {
    display: 'grid',
    gap: '10px',
  },
  benefitItem: {
    display: 'flex',
    gap: '10px',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  benefitDot: {
    color: '#61dafb',
    fontWeight: '800',
  },
  benefitText: {
    color: 'var(--text-primary)',
    fontSize: '14px',
    lineHeight: 1.6,
  },
  futureAiBlock: {
    marginTop: '18px',
    padding: '18px',
    borderRadius: '20px',
    background: 'rgba(97,218,251,0.06)',
    border: '1px dashed rgba(97,218,251,0.25)',
  },
  futureAiList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '8px',
    marginTop: '14px',
  },
  futureAiItem: {
    padding: '10px 12px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.04)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontWeight: '600',
  },

  exerciseHero: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.7fr',
    gap: '16px',
    marginBottom: '16px',
  },
  exerciseHeroLeft: {
    padding: '24px',
    borderRadius: '24px',
    background:
      'linear-gradient(135deg, rgba(97,218,251,0.12) 0%, rgba(53,208,127,0.10) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  exerciseHeroStats: {
    display: 'grid',
    gap: '12px',
  },
  quickStat: {
    padding: '20px',
    borderRadius: '22px',
    background: 'var(--card-bg, rgba(255,255,255,0.03))',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  quickStatNum: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '6px',
  },
  quickStatText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  exerciseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  exerciseCard: {
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
  exerciseIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    marginBottom: '12px',
  },
  exerciseDuration: {
    display: 'inline-flex',
    padding: '6px 10px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--text-secondary)',
    fontSize: '12px',
    fontWeight: '700',
    marginBottom: '12px',
  },
  exerciseTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: '800',
  },
  exerciseDesc: {
    margin: 0,
    color: 'var(--text-secondary)',
    lineHeight: 1.65,
    fontSize: '14px',
  },
  exerciseDetails: {
    display: 'grid',
    gap: '16px',
  },
  exerciseDetailHeader: {
    display: 'flex',
    gap: '14px',
    alignItems: 'center',
    marginBottom: '16px',
  },
  bigExerciseIcon: {
    width: '62px',
    height: '62px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '30px',
    flexShrink: 0,
  },
  currentExerciseTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '6px',
  },
  currentExerciseDuration: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
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
  videoButton: {
    marginTop: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 16px',
    borderRadius: '14px',
    textDecoration: 'none',
    background: 'linear-gradient(135deg, rgba(97,218,251,0.18) 0%, rgba(97,218,251,0.08) 100%)',
    border: '1px solid rgba(97,218,251,0.25)',
    color: '#61dafb',
    fontWeight: '800',
    fontSize: '14px',
  },
};

export default FocusPage;