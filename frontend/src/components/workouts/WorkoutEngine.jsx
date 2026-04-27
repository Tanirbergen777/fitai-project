import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import beepSound from './sounds/beep.mp3';
import CameraCoachPanel from './CameraCoachPanel';

const parseTargetReps = (repsValue) => {
  if (!repsValue) return null;

  const text = String(repsValue).toLowerCase().trim();

  if (/sec|сек|second|min|мин|minute/.test(text)) {
    return null;
  }

  const numbers = text.match(/\d+/g);
  if (!numbers || numbers.length === 0) return null;

  if (/[xх×]/i.test(text) && numbers.length >= 2) {
    return Number(numbers[numbers.length - 1]);
  }

  return Number(numbers[0]);
};

const clampPercent = (value) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
};

const getExerciseKey = (exercise, index) => {
  return (
    exercise?.key ||
    exercise?.cameraMode ||
    String(exercise?.name || `exercise_${index}`)
      .toLowerCase()
      .replace(/\s+/g, '_')
  );
};

const getSkipReasonLabel = (reason) => {
  const labels = {
    tired: 'Шаршадым',
    unable: 'Қазір жасай алмаймын',
    postpone: 'Кейінге қалдыру',
    pain: 'Ауырсыну / ыңғайсыздық бар',
    difficult: 'Жаттығу қиын болды',
  };

  return labels[reason] || reason;
};

const getExerciseGoalBenefit = (exercise, reason) => {
  const name = exercise?.name || 'Бұл жаттығу';

  if (reason === 'unable') {
    return `${name} сіздің мақсатыңызға көмектеседі, себебі ол негізгі бұлшықеттерді іске қосып, жалпы физикалық дайындықты арттырады. Келесі жолы осы жаттығуға дайындық жасайтын жеңіл нұсқаларды ұсынамыз.`;
  }

  if (reason === 'pain') {
    return `${name} кезінде ауырсыну белгіленді. Келесі жолы төмен жүктемелі және қауіпсіз балама жаттығулардан бастаған дұрыс.`;
  }

  if (reason === 'difficult') {
    return `${name} қиын болды. Келесі жолы осы жаттығуға дайындық жасайтын beginner-friendly нұсқалар ұсынылады.`;
  }

  return `${name} сіздің жаттығу мақсатыңызға пайдалы, бірақ бүгін толық орындалмады.`;
};

const saveWeakExercisePreference = (exercise, reason) => {
  if (!['unable', 'pain', 'difficult'].includes(reason)) return;

  try {
    const key = 'fitai_weak_exercises';
    const saved = JSON.parse(localStorage.getItem(key) || '[]');

    const payload = {
      id: getExerciseKey(exercise, 0),
      name: exercise?.name || 'Exercise',
      cameraMode: exercise?.cameraMode || '',
      reason,
      reasonLabel: getSkipReasonLabel(reason),
      benefit: getExerciseGoalBenefit(exercise, reason),
      createdAt: new Date().toISOString(),
    };

    const filtered = saved.filter((item) => item.id !== payload.id);
    localStorage.setItem(key, JSON.stringify([payload, ...filtered].slice(0, 5)));
  } catch (error) {
    console.warn('Weak exercise save error:', error);
  }
};

