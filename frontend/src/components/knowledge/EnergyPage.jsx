import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RecommendedVideos from './RecommendedVideos';

const DEFAULT_FORM = {
  sleepHours: 6,
  stress: 3,
  headLoad: 3,
  screenFatigue: 3,
  musclePain: 2,
  bodyHeavy: 2,
  motivation: 3,
};

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getSleepPenalty(hours) {
  if (hours >= 8) return 0;
  if (hours >= 7) return 8;
  if (hours >= 6) return 18;
  if (hours >= 5) return 28;
  return 40;
}

function getLevelByPercent(percent) {
  if (percent >= 75) return 'high';
  if (percent >= 45) return 'medium';
  return 'low';
}

function getLevelColor(level) {
  if (level === 'high') return '#ff7b7b';
  if (level === 'medium') return '#ffb347';
  return '#35d07f';
}

function analyzeEnergySurvey(form) {
  const sleepPenalty = getSleepPenalty(Number(form.sleepHours));

  const mentalRaw =
    Number(form.stress) * 14 +
    Number(form.headLoad) * 18 +
    Number(form.screenFatigue) * 12 +
    (6 - Number(form.motivation)) * 10 +
    sleepPenalty;

  const physicalRaw =
    Number(form.musclePain) * 18 +
    Number(form.bodyHeavy) * 16 +
    (6 - Number(form.motivation)) * 8 +
    sleepPenalty * 0.8;

  const mentalPercent = clampPercent(mentalRaw / 1.6);
  const physicalPercent = clampPercent(physicalRaw / 1.45);
  const overallPercent = clampPercent((mentalPercent + physicalPercent) / 2);

  const diff = Math.abs(mentalPercent - physicalPercent);

  let type = 'balanced';

  if (overallPercent >= 38) {
    if (diff <= 12) {
      type = 'mixed';
    } else if (mentalPercent > physicalPercent) {
      type = 'mental';
    } else {
      type = 'physical';
    }
  }

  return {
    type,
    mentalPercent,
    physicalPercent,
    overallPercent,
    mentalLevel: getLevelByPercent(mentalPercent),
    physicalLevel: getLevelByPercent(physicalPercent),
    overallLevel: getLevelByPercent(overallPercent),
  };
}

