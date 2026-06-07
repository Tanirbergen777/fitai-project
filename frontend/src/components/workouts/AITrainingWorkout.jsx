import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import WorkoutEngine from './WorkoutEngine';
import { supabase } from '../../lib/supabaseClient';
import { API_BASE_URL } from '../../config/api';

const getVideoUrl = (path) =>
  supabase.storage.from('exercise-videos').getPublicUrl(path).data.publicUrl;



const exerciseSeconds = (exercise) => {
  return (exercise.prepSeconds ?? 3) + (exercise.workSeconds ?? 30) + (exercise.restSeconds ?? 10);
};

const totalPlanSeconds = (exercises) => {
  return exercises.reduce((sum, exercise) => sum + exerciseSeconds(exercise), 0);
};

const formatMinutes = (seconds) => {
  return Math.ceil(seconds / 60);
};

const safeJsonParse = (value) => {
  try {
    if (!value) return null;
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const calculateAgeFromUser = (userData) => {
  if (!userData) return null;

  if (userData.age) {
    const age = Number(userData.age);
    return Number.isFinite(age) ? age : null;
  }

  if (userData.birth_date) {
    const birth = new Date(userData.birth_date);
    if (Number.isNaN(birth.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age -= 1;
    }

    return age > 0 ? age : null;
  }

  if (userData.birth_year) {
    const birthYear = Number(userData.birth_year);
    if (!Number.isFinite(birthYear)) return null;
    return new Date().getFullYear() - birthYear;
  }

  return null;
};

const getUserProfilePayload = () => {
  const userData =
    safeJsonParse(localStorage.getItem('userData')) ||
    safeJsonParse(localStorage.getItem('fitai_user')) ||
    {};

  const age = calculateAgeFromUser(userData);

  const height = Number(userData.height || userData.height_cm || 170);
  const weight = Number(userData.weight || userData.weight_kg || 70);

  const bmi =
    Number(userData.bmi) ||
    (height > 0 ? Number((weight / ((height / 100) * (height / 100))).toFixed(2)) : 24);

  return {
    age: Number.isFinite(age) ? age : 25,
    gender: userData.gender || 'unknown',
    height: Number.isFinite(height) ? height : 170,
    weight: Number.isFinite(weight) ? weight : 70,
    bmi: Number.isFinite(bmi) ? bmi : 24,
    goal: userData.goal || 'keep_fit',
    waist: Number(userData.waist || 0),
    hip: Number(userData.hip || 0),
    arm: Number(userData.arm || 0),
  };
};

const AITrainingWorkout = ({ onAllStepsComplete, onBack }) => {
  const { t } = useTranslation();

  const [step, setStep] = useState('survey');
  const [survey, setSurvey] = useState({
    duration: 15,
    focus: 'full',
    limitation: 'none',
    intensity: 'normal',
  });

  const [plan, setPlan] = useState(null);
  const [mlResult, setMlResult] = useState(null);
  const [mlError, setMlError] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [isAiAnalyzingIntensity, setIsAiAnalyzingIntensity] = useState(false);
  const [aiIntensitySuggestion, setAiIntensitySuggestion] = useState(null);

  const fetchAiIntensityRecommendation = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setSurvey((prev) => ({ ...prev, intensity: 'normal' }));
      return;
    }
    setIsAiAnalyzingIntensity(true);
    setAiIntensitySuggestion(null);
    try {
      const res = await fetch(`${API_BASE_URL}/training-ai/recommend-intensity/${userId}`);
      if (!res.ok) throw new Error('AI серверінен қате келді');
      const data = await res.json();
      setAiIntensitySuggestion(data);
    } catch (e) {
      console.error(e);
      alert('AI серверіне қосылу мүмкін болмады. Орташа қарқын таңдалды.');
      setSurvey((prev) => ({ ...prev, intensity: 'normal' }));
    } finally {
      setIsAiAnalyzingIntensity(false);
    }
  };

  const updateSurvey = (field, value) => {
    if (field === 'intensity' && value === 'ai_auto') {
      fetchAiIntensityRecommendation();
      setSurvey((prev) => ({ ...prev, intensity: 'ai_auto' }));
      return;
    }
    setSurvey((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const acceptAiIntensity = () => {
    if (aiIntensitySuggestion) {
      setSurvey((prev) => ({ ...prev, intensity: aiIntensitySuggestion.recommended_intensity }));
    }
    setAiIntensitySuggestion(null);
  };

  const declineAiIntensity = () => {
    setSurvey((prev) => ({ ...prev, intensity: 'normal' }));
    setAiIntensitySuggestion(null);
  };

  const exercisePool = useMemo(() => {
    return [
      {
        key: 'warmup_arm_circles',
        name: t('training.general.full.armCircles.title', 'Қолды айналдыру'),
        description: t('training.general.full.armCircles.desc', 'Иық пен қолды қыздыру.'),
        reps: `30 ${t('training.seconds', 'сек')}`,
        workSeconds: 30,
        prepSeconds: 3,
        restSeconds: 8,
        mediaUrl: getVideoUrl('fullbody/krug-rukami.mp4'),
        focus: ['full', 'arms'],
        goals: ['keep_fit', 'lose_weight', 'gain_mass'],
        level: 'beginner',
        impact: 'low',
      },
      {
        key: 'torso_rotation',
        name: t('training.general.full.torsoRotation.title', 'Корпусты айналдыру'),
        description: t('training.general.full.torsoRotation.desc', 'Бел мен core бұлшықеттерін қыздыру.'),
        reps: `30 ${t('training.seconds', 'сек')}`,
        workSeconds: 30,
        prepSeconds: 3,
        restSeconds: 8,
        mediaUrl: getVideoUrl('fullbody/vrashchenie-korpusom.mp4'),
        focus: ['full', 'abs'],
        goals: ['keep_fit', 'lose_weight', 'gain_mass'],
        level: 'beginner',
        impact: 'low',
      },
      {
        key: 'jumping_jacks',
        name: t('training.general.full.jumpingJacks.title', 'Jumping Jacks'),
        description: t('training.general.full.jumpingJacks.desc', 'Кардио және бүкіл денеге арналған қозғалыс.'),
        reps: '20 reps',
        workSeconds: 40,
        prepSeconds: 3,
        restSeconds: 12,
        mediaUrl: getVideoUrl('fullbody/pryzhki-jumping-jacks.mp4'),
        focus: ['full', 'cardio', 'legs'],
        goals: ['lose_weight', 'keep_fit'],
        level: 'beginner',
        impact: 'normal',
        cameraMode: 'jumping_jacks',
      },
      {
        key: 'high_knees',
        name: t('training.lose.full.highKnees.title', 'Тізені жоғары көтеріп жүгіру'),
        description: t('training.lose.full.highKnees.desc', 'Қарқынды кардио жаттығу.'),
        reps: `30 ${t('training.seconds', 'сек')}`,
        workSeconds: 30,
        prepSeconds: 3,
        restSeconds: 12,
        mediaUrl: getVideoUrl('fullbody/beg-koleni-vverh.mp4'),
        focus: ['cardio', 'legs', 'full'],
        goals: ['lose_weight'],
        level: 'intermediate',
        impact: 'normal',
        cameraMode: 'high_knees',
      },
      {
        key: 'squat_leg_raise',
        name: t('training.general.full.squatLegRaise.title', 'Приседание'),
        description: t('training.general.full.squatLegRaise.desc', 'Аяқ пен жамбасқа арналған негізгі жаттығу.'),
        reps: '10 reps',
        workSeconds: 45,
        prepSeconds: 3,
        restSeconds: 12,
        mediaUrl: getVideoUrl('fullbody/prisedanie-podem-nog.mp4'),
        focus: ['legs', 'full'],
        goals: ['gain_mass', 'keep_fit', 'lose_weight'],
        level: 'beginner',
        impact: 'normal',
        cameraMode: 'squat',
      },
      {
        key: 'lunge_twist',
        name: t('training.lose.full.lungeTwist.title', 'Выпад бұрылумен'),
        description: t('training.lose.full.lungeTwist.desc', 'Аяқ, жамбас және core үшін.'),
        reps: '10 reps',
        workSeconds: 40,
        prepSeconds: 3,
        restSeconds: 12,
        mediaUrl: getVideoUrl('fullbody/vypad-so-skruchivaniem.mp4'),
        focus: ['legs', 'full', 'abs'],
        goals: ['gain_mass', 'keep_fit', 'lose_weight'],
        level: 'intermediate',
        impact: 'normal',
        cameraMode: 'lunge',
      },
      {
        key: 'pushups',
        name: t('training.general.chest.pushUps.title', 'Отжимание'),
        description: t('training.general.chest.pushUps.desc', 'Кеуде, иық және қолға арналған жаттығу.'),
        reps: '8 reps',
        workSeconds: 40,
        prepSeconds: 3,
        restSeconds: 12,
        mediaUrl: getVideoUrl('chest/otzhimaniya-ot-pola.mp4'),
        focus: ['chest', 'arms', 'full'],
        goals: ['gain_mass', 'keep_fit'],
        level: 'intermediate',
        impact: 'normal',
        cameraMode: 'pushup',
      },
      {
        key: 'knee_pushups',
        name: t('training.chest.kneePushUps.title', 'Тіземен отжимание'),
        description: t('training.chest.kneePushUps.desc', 'Жеңілдетілген отжимание нұсқасы.'),
        reps: '8 reps',
        workSeconds: 35,
        prepSeconds: 3,
        restSeconds: 12,
        mediaUrl: getVideoUrl('chest/otzhimanie-koleni.mp4'),
        focus: ['chest', 'arms', 'full'],
        goals: ['gain_mass', 'keep_fit'],
        level: 'beginner',
        impact: 'low',
        cameraMode: 'pushup',
      },
      {
        key: 'plank',
        name: t('training.lose.abs.plankClassic.title', 'Планка'),
        description: t('training.lose.abs.plankClassic.desc', 'Core және дене тұрақтылығын дамыту.'),
        reps: `30 ${t('training.seconds', 'сек')}`,
        workSeconds: 30,
        prepSeconds: 3,
        restSeconds: 10,
        mediaUrl: getVideoUrl('fullbody/pryzhki-v-planke.mp4'),
        focus: ['abs', 'full'],
        goals: ['keep_fit', 'lose_weight', 'gain_mass'],
        level: 'beginner',
        impact: 'low',
        cameraMode: 'plank',
      },
      {
        key: 'bicycle',
        name: t('training.general.full.bicycle.title', 'Велосипед'),
        description: t('training.general.full.bicycle.desc', 'Іш бұлшықеттері мен obliques үшін.'),
        reps: '16 reps',
        workSeconds: 35,
        prepSeconds: 3,
        restSeconds: 10,
        mediaUrl: getVideoUrl('fullbody/velosiped.mp4'),
        focus: ['abs', 'full'],
        goals: ['lose_weight', 'keep_fit'],
        level: 'beginner',
        impact: 'low',
        cameraMode: 'crunch',
      },
      {
        key: 'reverse_crunch',
        name: t('training.lose.full.reverseCrunch.title', 'Reverse Crunch'),
        description: t('training.lose.full.reverseCrunch.desc', 'Төменгі пресс үшін.'),
        reps: '12 reps',
        workSeconds: 35,
        prepSeconds: 3,
        restSeconds: 10,
        mediaUrl: getVideoUrl('fullbody/obratnye-skruchivaniya.mp4'),
        focus: ['abs'],
        goals: ['lose_weight', 'keep_fit'],
        level: 'beginner',
        impact: 'low',
        cameraMode: 'crunch',
      },
      {
        key: 'chair_dips',
        name: t('training.chest.chairDips.title', 'Орындықпен кері отжимание'),
        description: t('training.chest.chairDips.desc', 'Трицепс пен кеудені дамыту.'),
        reps: '10 reps',
        workSeconds: 35,
        prepSeconds: 3,
        restSeconds: 12,
        mediaUrl: getVideoUrl('chest/obratnye-otzhimaniya-stul.mp4'),
        focus: ['arms', 'chest'],
        goals: ['gain_mass', 'keep_fit'],
        level: 'beginner',
        impact: 'low',
      },
      {
        key: 'cobra_stretch',
        name: t('training.lose.full.cobraStretch.title', 'Кобра созылуы'),
        description: t('training.lose.full.cobraStretch.desc', 'Арқа және іш бұлшықеттерін созу.'),
        reps: `30 ${t('training.seconds', 'сек')}`,
        workSeconds: 30,
        prepSeconds: 3,
        restSeconds: 8,
        mediaUrl: getVideoUrl('fullbody/rastyazhka-kobra.mp4'),
        focus: ['full', 'abs'],
        goals: ['keep_fit', 'lose_weight', 'gain_mass'],
        level: 'beginner',
        impact: 'low',
      },
      {
        key: 'child_pose',
        name: t('training.general.full.childPose.title', 'Бала позасы'),
        description: t('training.general.full.childPose.desc', 'Жаттығудан кейін қалпына келу.'),
        reps: `30 ${t('training.seconds', 'сек')}`,
        workSeconds: 30,
        prepSeconds: 3,
        restSeconds: 8,
        mediaUrl: getVideoUrl('fullbody/poza-rebenka.mp4'),
        focus: ['full'],
        goals: ['keep_fit', 'lose_weight', 'gain_mass'],
        level: 'beginner',
        impact: 'low',
      },
    ];
  }, [t]);



  const buildReason = (seconds, backendMlResult) => {
    const minutes = formatMinutes(seconds);

    if (backendMlResult?.plan_template_id) {
      return t(
        'training.aiPlan.reasonWithMl',
        `Жоспар ML модель болжаған ${backendMlResult.plan_template_id} шаблонына сүйеніп құрылды. Жалпы ұзақтығы шамамен ${minutes} минут, яғни таңдаған ${survey.duration} минуттан аспайды.`,
        {
          template: backendMlResult.plan_template_id,
          minutes,
          target: survey.duration,
        }
      );
    }

    return t(
      'training.aiPlan.reason',
      `Жоспар сіз таңдаған мақсат, дайындық деңгейі, уақыт және шектеулер бойынша құрылды. Жалпы ұзақтығы шамамен ${minutes} минут, яғни таңдаған ${survey.duration} минуттан аспайды.`,
      {
        minutes,
        target: survey.duration,
      }
    );
  };

  const requestMlRecommendation = async () => {
    const profilePayload = getUserProfilePayload();

    const payload = {
      ...survey,
      ...profilePayload,
      user_id: Number(localStorage.getItem('userId')) || null,
      workout_duration_minutes: Number(survey.duration),
      limitations: survey.limitation,
    };

    const res = await fetch(`${API_BASE_URL}/training-ai/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.detail || 'ML model prediction failed');
    }

    return data;
  };

  const buildPlan = async () => {
    if (isBuilding) return;

    setIsBuilding(true);
    setMlError('');
    setMlResult(null);

    let backendMlResult = null;

    try {
      backendMlResult = await requestMlRecommendation();
      setMlResult(backendMlResult);
    } catch (error) {
      console.error('Training AI ML error:', error);
      setMlError(
        t(
          'training.aiPlan.mlFallback',
          'ML модель уақытша қолжетімсіз. Жоспар fallback planner арқылы құрылды.'
        )
      );
    }

    const userGoal = getUserProfilePayload()?.goal || 'keep_fit';
    const planTitle =
      userGoal === 'gain_mass'
        ? t('training.aiPlan.titles.gain', 'AI жоспар: бұлшықет массасын арттыру')
        : userGoal === 'lose_weight'
        ? t('training.aiPlan.titles.lose', 'AI жоспар: май жағу')
        : t('training.aiPlan.titles.keep', 'AI жоспар: форманы сақтау');

    if (backendMlResult?.generated_exercises?.length > 0) {
      const genEx = backendMlResult.generated_exercises.map((ex, i) => ({
        key: `ai_gen_${i}`,
        name: ex.name,
        description: ex.description,
        reps: ex.dynamic_reps,
        workSeconds: 30,
        restSeconds: ex.rest_seconds || 30,
        mediaUrl: ex.video_path ? getVideoUrl(ex.video_path) : null,
        cameraMode: null
      }));

      const correctDuration = genEx.reduce((acc, curr) => acc + (curr.workSeconds + curr.restSeconds), 0);

      setPlan({
        title: planTitle,
        exercises: genEx,
        totalSeconds: correctDuration,
        targetMinutes: Number(survey.duration),
        reason: buildReason(correctDuration, backendMlResult),
        ml: backendMlResult,
      });

      setStep('result');
      setIsBuilding(false);
      return;
    }

    // Fallback if backend failed to generate
    const selected = exercisePool.slice(0, 5);
    const correctDuration = totalPlanSeconds(selected);

    setPlan({
      title: planTitle,
      exercises: selected,
      totalSeconds: correctDuration,
      targetMinutes: Number(survey.duration),
      reason: buildReason(correctDuration, backendMlResult),
      ml: backendMlResult,
    });

    setStep('result');
    setIsBuilding(false);
  };

  const displayedMlResult = plan?.ml || mlResult;

  if (step === 'workout' && plan?.exercises?.length) {
    return (
      <WorkoutEngine
        exercises={plan.exercises}
        title={plan.title}
        onComplete={onAllStepsComplete}
        onBack={() => setStep('result')}
      />
    );
  }

  return (
    <div className="ai-training-page">
      <div className="ai-training-shell">
        <button className="ai-training-back" onClick={onBack}>
          ← {t('common.back', 'Артқа')}
        </button>

        <div className="ai-training-badge">AI Training</div>

        <h2 className="ai-training-title">
          {t('training.ai.surveyTitle', 'AI арқылы жаттығу жоспарын таңдау')}
        </h2>

        <p className="ai-training-subtitle">
          {t(
            'training.ai.surveySubtitle',
            'Анкетаны толтыр: жүйе мақсатыңа, уақытыңа, деңгейіңе және шектеулеріңе қарай жеке жаттығу жоспарын құрады.'
          )}
        </p>

        {step === 'survey' && (
          <>
            <div className="ai-training-form-grid">


              <div className="ai-training-field">
                <label>{t('training.aiSurvey.duration', 'Қанша минут жаттыға аласыз?')}</label>
                <select
                  value={survey.duration}
                  onChange={(e) => updateSurvey('duration', Number(e.target.value))}
                >
                  <option value={15}>15 {t('training.minutes', 'мин')}</option>
                  <option value={20}>20 {t('training.minutes', 'мин')}</option>
                  <option value={30}>30 {t('training.minutes', 'мин')}</option>
                  <option value={45}>45 {t('training.minutes', 'мин')}</option>
                  <option value={60}>60 {t('training.minutes', 'мин')}</option>
                </select>
              </div>

              <div className="ai-training-field">
                <label>{t('training.aiSurvey.focus', 'Қай аймаққа көңіл бөлесіз?')}</label>
                <select value={survey.focus} onChange={(e) => updateSurvey('focus', e.target.value)}>
                  <option value="full">{t('training.focus.full', 'Бүкіл дене')}</option>
                  <option value="legs">{t('training.labels.legs', 'Аяқ')}</option>
                  <option value="chest">{t('training.labels.chest', 'Кеуде')}</option>
                  <option value="arms">{t('training.labels.arms', 'Қол')}</option>
                  <option value="abs">{t('training.labels.abs', 'Пресс')}</option>
                  <option value="cardio">Cardio</option>
                </select>
              </div>

              <div className="ai-training-field">
                <label>{t('training.aiSurvey.limitation', 'Шектеулер бар ма?')}</label>
                <select value={survey.limitation} onChange={(e) => updateSurvey('limitation', e.target.value)}>
                  <option value="none">{t('training.limitations.none', 'Жоқ')}</option>
                  <option value="knee">{t('training.limitations.knee', 'Тізе')}</option>
                  <option value="back">{t('training.limitations.back', 'Арқа/бел')}</option>
                  <option value="joints">Буын ауруы</option>
                  <option value="low_impact">{t('training.limitations.lowImpact', 'Төмен жүктеме керек')}</option>
                </select>
              </div>

              <div className="ai-training-field">
                <label>{t('training.aiSurvey.intensity', 'Қарқын')}</label>
                <select value={survey.intensity} onChange={(e) => updateSurvey('intensity', e.target.value)}>
                  <option value="low">{t('training.intensity.low', 'Жеңіл')}</option>
                  <option value="normal">{t('training.intensity.normal', 'Орташа')}</option>
                  <option value="high">{t('training.intensity.high', 'Қарқынды')}</option>
                  <option value="ai_auto">AI арқылы таңдау</option>
                </select>
                {isAiAnalyzingIntensity && (
                  <p style={{ marginTop: '10px', fontSize: '14px', color: '#64ffda' }}>
                    AI ойланып жатыр...
                  </p>
                )}
                {aiIntensitySuggestion && !isAiAnalyzingIntensity && (
                  <div style={{ marginTop: '10px', padding: '15px', backgroundColor: 'rgba(100, 255, 218, 0.1)', borderRadius: '8px', border: '1px solid rgba(100, 255, 218, 0.3)' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px', lineHeight: '1.4', color: '#e6f1ff' }}>
                      <strong>AI ұсынысы:</strong> {aiIntensitySuggestion.reason}
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        type="button"
                        onClick={acceptAiIntensity}
                        style={{ padding: '8px 16px', background: '#64ffda', color: '#0a192f', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Келісемін
                      </button>
                      <button 
                        type="button"
                        onClick={declineAiIntensity}
                        style={{ padding: '8px 16px', background: 'transparent', color: '#64ffda', border: '1px solid rgba(100, 255, 218, 0.5)', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Келіспеймін
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="ai-training-source-box">
              <h3>{t('training.aiSurvey.sourceTitle', 'Анкета неге осылай құрылған?')}</h3>
              <p>
                {t(
                  'training.aiSurvey.sourceText',
                  'Сұрақтар жас, белсенділік деңгейі, мақсат, уақыт және шектеулер сияқты факторларға сүйенеді. Бұл факторлар NHANES/PAQ деректер құрылымына және физикалық белсенділік бойынша ұсыныстарға сәйкес келеді.'
                )}
              </p>
            </div>

            {mlError && (
              <div className="ai-training-error-box">
                {mlError}
              </div>
            )}

            <button
              className="ai-training-primary"
              onClick={buildPlan}
              disabled={isBuilding}
            >
              {isBuilding
                ? t('training.aiSurvey.building', 'AI жоспар құрылып жатыр...')
                : t('training.aiSurvey.buildPlan', 'AI жоспар құру')}
            </button>
          </>
        )}

        {step === 'result' && plan && (
          <div className="ai-training-result">
            <div className="ai-training-result-card">
              <h3>{plan.title}</h3>
              <p>{plan.reason}</p>

              {displayedMlResult?.ai_safety_warning && (
                <div className="ai-training-warning-box">
                  <span style={{ fontSize: '20px', marginRight: '10px' }}>⚠️</span>
                  <p style={{ margin: 0 }}>{displayedMlResult.ai_safety_warning}</p>
                </div>
              )}

              {displayedMlResult && (
                <div className="ai-training-ml-box">
                  <span>ML model</span>
                  <strong>{displayedMlResult.plan_template_id}</strong>
                  <p>
                    Confidence:{' '}
                    {displayedMlResult.confidence !== null && displayedMlResult.confidence !== undefined
                      ? `${Math.round(displayedMlResult.confidence * 100)}%`
                      : 'N/A'}
                    {' '}· Source: {displayedMlResult.label_source || 'ml_nhanes_workout_plan'}
                  </p>

                  {displayedMlResult.model_accuracy !== null && displayedMlResult.model_accuracy !== undefined && (
                    <p>
                      Model accuracy: {Math.round(displayedMlResult.model_accuracy * 100)}%
                    </p>
                  )}
                </div>
              )}

              {mlError && (
                <div className="ai-training-error-box">
                  {mlError}
                </div>
              )}

              <div className="ai-training-stats">
                <div>
                  <span>{t('training.aiPlan.targetTime', 'Таңдалған уақыт')}</span>
                  <strong>{plan.targetMinutes} {t('training.minutes', 'мин')}</strong>
                </div>

                <div>
                  <span>{t('training.aiPlan.realTime', 'Жоспар ұзақтығы')}</span>
                  <strong>{formatMinutes(plan.totalSeconds)} {t('training.minutes', 'мин')}</strong>
                </div>

                <div>
                  <span>{t('training.aiPlan.exercises', 'Жаттығулар')}</span>
                  <strong>{plan.exercises.length}</strong>
                </div>
              </div>
            </div>

            <div className="ai-training-exercise-list">
              {plan.exercises.map((exercise, index) => (
                <div className="ai-training-exercise-item" key={exercise.key}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{exercise.name}</strong>
                    <p>{exercise.reps} · {exercise.cameraMode ? 'Camera AI' : 'Timer'}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="ai-training-actions">
              <button className="ai-training-secondary" onClick={() => setStep('survey')}>
                ← {t('training.aiSurvey.editAnswers', 'Анкетаны өзгерту')}
              </button>

              <button className="ai-training-primary" onClick={() => setStep('workout')}>
                {t('training.aiPlan.start', 'Жаттығуды бастау')}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
.ai-training-page {
  width: 100%;
  min-height: 100%;
  padding: 24px;
  box-sizing: border-box;
  color: #fff;
}

.ai-training-shell {
  width: min(1200px, 100%);
  margin: 0 auto;
  padding: 32px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(198, 120, 221, 0.14), transparent 32%),
    linear-gradient(180deg, #232833 0%, #1b2029 100%);
  border: 1px solid rgba(255,255,255,0.06);
  box-shadow: 0 25px 60px rgba(0,0,0,0.35);
  box-sizing: border-box;
}

.ai-training-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(97,218,251,0.3);
  background: rgba(97,218,251,0.08);
  color: #61dafb;
  font-weight: 800;
  cursor: pointer;
  margin-bottom: 18px;
}

.ai-training-badge {
  display: inline-flex;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(198, 120, 221, 0.10);
  border: 1px solid rgba(198, 120, 221, 0.25);
  color: #d8a8ea;
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 16px;
}

.ai-training-title {
  margin: 0 0 10px;
  font-size: clamp(30px, 4vw, 46px);
  line-height: 1.08;
  font-weight: 950;
}

.ai-training-subtitle {
  margin: 0 0 28px;
  max-width: 860px;
  color: #aab3c2;
  font-size: 15px;
  line-height: 1.7;
}

.ai-training-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.ai-training-field {
  min-width: 0;
}

.ai-training-field label {
  display: block;
  margin-bottom: 8px;
  color: #aab3c2;
  font-size: 13px;
  font-weight: 900;
}

.ai-training-field select {
  width: 100%;
  min-height: 52px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.10);
  background: #1c1f24;
  color: #fff;
  padding: 0 14px;
  font-size: 15px;
  outline: none;
  box-sizing: border-box;
}

.ai-training-source-box {
  margin-top: 22px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(97,218,251,0.08);
  border: 1px solid rgba(97,218,251,0.18);
}

.ai-training-source-box h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.ai-training-source-box p {
  margin: 0;
  color: #c8d1df;
  line-height: 1.65;
  font-size: 14px;
}

.ai-training-primary,
.ai-training-secondary {
  min-height: 54px;
  border-radius: 18px;
  padding: 0 20px;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
  margin-top: 22px;
  transition: 0.25s ease;
}

.ai-training-primary {
  border: none;
  background: linear-gradient(135deg, #63e0ff 0%, #4e8fff 100%);
  color: #0f1720;
  box-shadow: 0 16px 34px rgba(97,218,251,0.24);
}

.ai-training-primary:disabled {
  opacity: 0.62;
  cursor: not-allowed;
  box-shadow: none;
}

.ai-training-secondary {
  border: 1px solid rgba(255,255,255,0.12);
  background: transparent;
  color: #fff;
}

.ai-training-result-card {
  padding: 22px;
  border-radius: 22px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
}

.ai-training-result-card h3 {
  margin: 0 0 10px;
  font-size: 26px;
}

.ai-training-result-card p {
  margin: 0;
  color: #c8d1df;
  line-height: 1.65;
}

.ai-training-ml-box {
  margin-top: 16px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(198, 120, 221, 0.10);
  border: 1px solid rgba(198, 120, 221, 0.22);
}

.ai-training-ml-box span {
  display: block;
  color: #d8a8ea;
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 4px;
}

.ai-training-ml-box strong {
  display: block;
  color: #fff;
  font-size: 18px;
  margin-bottom: 5px;
  overflow-wrap: anywhere;
}

.ai-training-ml-box p {
  margin: 0;
  color: #c8d1df;
  font-size: 13px;
}

.ai-training-warning-box {
  margin-top: 16px;
  padding: 14px 18px;
  border-radius: 16px;
  background: rgba(243, 156, 18, 0.15);
  border: 1px solid rgba(243, 156, 18, 0.4);
  color: #f39c12;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.ai-training-error-box {
  margin-top: 16px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 120, 120, 0.10);
  border: 1px solid rgba(255, 120, 120, 0.22);
  color: #ffb4b4;
  font-size: 13px;
  font-weight: 800;
}

.ai-training-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.ai-training-stats div {
  padding: 14px;
  border-radius: 16px;
  background: rgba(255,255,255,0.04);
}

.ai-training-stats span {
  display: block;
  color: #aab3c2;
  font-size: 12px;
  margin-bottom: 5px;
}

.ai-training-stats strong {
  color: #61dafb;
  font-size: 18px;
}

.ai-training-exercise-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.ai-training-exercise-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px;
  border-radius: 18px;
  background: rgba(255,255,255,0.035);
  border: 1px solid rgba(255,255,255,0.06);
}

.ai-training-exercise-item > span {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: rgba(97,218,251,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #61dafb;
  font-weight: 900;
  flex-shrink: 0;
}

.ai-training-exercise-item strong {
  display: block;
  color: #fff;
  margin-bottom: 4px;
}

.ai-training-exercise-item p {
  margin: 0;
  color: #aab3c2;
  font-size: 13px;
}

.ai-training-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .ai-training-page {
    padding: 0 0 100px;
  }

  .ai-training-shell {
    padding: 18px;
    border-radius: 22px;
  }

  .ai-training-form-grid,
  .ai-training-stats,
  .ai-training-exercise-list {
    grid-template-columns: 1fr;
  }

  .ai-training-title {
    font-size: 31px;
  }

  .ai-training-subtitle {
    font-size: 14px;
  }

  .ai-training-field select {
    font-size: 16px;
  }

  .ai-training-primary,
  .ai-training-secondary {
    width: 100%;
  }
}
      `}</style>
    </div>
  );
};

export default AITrainingWorkout;