const WorkoutEngine = ({ exercises = [], title, onComplete, onBack }) => {
  const { t } = useTranslation();
  const beepRef = useRef(null);
  const cameraAutoFinishedRef = useRef(false);
  const savedResultIdsRef = useRef(new Set());

  const normalizedExercises = useMemo(() => {
    return exercises.map((exercise, index) => ({
      ...exercise,
      _workoutId: `${index}-${getExerciseKey(exercise, index)}`,
      _originalIndex: index,
      _postponedCount: exercise._postponedCount || 0,
    }));
  }, [exercises]);

  const [workoutQueue, setWorkoutQueue] = useState([]);
  const [cameraRepCount, setCameraRepCount] = useState(0);
  const [, setCameraSummaryByExercise] = useState({});
  const cameraSummaryByExerciseRef = useRef({});
  const [exerciseResults, setExerciseResults] = useState([]);
  const [skipModalOpen, setSkipModalOpen] = useState(false);

  const [step, setStep] = useState('preview'); // preview | active | rest
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [exercisePhase, setExercisePhase] = useState('prepare'); // prepare | work
  const [prepTimeLeft, setPrepTimeLeft] = useState(5);

  useEffect(() => {
    setWorkoutQueue(normalizedExercises);
    setExerciseResults([]);
    savedResultIdsRef.current = new Set();
    setCurrentIndex(0);
    setCameraRepCount(0);
    setCameraSummaryByExercise({});
    cameraSummaryByExerciseRef.current = {};
    setSkipModalOpen(false);
    setStep('preview');
  }, [normalizedExercises]);

  const queue = workoutQueue.length ? workoutQueue : normalizedExercises;

  const totalWorkoutSeconds = queue.reduce((sum, ex) => {
    return sum + (ex.prepSeconds ?? 5) + (ex.workSeconds ?? 30) + (ex.restSeconds ?? 15);
  }, 0);

  const totalWorkoutMinutes = Math.ceil(totalWorkoutSeconds / 60);

  const currentEx = queue[currentIndex];
  const currentRestSeconds = currentEx?.restSeconds ?? 30;
  const currentWorkSeconds = currentEx?.workSeconds ?? 30;
  const targetReps = parseTargetReps(currentEx?.reps);
  const targetType = targetReps ? 'reps' : 'time';

  const elapsedWorkSeconds =
    step === 'active' && exercisePhase === 'work'
      ? Math.max(0, currentWorkSeconds - timeLeft)
      : 0;

  const currentExerciseId = currentEx?._workoutId || `${currentIndex}-${currentEx?.name || 'exercise'}`;

  const getCameraDrivenPerformance = useCallback(
    (cameraSummary, fallbackPerformance) => {
      if (!cameraSummary) return fallbackPerformance;

      const completion =
        typeof cameraSummary.completionPercent === 'number'
          ? cameraSummary.completionPercent
          : fallbackPerformance;

      const technique =
        typeof cameraSummary.techniqueScore === 'number'
          ? cameraSummary.techniqueScore
          : completion;

      if (cameraSummary.targetType === 'reps') {
        return clampPercent(completion * 0.45 + technique * 0.55);
      }

      return clampPercent(completion);
    },
    []
  );


  useEffect(() => {
    cameraAutoFinishedRef.current = false;
    setCameraRepCount(0);
  }, [currentIndex, exercisePhase, step, currentEx?.name]);

  const playSound = (audioRef) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  const audioNodes = (
    <>
      <audio ref={beepRef} src={beepSound} preload="auto" />
    </>
  );

  const buildExerciseResult = useCallback(
    (status, reason = 'completed') => {
      if (!currentEx) return null;

      const resultId = currentEx._workoutId || `${currentIndex}-${currentEx.name}`;
      const cameraSummary = cameraSummaryByExerciseRef.current[resultId] || null;

      let performancePercent = 100;
      let performedValue = null;
      let targetValue = null;
      let completionPercent = null;
      let techniqueScore = null;

      if (targetType === 'reps') {
        targetValue = targetReps;

        if (currentEx.cameraMode) {
          performedValue =
            typeof cameraSummary?.totalReps === 'number'
              ? cameraSummary.totalReps
              : cameraRepCount;

          const fallbackCompletion = targetReps
            ? clampPercent((performedValue / targetReps) * 100)
            : 100;

          completionPercent =
            typeof cameraSummary?.completionPercent === 'number'
              ? cameraSummary.completionPercent
              : fallbackCompletion;

          techniqueScore =
            typeof cameraSummary?.techniqueScore === 'number'
              ? cameraSummary.techniqueScore
              : null;

          performancePercent = getCameraDrivenPerformance(
            cameraSummary,
            fallbackCompletion
          );
        } else {
          performedValue = targetReps;
          completionPercent = status === 'completed' ? 100 : 0;
          performancePercent = status === 'completed' ? 100 : 0;
        }
      } else {
        targetValue = currentWorkSeconds;
        performedValue = elapsedWorkSeconds;
        completionPercent = currentWorkSeconds
          ? clampPercent((elapsedWorkSeconds / currentWorkSeconds) * 100)
          : 100;
        performancePercent = completionPercent;
      }

      if (status !== 'completed') {
        performancePercent = 0;
        completionPercent = 0;
        techniqueScore = null;
      }

      return {
        id: resultId,
        exerciseName: currentEx.name,
        exerciseKey: getExerciseKey(currentEx, currentIndex),
        cameraMode: currentEx.cameraMode || '',
        targetType,
        targetValue,
        performedValue,
        performancePercent,
        completionPercent,
        techniqueScore,
        cameraSummary,
        correctReps: cameraSummary?.correctReps ?? null,
        incorrectReps: cameraSummary?.incorrectReps ?? null,
        totalAttempts: cameraSummary?.totalAttempts ?? null,
        labelSource: cameraSummary?.labelSource || null,
        cameraFeedback: cameraSummary?.feedback || '',
        errorTypes: cameraSummary?.errorTypes || {},
        status,
        reason,
        reasonLabel: getSkipReasonLabel(reason),
        benefit: getExerciseGoalBenefit(currentEx, reason),
        createdAt: new Date().toISOString(),
      };
    },
    [
      currentEx,
      currentIndex,
      targetType,
      targetReps,
      cameraRepCount,
      currentWorkSeconds,
      elapsedWorkSeconds,
      getCameraDrivenPerformance,
    ]
  );

  const addExerciseResult = useCallback(
    (result) => {
      if (!result) return exerciseResults;

      if (savedResultIdsRef.current.has(result.id)) {
        return exerciseResults;
      }

      savedResultIdsRef.current.add(result.id);

      const nextResults = [...exerciseResults, result];
      setExerciseResults(nextResults);

      if (['unable', 'pain', 'difficult'].includes(result.reason)) {
        saveWeakExercisePreference(currentEx, result.reason);
      }

      return nextResults;
    },
    [exerciseResults, currentEx]
  );

  const buildWorkoutReport = useCallback(
    (resultsList) => {
      const total = queue.length || 1;
      const completed = resultsList.filter((item) => item.status === 'completed');
      const skipped = resultsList.filter((item) => item.status === 'skipped');

      const averagePerformance = completed.length
        ? Math.round(
            completed.reduce((sum, item) => sum + (item.performancePercent || 0), 0) /
              completed.length
          )
        : 0;

      const techniqueItems = completed.filter(
        (item) => typeof item.techniqueScore === 'number'
      );

      const averageTechnique = techniqueItems.length
        ? Math.round(
            techniqueItems.reduce((sum, item) => sum + item.techniqueScore, 0) /
              techniqueItems.length
          )
        : null;

      const completionScore = clampPercent((completed.length / total) * 100);
      const consistencyScore = clampPercent(((total - skipped.length) / total) * 100);

      const score = clampPercent(
        completionScore * 0.35 +
          averagePerformance * 0.45 +
          consistencyScore * 0.2
      );

      let summary = 'Жақсы жұмыс! Жаттығу қорытындысы дайын.';

      if (score >= 90) {
        summary = 'Өте жақсы! Жаттығулардың көп бөлігін толық әрі тұрақты орындадыңыз.';
      } else if (score >= 75) {
        summary = 'Жақсы нәтиже. Кейбір жаттығуларды толық орындауға көңіл бөлу керек.';
      } else if (score >= 55) {
        summary = 'Орташа нәтиже. Жаттығуларды біртіндеп жеңіл деңгейден бастаған дұрыс.';
      } else {
        summary = 'Бүгін толық орындау қиын болды. Келесі жолы жеңілдетілген жоспардан бастаймыз.';
      }

      return {
        title,
        score,
        totalExercises: total,
        completedCount: completed.length,
        skippedCount: skipped.length,
        completionScore,
        performanceScore: averagePerformance,
        techniqueScore: averageTechnique,
        consistencyScore,
        results: resultsList,
        skipped,
        summary,
        createdAt: new Date().toISOString(),
      };
    },
    [queue.length, title]
  );

  const completeWorkoutFlow = useCallback(
    (resultsList = exerciseResults) => {
      const report = buildWorkoutReport(resultsList);
      onComplete?.(report);
    },
    [buildWorkoutReport, exerciseResults, onComplete]
  );

  const goToNextExercise = useCallback(() => {
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextEx = queue[nextIndex];

      setCurrentIndex(nextIndex);
      setPrepTimeLeft(nextEx?.prepSeconds ?? 5);
      setTimeLeft(nextEx?.workSeconds ?? 30);
      setExercisePhase('prepare');
      setStep('active');
    } else {
      completeWorkoutFlow();
    }
  }, [currentIndex, queue, completeWorkoutFlow]);

  const finishExercise = useCallback(() => {
    const result = buildExerciseResult('completed', 'completed');
    addExerciseResult(result);

    setTimeLeft(currentRestSeconds);
    setStep('rest');
  }, [buildExerciseResult, addExerciseResult, currentRestSeconds]);

  const handleSkipClick = () => {
    setSkipModalOpen(true);
  };

  const skipCurrentExercise = (reason) => {
    const result = buildExerciseResult('skipped', reason);
    const nextResults = addExerciseResult(result);

    setSkipModalOpen(false);

    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextEx = queue[nextIndex];

      setCurrentIndex(nextIndex);
      setPrepTimeLeft(nextEx?.prepSeconds ?? 5);
      setTimeLeft(nextEx?.workSeconds ?? 30);
      setExercisePhase('prepare');
      setStep('active');
    } else {
      completeWorkoutFlow(nextResults);
    }
  };

  const postponeCurrentExercise = () => {
    setSkipModalOpen(false);

    if (currentIndex >= queue.length - 1) {
      return;
    }

    const copy = [...queue];
    const [postponed] = copy.splice(currentIndex, 1);

    const updatedPostponed = {
      ...postponed,
      _postponedCount: (postponed._postponedCount || 0) + 1,
    };

    const nextQueue = [...copy, updatedPostponed];
    const nextEx = nextQueue[currentIndex];

    setWorkoutQueue(nextQueue);
    setPrepTimeLeft(nextEx?.prepSeconds ?? 5);
    setTimeLeft(nextEx?.workSeconds ?? 30);
    setExercisePhase('prepare');
    setStep('active');
  };

  const handleCameraRepCountChange = useCallback((count) => {
    setCameraRepCount(typeof count === 'number' ? count : 0);
  }, []);

  const handleCameraSummaryChange = useCallback(
    (summary) => {
      if (!summary || !currentEx) return;

      const exerciseId = currentEx._workoutId || `${currentIndex}-${currentEx.name}`;

      const normalizedSummary = {
        ...summary,
        exerciseId,
        exerciseName: currentEx.name,
        targetReps,
        targetType,
      };

      cameraSummaryByExerciseRef.current = {
        ...cameraSummaryByExerciseRef.current,
        [exerciseId]: normalizedSummary,
      };

      setCameraSummaryByExercise((prev) => ({
        ...prev,
        [exerciseId]: normalizedSummary,
      }));
    },
    [currentEx, currentIndex, targetReps, targetType]
  );


  const handleCameraTargetReached = useCallback(() => {
    if (targetType !== 'reps') return;
    if (step !== 'active' || exercisePhase !== 'work') return;
    if (cameraAutoFinishedRef.current) return;

    cameraAutoFinishedRef.current = true;
    finishExercise();
  }, [targetType, step, exercisePhase, finishExercise]);

  useEffect(() => {
    if (step === 'active' && exercisePhase === 'prepare') {
      if (prepTimeLeft > 0 && prepTimeLeft <= 3) {
        playSound(beepRef);
      }
    }

    if (step === 'active' && exercisePhase === 'work') {
      if (timeLeft > 0 && timeLeft <= 3) {
        playSound(beepRef);
      }
    }

    if (step === 'rest') {
      if (timeLeft > 0 && timeLeft <= 3) {
        playSound(beepRef);
      }
    }
  }, [step, exercisePhase, prepTimeLeft, timeLeft]);

  useEffect(() => {
    let timer;

    if (step === 'rest' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (step === 'rest' && timeLeft === 0) {
      goToNextExercise();
    }

    return () => clearInterval(timer);
  }, [step, timeLeft, goToNextExercise]);

  useEffect(() => {
    let timer;

    if (step === 'active' && exercisePhase === 'prepare' && prepTimeLeft > 0) {
      timer = setInterval(() => {
        setPrepTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (
      step === 'active' &&
      exercisePhase === 'prepare' &&
      prepTimeLeft === 0
    ) {
      setExercisePhase('work');
      setTimeLeft(currentWorkSeconds);
    }

    return () => clearInterval(timer);
  }, [step, exercisePhase, prepTimeLeft, currentWorkSeconds]);

  useEffect(() => {
    let timer;

    if (step === 'active' && exercisePhase === 'work' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (step === 'active' && exercisePhase === 'work' && timeLeft === 0) {
      finishExercise();
    }

    return () => clearInterval(timer);
  }, [step, exercisePhase, timeLeft, finishExercise]);

  const startWorkout = () => {
    if (!queue.length) return;

    setCurrentIndex(0);
    setPrepTimeLeft(queue[0]?.prepSeconds ?? 5);
    setExercisePhase('prepare');
    setTimeLeft(queue[0]?.workSeconds ?? 30);
    setStep('active');
  };

  const startNow = () => {
    setPrepTimeLeft(0);
    setExercisePhase('work');
    setTimeLeft(currentWorkSeconds);
  };

  const progress = queue.length
    ? ((currentIndex + 1) / queue.length) * 100
    : 0;

  const animationKey = `${step}-${exercisePhase}-${currentIndex}`;

  if (!queue.length) {
    return (
      <div className="we-page">
        {audioNodes}

        <div className="we-topbar">
          <button className="we-back-btn" onClick={onBack}>
            ← {t('common.back')}
          </button>
        </div>

        <div className="we-empty-card">
          <h2>{t('training.loadingTitle')}</h2>
          <p>{t('training.loadingSubtitle')}</p>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div className="we-page">
        {audioNodes}

        <div className="we-topbar">
          <button className="we-back-btn" onClick={onBack}>
            ← {t('common.back')}
          </button>
        </div>

        <div className="we-preview-shell">
          <div className="we-preview-grid">
            <section className="we-program-card">
              <div className="we-preview-glow" />
              <span className="we-preview-badge">{t('training.program')}</span>

              <h1 className="we-title">{title}</h1>
              <p className="we-subtitle">{t('training.programDescription')}</p>

              <div className="we-stats">
                <div className="we-stat">
                  <span className="we-stat-icon">⏱</span>
                  <div className="we-stat-content">
                    <strong>
                      {totalWorkoutMinutes} {t('training.minutes')}
                    </strong>
                    <p>{t('training.duration')}</p>
                  </div>
                </div>

                <div className="we-stat">
                  <span className="we-stat-icon">🔥</span>
                  <div className="we-stat-content">
                    <strong>
                      {queue.length} {t('training.exercisesCount')}
                    </strong>
                    <p>{t('training.volume')}</p>
                  </div>
                </div>

                <div className="we-stat">
                  <span className="we-stat-icon">📊</span>
                  <div className="we-stat-content">
                    <strong>{t('level.medium')}</strong>
                    <p>{t('training.intensity')}</p>
                  </div>
                </div>
              </div>

              <button className="we-primary-btn we-start-btn" onClick={startWorkout}>
                {t('common.start')}
              </button>
            </section>

            <section className="we-plan-side-card">
              <h3>{t('training.plan')}</h3>

              <div className="we-plan-list">
                {queue.map((ex, i) => (
                  <div key={ex._workoutId || i} className="we-plan-item">
                    <div className="we-plan-index">{i + 1}</div>

                    <div className="we-plan-info">
                      <div className="we-plan-name">{ex.name}</div>
                      <div className="we-plan-reps">{ex.reps || t('training.defaultReps')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  if (step === 'active') {
    return (
      <div className="we-page">
        {audioNodes}

        <div className="we-active-shell">
          <div className="we-active-topbar">
            <button className="we-back-link" onClick={onBack}>
              ← {t('common.back')}
            </button>

            <div className="we-progress-block">
              <div className="we-progress-track">
                <div
                  className="we-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <span className="we-progress-text">
                {currentIndex + 1} / {queue.length}
              </span>
            </div>
          </div>

          <div className="we-active-stack">
            <section
              key={`info-${animationKey}`}
              className="we-active-info-card we-card-animate"
            >
              {exercisePhase === 'prepare' ? (
                <div className="we-prep-card">
                  <span className="we-exercise-badge">
                    {t('training.prepareTitle')}
                  </span>

                  <h2 className="we-exercise-title we-exercise-title--left">
                    {currentEx.name}
                  </h2>

                  <div className="we-reps-pill">{currentEx.reps || t('training.defaultReps')}</div>

                  <div className="we-prep-timer-wrap">
                    <div className="we-prep-timer">
                      {prepTimeLeft} {t('training.seconds')}
                    </div>
                  </div>

                  <p className="we-prep-hint">{t('training.prepareHint')}</p>

                  <button className="we-primary-btn we-wide-btn" onClick={startNow}>
                    {t('training.skipPrepare')}
                  </button>
                </div>
              ) : (
                <div className="we-work-card">
                  <span className="we-exercise-badge">
                    {t('training.currentExercise')}
                  </span>

                  <h2 className="we-exercise-title we-exercise-title--left">
                    {currentEx.name}
                  </h2>

                  <div className="we-prep-timer-wrap">
                    <div className="we-prep-timer">
                      {timeLeft} {t('training.seconds')}
                    </div>
                  </div>

                  {targetType === 'reps' && (
                    <div className="we-ai-counter">
                      {t('training.aiCounterLabel')}:{' '}
                      <strong>{cameraRepCount}</strong> / {targetReps ?? '—'}
                    </div>
                  )}

                  <div className="we-description">
                    {currentEx.description || t('training.defaultDescription')}
                  </div>

                  {currentEx.muscles && (
                    <div className="we-muscles">
                      🎯 {currentEx.muscles.join(', ')}
                    </div>
                  )}

                  {currentEx.equipment && (
                    <div className="we-equipment">
                      🏋 {currentEx.equipment}
                    </div>
                  )}

                  <div className="we-actions we-actions--bottom">
                    <button className="we-secondary-btn" onClick={handleSkipClick}>
                      {t('training.skip')}
                    </button>

                    <button className="we-primary-btn" onClick={finishExercise}>
                      {t('training.done')}
                    </button>
                  </div>
                </div>
              )}
            </section>

            <div className="we-bottom-row">
              <section className="we-active-media-card">
                <div key={`media-${animationKey}`} className="we-media-animate">
                  {(() => {
                    const mediaUrl = currentEx?.mediaUrl || currentEx?.gifUrl || '';
                    const isVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(mediaUrl);

                    if (isVideo) {
                      return (
                        <video
                          src={mediaUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          controls
                          preload="metadata"
                          onError={() => console.warn('Video failed:', mediaUrl)}
                        />
                      );
                    }

                    return (
                      <img
                        src={mediaUrl}
                        alt={currentEx.name}
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80';
                        }}
                      />
                    );
                  })()}
                </div>
              </section>

              <section className="we-active-camera-card">
                <CameraCoachPanel
                  exerciseName={currentEx?.name || ''}
                  exerciseOrderIndex={currentIndex + 1}
                  targetReps={targetReps}
                  targetLabel={currentEx?.reps || ''}
                  targetType={targetType}
                  targetDurationSeconds={currentWorkSeconds}
                  elapsedWorkSeconds={elapsedWorkSeconds}
                  isActive={exercisePhase === 'work'}
                  exerciseModeOverride={currentEx?.cameraMode || ''}
                  onRepCountChange={handleCameraRepCountChange}
                  onTargetReached={handleCameraTargetReached}
                  onCameraSummary={currentEx?.cameraMode ? handleCameraSummaryChange : null}
                />
              </section>
            </div>
          </div>
        </div>

        {skipModalOpen && (
          <div className="we-skip-overlay" onClick={() => setSkipModalOpen(false)}>
            <div className="we-skip-modal" onClick={(e) => e.stopPropagation()}>
              <div className="we-skip-icon">⏭</div>

              <h3>Неге бұл жаттығуды өткізгіңіз келеді?</h3>

              <p>
                Себебін таңдаңыз. Егер кейінге қалдырсаңыз, бұл жаттығу жоспардың соңына ауысады.
              </p>

              <div className="we-skip-options">
                <button type="button" onClick={() => skipCurrentExercise('tired')}>
                  😮‍💨 Шаршадым
                </button>

                <button type="button" onClick={() => skipCurrentExercise('unable')}>
                  🚧 Қазір жасай алмаймын
                </button>

                <button type="button" onClick={postponeCurrentExercise}>
                  🕒 Кейінге қалдыру
                </button>

                <button type="button" onClick={() => skipCurrentExercise('pain')}>
                  ⚠️ Ауырсыну / ыңғайсыздық бар
                </button>

                <button type="button" onClick={() => skipCurrentExercise('difficult')}>
                  📉 Жаттығу қиын болды
                </button>
              </div>

              <button type="button" className="we-skip-cancel" onClick={() => setSkipModalOpen(false)}>
                Бас тарту
              </button>
            </div>
          </div>
        )}

        <style>{styles}</style>
      </div>
    );
  }

  if (step === 'rest') {
    return (
      <div className="we-page">
        {audioNodes}

        <div key={`rest-${animationKey}`} className="we-rest-card we-rest-animate">
          <span className="we-rest-badge">{t('training.restMode')}</span>
          <h2 className="we-rest-title">{t('training.restTitle')}</h2>

          <div className="we-timer-ring">
            <div className="we-timer-inner">
              <span className="we-timer-value">{timeLeft}</span>
              <span className="we-timer-unit">{t('training.seconds')}</span>
            </div>
          </div>

          <div className="we-next-card">
            <p>{t('training.nextExercise')}</p>
            <h4>{queue[currentIndex + 1]?.name || t('training.finish')}</h4>
          </div>

          <button className="we-primary-btn we-start-btn" onClick={goToNextExercise}>
            {t('training.skipRest')}
          </button>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  return null;
};

const styles = `
.we-page {
  width: 100%;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: 0 14px 24px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  color: #fff;
  text-align: start;
  align-items: stretch;
  background: #1c1f24;
}

.we-topbar {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 10px 0 14px 15px;
  box-sizing: border-box;
}

.we-back-btn,
.we-back-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(97, 218, 251, 0.08);
  border: 1px solid rgba(97, 218, 251, 0.35);
  color: #61dafb;
  padding: 12px 18px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 800;
  transition: all 0.25s ease;
  backdrop-filter: blur(10px);
  min-height: 44px;
  white-space: nowrap;
}

.we-back-btn:hover,
.we-back-link:hover {
  transform: translateY(-2px);
  background: rgba(97, 218, 251, 0.16);
  box-shadow: 0 10px 30px rgba(97, 218, 251, 0.18);
}

.we-preview-shell {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0;
}

.we-preview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
  gap: 20px;
  width: min(1180px, 100%);
  padding: 20px;
  box-sizing: border-box;
  align-items: stretch;
}

.we-program-card,
.we-plan-side-card,
.we-rest-card,
.we-empty-card,
.we-active-info-card,
.we-active-media-card,
.we-active-camera-card {
  position: relative;
  min-height: 0;
  box-sizing: border-box;
  background:
    radial-gradient(circle at top right, rgba(97,218,251,0.10), transparent 28%),
    linear-gradient(180deg, #232833 0%, #1b2029 100%);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 28px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.32);
}

.we-program-card {
  min-width: 0;
  padding: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.we-plan-side-card {
  min-width: 0;
  max-height: 600px;
  overflow-y: auto;
  padding: 28px;
}

.we-preview-glow {
  position: absolute;
  top: -80px;
  right: -80px;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(97,218,251,0.18) 0%, rgba(97,218,251,0) 70%);
  pointer-events: none;
}

.we-preview-badge,
.we-rest-badge,
.we-exercise-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(97, 218, 251, 0.1);
  border: 1px solid rgba(97, 218, 251, 0.22);
  color: #7ce3ff;
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 16px;
}

.we-title {
  margin: 0 0 12px;
  font-size: clamp(26px, 4vw, 42px);
  line-height: 1.06;
  font-weight: 950;
  max-width: none;
  word-break: break-word;
  overflow-wrap: break-word;
}

.we-subtitle {
  margin: 0 0 20px;
  color: #a7b0bf;
  font-size: 15px;
  line-height: 1.6;
  max-width: 760px;
}

.we-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
  width: 100%;
}

.we-stat {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 18px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1 1 150px;
  min-width: 0;
}

.we-stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(97, 218, 251, 0.12);
  font-size: 18px;
  flex-shrink: 0;
}

.we-stat-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.we-stat strong {
  display: block;
  font-size: 15px;
  margin-bottom: 3px;
  color: #fff;
}

.we-stat-content p,
.we-stat p {
  margin: 0;
  color: #8f99aa;
  font-size: 12px;
}

.we-plan-side-card h3 {
  margin: 0 0 16px;
  color: #61dafb;
  font-size: 20px;
  font-weight: 900;
  line-height: 1.2;
}

.we-plan-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.we-plan-item {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.we-plan-item:last-child {
  border-bottom: none;
}

.we-plan-index {
  min-width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(97,218,251,0.12);
  color: #61dafb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 18px;
  flex-shrink: 0;
}

.we-plan-info {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.we-plan-name {
  font-size: 16px;
  font-weight: 850;
  line-height: 1.25;
  text-align: left;
  word-break: break-word;
}

.we-plan-reps {
  color: #96a0b1;
  margin-top: 6px;
  font-size: 15px;
  text-align: left;
}

.we-start-btn {
  margin-top: auto;
  min-height: 62px;
}

.we-primary-btn,
.we-secondary-btn {
  border: none;
  border-radius: 18px;
  padding: 16px 18px;
  font-size: 16px;
  font-weight: 850;
  cursor: pointer;
  transition: all 0.25s ease;
  min-height: 52px;
  touch-action: manipulation;
}

.we-primary-btn {
  width: 100%;
  background: linear-gradient(135deg, #63e0ff 0%, #4e8fff 100%);
  color: #0f1720;
  box-shadow: 0 14px 30px rgba(97,218,251,0.25);
}

.we-primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 34px rgba(97,218,251,0.32);
}

.we-secondary-btn {
  background: transparent;
  color: #ffffff;
  border: 1px solid rgba(255,255,255,0.12);
}

.we-secondary-btn:hover {
  background: rgba(255,255,255,0.04);
}

.we-wide-btn {
  max-width: 360px;
}

.we-progress-block {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.we-progress-track {
  flex: 1;
  height: 8px;
  background: rgba(255,255,255,0.08);
  border-radius: 999px;
  overflow: hidden;
}

.we-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #63e0ff 0%, #4e8fff 100%);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.we-progress-text {
  color: #aab3c2;
  min-width: 48px;
  text-align: right;
  font-weight: 800;
}

.we-exercise-title {
  margin: 0 0 12px;
  font-size: clamp(24px, 3vw, 34px);
  font-weight: 900;
}

.we-exercise-title--left {
  text-align: left;
  margin: 0 0 16px;
  font-size: clamp(34px, 4vw, 62px);
  line-height: 1.04;
  font-weight: 950;
  max-width: 900px;
  overflow-wrap: break-word;
  word-break: break-word;
}

.we-reps-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(97,218,251,0.12);
  color: #7ce3ff;
  border: 1px solid rgba(97,218,251,0.18);
  font-weight: 850;
}

.we-ai-counter {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(97, 218, 251, 0.08);
  border: 1px solid rgba(97, 218, 251, 0.18);
  color: #dbefff;
  font-size: 15px;
  font-weight: 800;
  margin-bottom: 14px;
}

.we-description {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.05);
  border-left: 4px solid #61dafb;
  border-radius: 18px;
  padding: 14px 16px;
  color: #b4bcc9;
  line-height: 1.65;
  margin-bottom: 22px;
  max-width: 760px;
  font-size: 18px;
}

.we-muscles,
.we-equipment {
  margin-top: 14px;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 800;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  width: fit-content;
  max-width: 100%;
  line-height: 1.45;
}

.we-muscles {
  color: #ffb347;
}

.we-equipment {
  color: #61dafb;
}

.we-actions {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 14px;
  max-width: 520px;
}

.we-actions--bottom {
  margin-top: 26px;
}

.we-active-shell {
  width: 100%;
  margin: 0;
  padding: 0;
}

.we-active-topbar {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.we-active-stack {
  width: 100%;
  max-width: 1700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.we-active-info-card {
  width: 100%;
  min-height: 300px;
  padding: 34px 36px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.we-bottom-row {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
  align-items: stretch;
}

.we-active-media-card,
.we-active-camera-card {
  min-height: 640px;
  padding: 22px;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  overflow: hidden;
}

.we-media-animate {
  width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: weMediaIn 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.we-active-media-card img,
.we-active-media-card video {
  width: 100%;
  height: 100%;
  min-height: 560px;
  max-height: 760px;
  object-fit: contain;
  border-radius: 24px;
  background: #10151d;
}

.we-prep-card,
.we-work-card {
  display: flex;
  flex-direction: column;
}

.we-prep-card .we-reps-pill,
.we-work-card .we-reps-pill {
  margin-bottom: 22px;
}

.we-prep-timer-wrap {
  margin: 6px 0 18px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.we-prep-timer {
  font-size: 22px;
  font-weight: 950;
  line-height: 1;
  color: #61dafb;
}

.we-prep-seconds {
  margin-top: 8px;
  color: #9ea8b8;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.we-prep-hint {
  margin: 0 0 24px;
  color: #aab3c2;
  line-height: 1.5;
  max-width: 520px;
  font-size: 17px;
}

.we-rest-card {
  text-align: center;
  width: min(720px, 100%);
  margin: 0 auto;
  padding: 28px;
}

.we-rest-title {
  margin: 0 0 20px;
  font-size: clamp(28px, 5vw, 42px);
  font-weight: 950;
}

.we-timer-ring {
  width: 220px;
  height: 220px;
  margin: 0 auto 24px;
  border-radius: 50%;
  padding: 14px;
  background: conic-gradient(from 180deg, #63e0ff, #4e8fff, #63e0ff);
  box-shadow: 0 20px 50px rgba(97,218,251,0.18);
}

.we-timer-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #1a1f28;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.we-timer-value {
  font-size: 60px;
  font-weight: 950;
  line-height: 1;
}

.we-timer-unit {
  margin-top: 8px;
  color: #9ea8b8;
  font-size: 14px;
}

.we-next-card {
  margin: 0 auto 22px;
  max-width: 420px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.05);
}

.we-next-card p {
  margin: 0 0 8px;
  color: #90a0b5;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.we-next-card h4 {
  margin: 0;
  font-size: 22px;
}

.we-empty-card {
  width: min(760px, 100%);
  margin: 0 auto;
  padding: 40px 24px;
  text-align: center;
}

.we-card-animate {
  animation: weCardIn 0.38s cubic-bezier(0.22, 1, 0.36, 1);
}

.we-rest-animate {
  animation: weRestIn 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes weCardIn {
  0% {
    opacity: 0;
    transform: translateY(18px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes weMediaIn {
  0% {
    opacity: 0;
    transform: translateX(24px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes weRestIn {
  0% {
    opacity: 0;
    transform: scale(0.96);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Tablet */
@media (max-width: 1100px) {
  .we-preview-grid {
    width: 100%;
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .we-plan-side-card {
    max-height: none;
  }

  .we-bottom-row {
    grid-template-columns: 1fr;
  }

  .we-active-camera-card {
    order: 1;
    min-height: auto;
  }

  .we-active-media-card {
    order: 2;
    min-height: auto;
  }

  .we-active-media-card img,
  .we-active-media-card video {
    min-height: 320px;
    max-height: 520px;
  }
}

/* Phone */
@media (max-width: 768px) {
  .we-page {
    min-height: 100dvh;
    padding: 8px 10px 110px;
    background:
      radial-gradient(circle at top, rgba(97,218,251,0.08), transparent 28%),
      #1c1f24;
  }

  .we-topbar {
    padding: 8px 0 12px;
  }

  .we-back-btn,
  .we-back-link {
    width: fit-content;
    min-height: 42px;
    padding: 10px 14px;
    font-size: 13px;
  }

  .we-preview-grid {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
    padding: 0;
  }

  .we-program-card,
  .we-plan-side-card,
  .we-rest-card,
  .we-empty-card,
  .we-active-info-card,
  .we-active-media-card,
  .we-active-camera-card {
    border-radius: 22px;
    box-shadow: 0 16px 38px rgba(0,0,0,0.28);
  }

  .we-program-card,
  .we-plan-side-card {
    padding: 18px;
  }

  .we-preview-badge,
  .we-rest-badge,
  .we-exercise-badge {
    padding: 7px 12px;
    font-size: 11px;
    margin-bottom: 12px;
  }

  .we-title {
    font-size: clamp(26px, 8vw, 36px);
    line-height: 1.08;
  }

  .we-subtitle {
    font-size: 14px;
    line-height: 1.55;
  }

  .we-stats {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 18px;
  }

  .we-stat {
    padding: 12px;
    border-radius: 16px;
  }

  .we-stat-icon {
    width: 38px;
    height: 38px;
  }

  .we-start-btn {
    min-height: 56px;
  }

  .we-plan-side-card h3 {
    font-size: 18px;
  }

  .we-plan-list {
    gap: 0;
  }

  .we-plan-item {
    padding: 12px 0;
    gap: 12px;
  }

  .we-plan-index {
    min-width: 34px;
    height: 34px;
    border-radius: 11px;
    font-size: 15px;
  }

  .we-plan-name {
    font-size: 15px;
  }

  .we-plan-reps {
    font-size: 13px;
  }

  .we-active-shell {
    width: 100%;
  }

  .we-active-topbar {
    position: sticky;
    top: 0;
    z-index: 20;
    padding: 8px 0 12px;
    margin-bottom: 12px;
    background: linear-gradient(180deg, rgba(28,31,36,0.98), rgba(28,31,36,0.86));
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  .we-active-stack {
    gap: 14px;
  }

  .we-active-info-card {
    padding: 18px;
    min-height: auto;
  }

  .we-exercise-title--left {
    font-size: clamp(28px, 9vw, 42px);
    line-height: 1.08;
    margin-bottom: 12px;
  }

  .we-reps-pill {
    padding: 8px 12px;
    font-size: 13px;
  }

  .we-prep-timer-wrap {
    margin: 4px 0 14px;
  }

  .we-prep-timer {
    font-size: 20px;
  }

  .we-prep-hint {
    font-size: 14px;
    margin-bottom: 18px;
  }

  .we-ai-counter {
    width: 100%;
    box-sizing: border-box;
    justify-content: center;
    font-size: 14px;
    padding: 11px 12px;
  }

  .we-description {
    font-size: 14px;
    line-height: 1.55;
    padding: 12px 14px;
    margin-bottom: 14px;
    border-radius: 16px;
  }

  .we-muscles,
  .we-equipment {
    width: 100%;
    box-sizing: border-box;
    font-size: 14px;
    padding: 11px 13px;
  }

  .we-actions {
    width: 100%;
    max-width: none;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .we-actions--bottom {
    margin-top: 18px;
  }

  .we-primary-btn,
  .we-secondary-btn {
    min-height: 52px;
    padding: 14px 12px;
    border-radius: 16px;
    font-size: 14px;
  }

  .we-wide-btn {
    width: 100%;
    max-width: none;
  }

  .we-bottom-row {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .we-active-camera-card {
    order: 1;
    min-height: auto;
    padding: 14px;
  }

  .we-active-media-card {
    order: 2;
    min-height: auto;
    padding: 14px;
  }

  .we-active-media-card img,
  .we-active-media-card video {
    min-height: 220px;
    max-height: 340px;
    border-radius: 18px;
  }

  .we-progress-block {
    gap: 10px;
  }

  .we-progress-track {
    height: 7px;
  }

  .we-progress-text {
    font-size: 12px;
    min-width: 42px;
  }

  .we-rest-card {
    margin-top: 12px;
    padding: 22px 18px;
  }

  .we-rest-title {
    font-size: clamp(26px, 8vw, 34px);
  }

  .we-timer-ring {
    width: 180px;
    height: 180px;
    padding: 12px;
  }

  .we-timer-value {
    font-size: 50px;
  }

  .we-next-card {
    padding: 16px;
  }

  .we-next-card h4 {
    font-size: 19px;
  }
}

/* Small phone */
@media (max-width: 430px) {
  .we-page {
    padding-left: 8px;
    padding-right: 8px;
  }

  .we-program-card,
  .we-plan-side-card,
  .we-active-info-card,
  .we-active-media-card,
  .we-active-camera-card,
  .we-rest-card {
    border-radius: 20px;
  }

  .we-active-info-card,
  .we-program-card,
  .we-plan-side-card {
    padding: 16px;
  }

  .we-exercise-title--left {
    font-size: clamp(25px, 9vw, 36px);
  }

  .we-actions {
    grid-template-columns: 1fr;
  }

  .we-active-media-card img,
  .we-active-media-card video {
    min-height: 190px;
    max-height: 300px;
  }

  .we-timer-ring {
    width: 160px;
    height: 160px;
  }

  .we-timer-value {
    font-size: 44px;
  }
}

.we-skip-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: rgba(7, 10, 16, 0.72);
  backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  box-sizing: border-box;
}

.we-skip-modal {
  width: min(520px, 100%);
  border-radius: 28px;
  padding: 24px;
  background:
    radial-gradient(circle at top, rgba(97,218,251,0.12), transparent 34%),
    linear-gradient(180deg, #252a35 0%, #1b2029 100%);
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 28px 80px rgba(0,0,0,0.48);
}

.we-skip-icon {
  width: 60px;
  height: 60px;
  border-radius: 20px;
  background: rgba(97,218,251,0.10);
  border: 1px solid rgba(97,218,251,0.20);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 16px;
}

.we-skip-modal h3 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 950;
}

.we-skip-modal p {
  margin: 0 0 18px;
  color: #aab3c2;
  line-height: 1.6;
}

.we-skip-options {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.we-skip-options button,
.we-skip-cancel {
  width: 100%;
  min-height: 50px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: #fff;
  font-size: 15px;
  font-weight: 850;
  cursor: pointer;
  text-align: left;
  padding: 0 14px;
  font-family: inherit;
}

.we-skip-options button:hover {
  background: rgba(97,218,251,0.10);
  border-color: rgba(97,218,251,0.25);
}

.we-skip-cancel {
  margin-top: 12px;
  text-align: center;
  color: #aab3c2;
  background: transparent;
}

.we-summary-shell {
  width: 100%;
  min-height: 100dvh;
  display: flex;
  justify-content: center;
  padding: 24px 0 100px;
  box-sizing: border-box;
}

.we-summary-card {
  width: min(980px, 100%);
  border-radius: 30px;
  padding: 30px;
  background:
    radial-gradient(circle at top right, rgba(97,218,251,0.12), transparent 34%),
    linear-gradient(180deg, #232833 0%, #1b2029 100%);
  border: 1px solid rgba(255,255,255,0.07);
  box-shadow: 0 24px 60px rgba(0,0,0,0.32);
  box-sizing: border-box;
}

.we-score-circle {
  width: 140px;
  height: 140px;
  border-radius: 999px;
  margin: 24px auto;
  background: rgba(97,218,251,0.10);
  border: 1px solid rgba(97,218,251,0.24);
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  color: #61dafb;
}

.we-score-circle strong {
  font-size: 48px;
  font-weight: 950;
}

.we-score-circle span {
  font-size: 18px;
  color: #aab3c2;
}

.we-summary-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.we-summary-stats div {
  padding: 16px;
  border-radius: 18px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.05);
}

.we-summary-stats span {
  display: block;
  color: #aab3c2;
  font-size: 13px;
  margin-bottom: 6px;
}

.we-summary-stats strong {
  color: #fff;
  font-size: 22px;
}

.we-checklist {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.we-check-item {
  padding: 16px;
  border-radius: 18px;
  background: rgba(255,255,255,0.035);
  border: 1px solid rgba(255,255,255,0.06);
}

.we-check-item.done {
  border-color: rgba(34,197,94,0.20);
}

.we-check-item.skipped {
  border-color: rgba(245,158,11,0.22);
}

.we-check-main {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.we-check-main strong {
  display: block;
  color: #fff;
  margin-bottom: 4px;
}

.we-check-main p {
  margin: 0;
  color: #aab3c2;
}

.we-check-main small {
  display: block;
  margin-top: 8px;
  color: #c8d1df;
  line-height: 1.5;
}

.we-learning-box {
  margin-top: 18px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(198,120,221,0.10);
  border: 1px solid rgba(198,120,221,0.22);
}

.we-learning-box h3 {
  margin: 0 0 8px;
  color: #d8a8ea;
}

.we-learning-box p {
  margin: 0;
  color: #c8d1df;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .we-skip-modal {
    padding: 18px;
    border-radius: 22px;
  }

  .we-summary-card {
    padding: 18px;
    border-radius: 22px;
  }

  .we-summary-stats {
    grid-template-columns: 1fr;
  }

  .we-score-circle {
    width: 120px;
    height: 120px;
  }

  .we-score-circle strong {
    font-size: 40px;
  }
}

`;

export default WorkoutEngine;