function CircleGauge({ value, label, color }) {
  const radius = 50;
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

function SurveySlider({ label, value, min = 1, max = 5, leftText, rightText, onChange }) {
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

const EnergyPage = () => {
  const { t } = useTranslation();

  const tr = (key, fallback, options = {}) => {
    const value = t(key, options);
    return value === key ? fallback : value;
  };

  const [mode, setMode] = useState('overview'); // overview | survey | result
  const [form, setForm] = useState(DEFAULT_FORM);

  const analysis = useMemo(() => {
    if (mode !== 'result') return null;
    return analyzeEnergySurvey(form);
  }, [form, mode]);

  const resultData = useMemo(() => {
    if (!analysis) return null;

    if (analysis.type === 'mental') {
      return {
        icon: '🧠',
        color: '#8b7bff',
        title: tr('knowledgeModule.energy.result.mentalTitle', 'Ментальная усталость'),
        desc: tr(
          'knowledgeModule.energy.result.mentalDesc',
          'Скорее всего, у тебя сейчас сильнее перегружена голова: стресс, информационный шум, экранная усталость и снижение концентрации.'
        ),
        actions: [
          tr('knowledgeModule.energy.result.mentalAction1', 'Убрать экран на 20–30 минут'),
          tr('knowledgeModule.energy.result.mentalAction2', 'Пройтись 10–15 минут без телефона'),
          tr('knowledgeModule.energy.result.mentalAction3', 'Сделать только 1 простую задачу вместо перегруза'),
          tr('knowledgeModule.energy.result.mentalAction4', 'Выпить воды и немного переключиться'),
          tr('knowledgeModule.energy.result.mentalAction5', 'Не требовать от себя максимума сегодня'),
        ],
      };
    }

    if (analysis.type === 'physical') {
      return {
        icon: '💪',
        color: '#ff7b7b',
        title: tr('knowledgeModule.energy.result.physicalTitle', 'Физическая усталость'),
        desc: tr(
          'knowledgeModule.energy.result.physicalDesc',
          'Похоже, телу сейчас тяжелее, чем голове. Вероятно, организму нужно восстановление, а не дополнительная нагрузка.'
        ),
        actions: [
          tr('knowledgeModule.energy.result.physicalAction1', 'Снизить нагрузку на сегодня'),
          tr('knowledgeModule.energy.result.physicalAction2', 'Сделать лёгкую растяжку или спокойную ходьбу'),
          tr('knowledgeModule.energy.result.physicalAction3', 'Нормально поесть и выпить воды'),
          tr('knowledgeModule.energy.result.physicalAction4', 'Не нагружать сильно уставшие мышцы'),
          tr('knowledgeModule.energy.result.physicalAction5', 'Лечь спать раньше'),
        ],
      };
    }

    if (analysis.type === 'mixed') {
      return {
        icon: '🟠',
        color: '#ffb347',
        title: tr('knowledgeModule.energy.result.mixedTitle', 'Смешанная усталость'),
        desc: tr(
          'knowledgeModule.energy.result.mixedDesc',
          'Есть признаки и ментальной, и физической перегрузки. Сегодня лучше убрать лишнее давление и сделать упор на восстановление.'
        ),
        actions: [
          tr('knowledgeModule.energy.result.mixedAction1', 'Уменьшить и умственную, и физическую нагрузку'),
          tr('knowledgeModule.energy.result.mixedAction2', 'Сделать спокойную прогулку'),
          tr('knowledgeModule.energy.result.mixedAction3', 'Пить воду и нормально поесть'),
          tr('knowledgeModule.energy.result.mixedAction4', 'Не форсировать тренировку через силу'),
          tr('knowledgeModule.energy.result.mixedAction5', 'Сделать ранний сон или короткий отдых'),
        ],
      };
    }

    return {
      icon: '✅',
      color: '#35d07f',
      title: tr('knowledgeModule.energy.result.balancedTitle', 'Состояние близко к норме'),
      desc: tr(
        'knowledgeModule.energy.result.balancedDesc',
        'Сильных признаков перегрузки сейчас нет. Можно сохранять спокойный режим и не перегибать с нагрузкой.'
      ),
      actions: [
        tr('knowledgeModule.energy.result.balancedAction1', 'Подойдёт лёгкая или средняя активность'),
        tr('knowledgeModule.energy.result.balancedAction2', 'Сохраняй режим воды и сна'),
        tr('knowledgeModule.energy.result.balancedAction3', 'Не перегружай день лишними задачами'),
        tr('knowledgeModule.energy.result.balancedAction4', 'Сделай одну полезную привычку сегодня'),
        tr('knowledgeModule.energy.result.balancedAction5', 'Держи стабильный ритм без перегибов'),
      ],
    };
  }, [analysis, t]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  const fatigueTypeLabel = () => {
    if (!analysis) return '';
    if (analysis.type === 'mental') {
      return tr('knowledgeModule.energy.result.mentalTitle', 'Ментальная усталость');
    }
    if (analysis.type === 'physical') {
      return tr('knowledgeModule.energy.result.physicalTitle', 'Физическая усталость');
    }
    if (analysis.type === 'mixed') {
      return tr('knowledgeModule.energy.result.mixedTitle', 'Смешанная усталость');
    }
    return tr('knowledgeModule.energy.result.balancedTitle', 'Состояние близко к норме');
  };

  const overallLevelText = () => {
    if (!analysis) return '';
    if (analysis.overallLevel === 'high') {
      return tr('knowledgeModule.energy.ui.levelHigh', 'Высокий уровень усталости');
    }
    if (analysis.overallLevel === 'medium') {
      return tr('knowledgeModule.energy.ui.levelMedium', 'Средний уровень усталости');
    }
    return tr('knowledgeModule.energy.ui.levelLow', 'Низкий уровень усталости');
  };

  return (
    <div>
      <div style={styles.headerCard}>
        <div style={styles.iconBox}>⚡</div>
        <div>
          <h2 style={styles.title}>
            {tr('knowledgeModule.energy.title', 'Энергия и состояние')}
          </h2>
          <p style={styles.text}>
            {tr(
              'knowledgeModule.energy.subtitle',
              'Не всегда проблема в лени. Иногда человеку просто не хватает восстановления, сна, воды, движения или спокойствия.'
            )}
          </p>
        </div>
      </div>

      {mode === 'overview' && (
        <>
          <div style={styles.heroBlock}>
            <div style={styles.heroLeft}>
              <div style={styles.overline}>
                {tr('knowledgeModule.energy.ui.heroBadge', 'Energy Check')}
              </div>

              <h3 style={styles.heroTitle}>
                {tr('knowledgeModule.energy.ui.heroTitle', 'Понять, почему у тебя нет сил')}
              </h3>

              <p style={styles.heroText}>
                {tr(
                  'knowledgeModule.energy.ui.heroText',
                  'Этот интерфейс помогает определить, какая у тебя усталость сейчас: ментальная, физическая или смешанная. Пока это умная локальная логика, а позже здесь будет работать наша собственная AI-модель.'
                )}
              </p>

              <div style={styles.heroButtons}>
                <button style={styles.primaryButton} onClick={() => setMode('survey')}>
                  {tr('knowledgeModule.energy.ui.startButton', 'Я чувствую себя усталым')}
                </button>

                <button style={styles.secondaryButton} onClick={() => setMode('survey')}>
                  {tr('knowledgeModule.energy.ui.checkButton', 'Проверить состояние')}
                </button>
              </div>
            </div>

            <div style={styles.heroRight}>
              <div style={styles.smallInfoCard}>
                <div style={styles.smallInfoIcon}>🧠</div>
                <div>
                  <div style={styles.smallInfoTitle}>
                    {tr('knowledgeModule.energy.ui.mentalMiniTitle', 'Ментальная усталость')}
                  </div>
                  <div style={styles.smallInfoText}>
                    {tr(
                      'knowledgeModule.energy.ui.mentalMiniText',
                      'Стресс, экран, перегрузка, трудности с концентрацией'
                    )}
                  </div>
                </div>
              </div>

              <div style={styles.smallInfoCard}>
                <div style={styles.smallInfoIcon}>💪</div>
                <div>
                  <div style={styles.smallInfoTitle}>
                    {tr('knowledgeModule.energy.ui.physicalMiniTitle', 'Физическая усталость')}
                  </div>
                  <div style={styles.smallInfoText}>
                    {tr(
                      'knowledgeModule.energy.ui.physicalMiniText',
                      'Забитость мышц, тяжесть в теле, нехватка восстановления'
                    )}
                  </div>
                </div>
              </div>

              <div style={styles.smallInfoCard}>
                <div style={styles.smallInfoIcon}>🟠</div>
                <div>
                  <div style={styles.smallInfoTitle}>
                    {tr('knowledgeModule.energy.ui.mixedMiniTitle', 'Смешанное состояние')}
                  </div>
                  <div style={styles.smallInfoText}>
                    {tr(
                      'knowledgeModule.energy.ui.mixedMiniText',
                      'Когда устали и тело, и голова одновременно'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.grid}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                {tr('knowledgeModule.energy.typesTitle', 'Какая бывает усталость')}
              </h3>
              <p style={styles.text}>
                {tr(
                  'knowledgeModule.energy.typesText',
                  'Усталость может быть физической, ментальной или смешанной. Если это понимать, советы становятся намного точнее.'
                )}
              </p>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                {tr('knowledgeModule.energy.mainAdviceTitle', 'Главный принцип')}
              </h3>
              <p style={styles.text}>
                {tr(
                  'knowledgeModule.energy.mainAdviceText',
                  'Сначала пойми свое состояние, а потом выбирай действие. Не всегда лучший выбор — заставлять себя делать больше.'
                )}
              </p>
            </div>
          </div>

          <RecommendedVideos topic="energy" />
        </>
      )}

      {mode === 'survey' && (
        <div style={styles.card}>
          <div style={styles.surveyHeader}>
            <div>
              <h3 style={styles.cardTitle}>
                {tr('knowledgeModule.energy.ui.surveyTitle', 'Мини-опрос состояния')}
              </h3>
              <p style={styles.text}>
                {tr(
                  'knowledgeModule.energy.ui.surveyText',
                  'Ответь на несколько вопросов. Интерфейс покажет, какой тип усталости у тебя сейчас и что лучше сделать.'
                )}
              </p>
            </div>
            <div style={styles.surveyHint}>
              {tr('knowledgeModule.energy.ui.surveyHint', 'Оценка от 1 до 5')}
            </div>
          </div>

          <div style={styles.formGrid}>
            <SurveySlider
              label={tr('knowledgeModule.energy.ui.sleepLabel', 'Сколько часов ты спал?')}
              value={form.sleepHours}
              min={0}
              max={12}
              leftText="0"
              rightText="12"
              onChange={(e) => handleChange('sleepHours', e.target.value)}
            />

            <SurveySlider
              label={tr('knowledgeModule.energy.ui.stressLabel', 'Уровень стресса')}
              value={form.stress}
              leftText={tr('knowledgeModule.energy.ui.low', 'Низко')}
              rightText={tr('knowledgeModule.energy.ui.high', 'Высоко')}
              onChange={(e) => handleChange('stress', e.target.value)}
            />

            <SurveySlider
              label={tr('knowledgeModule.energy.ui.headLoadLabel', 'Насколько голова перегружена?')}
              value={form.headLoad}
              leftText={tr('knowledgeModule.energy.ui.low', 'Низко')}
              rightText={tr('knowledgeModule.energy.ui.high', 'Высоко')}
              onChange={(e) => handleChange('headLoad', e.target.value)}
            />

            <SurveySlider
              label={tr('knowledgeModule.energy.ui.screenLabel', 'Насколько устал от экрана?')}
              value={form.screenFatigue}
              leftText={tr('knowledgeModule.energy.ui.low', 'Низко')}
              rightText={tr('knowledgeModule.energy.ui.high', 'Высоко')}
              onChange={(e) => handleChange('screenFatigue', e.target.value)}
            />

            <SurveySlider
              label={tr('knowledgeModule.energy.ui.muscleLabel', 'Есть ли забитость / боль в мышцах?')}
              value={form.musclePain}
              leftText={tr('knowledgeModule.energy.ui.low', 'Низко')}
              rightText={tr('knowledgeModule.energy.ui.high', 'Высоко')}
              onChange={(e) => handleChange('musclePain', e.target.value)}
            />

            <SurveySlider
              label={tr('knowledgeModule.energy.ui.bodyLabel', 'Насколько тело чувствуется тяжёлым?')}
              value={form.bodyHeavy}
              leftText={tr('knowledgeModule.energy.ui.low', 'Низко')}
              rightText={tr('knowledgeModule.energy.ui.high', 'Высоко')}
              onChange={(e) => handleChange('bodyHeavy', e.target.value)}
            />

            <SurveySlider
              label={tr('knowledgeModule.energy.ui.motivationLabel', 'Уровень мотивации')}
              value={form.motivation}
              leftText={tr('knowledgeModule.energy.ui.lowMotivation', 'Низкая')}
              rightText={tr('knowledgeModule.energy.ui.highMotivation', 'Высокая')}
              onChange={(e) => handleChange('motivation', e.target.value)}
            />
          </div>

          <div style={styles.buttonRow}>
            <button style={styles.primaryButton} onClick={() => setMode('result')}>
              {tr('knowledgeModule.energy.ui.analyzeButton', 'Узнать результат')}
            </button>

            <button style={styles.secondaryButton} onClick={() => setMode('overview')}>
              {tr('knowledgeModule.energy.ui.backButton', 'Назад')}
            </button>
          </div>
        </div>
      )}

      {mode === 'result' && analysis && resultData && (
        <>
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
                  {tr('knowledgeModule.energy.ui.detectedType', 'Определённый тип')}
                </div>
                <div style={styles.summaryValue}>{fatigueTypeLabel()}</div>
              </div>

              <div style={styles.summaryItem}>
                <div style={styles.summaryLabel}>
                  {tr('knowledgeModule.energy.ui.overallState', 'Общее состояние')}
                </div>
                <div
                  style={{
                    ...styles.summaryValue,
                    color: getLevelColor(analysis.overallLevel),
                  }}
                >
                  {overallLevelText()}
                </div>
              </div>
            </div>

            <div style={styles.gaugesGrid}>
              <CircleGauge
                value={analysis.mentalPercent}
                label={tr('knowledgeModule.energy.ui.mentalPercent', 'Ментальная усталость')}
                color="#8b7bff"
              />
              <CircleGauge
                value={analysis.physicalPercent}
                label={tr('knowledgeModule.energy.ui.physicalPercent', 'Физическая усталость')}
                color="#ff7b7b"
              />
              <CircleGauge
                value={analysis.overallPercent}
                label={tr('knowledgeModule.energy.ui.overallPercent', 'Общий уровень усталости')}
                color={resultData.color}
              />
            </div>

            <div style={styles.progressSection}>
              <ProgressStat
                label={tr('knowledgeModule.energy.ui.mentalPercent', 'Ментальная усталость')}
                value={analysis.mentalPercent}
                color="#8b7bff"
                subtitle={
                  analysis.mentalLevel === 'high'
                    ? tr('knowledgeModule.energy.ui.levelHigh', 'Высокий уровень')
                    : analysis.mentalLevel === 'medium'
                    ? tr('knowledgeModule.energy.ui.levelMedium', 'Средний уровень')
                    : tr('knowledgeModule.energy.ui.levelLow', 'Низкий уровень')
                }
              />

              <ProgressStat
                label={tr('knowledgeModule.energy.ui.physicalPercent', 'Физическая усталость')}
                value={analysis.physicalPercent}
                color="#ff7b7b"
                subtitle={
                  analysis.physicalLevel === 'high'
                    ? tr('knowledgeModule.energy.ui.levelHigh', 'Высокий уровень')
                    : analysis.physicalLevel === 'medium'
                    ? tr('knowledgeModule.energy.ui.levelMedium', 'Средний уровень')
                    : tr('knowledgeModule.energy.ui.levelLow', 'Низкий уровень')
                }
              />

              <ProgressStat
                label={tr('knowledgeModule.energy.ui.overallPercent', 'Общий уровень усталости')}
                value={analysis.overallPercent}
                color={resultData.color}
                subtitle={overallLevelText()}
              />
            </div>

            <div style={styles.cardInner}>
              <h3 style={styles.cardTitle}>
                {tr('knowledgeModule.energy.ui.whatNowTitle', 'Что лучше сделать сейчас')}
              </h3>

              <div style={styles.actionGrid}>
                {resultData.actions.map((item, index) => (
                  <div key={index} style={styles.actionCard}>
                    <div style={styles.actionNum}>{index + 1}</div>
                    <div style={styles.actionText}>{item}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.futureAiBlock}>
              <h3 style={styles.cardTitle}>
                {tr('knowledgeModule.energy.ui.futureAiTitle', 'Что будет в будущем')}
              </h3>
              <p style={styles.text}>
                {tr(
                  'knowledgeModule.energy.ui.futureAiText',
                  'Позже этот интерфейс будет работать через нашу собственную модель: она будет определять тип усталости, процент уверенности, уровень перегрузки и давать более точные персональные советы.'
                )}
              </p>

              <div style={styles.futureAiList}>
                <div style={styles.futureAiItem}>• confidence score</div>
                <div style={styles.futureAiItem}>• fatigue type</div>
                <div style={styles.futureAiItem}>• overload level</div>
                <div style={styles.futureAiItem}>• personal recovery advice</div>
              </div>
            </div>

            <div style={styles.buttonRow}>
              <button style={styles.primaryButton} onClick={() => setMode('survey')}>
                {tr('knowledgeModule.energy.ui.retakeButton', 'Пройти опрос заново')}
              </button>

              <button style={styles.secondaryButton} onClick={() => setMode('overview')}>
                {tr('knowledgeModule.energy.ui.toMainButton', 'К разделу энергии')}
              </button>
            </div>
          </div>

          <RecommendedVideos topic="energy" />
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
    width: '100px',
    height: '100px',
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
};

export default EnergyPage;