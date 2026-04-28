import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import {
  LANDMARKS,
  detectExerciseMode,
  buildPoseFeatures,
  analyzeSquat,
  analyzePushup,
  analyzeJumpingJacks,
  analyzePlank,
  analyzeHighKnees,
  analyzeCrunch,
  analyzeLunge,
  analyzeGeneric,
} from './cameraAnalyzers';
import { API_BASE_URL } from '../../config/api';

const API_BASE = API_BASE_URL;

const getStoredUserId = () => {
  const directKeys = ['user_id', 'userId'];

  for (const key of directKeys) {
    const value = localStorage.getItem(key);
    if (value && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }

  const objectKeys = ['user', 'userData', 'currentUser', 'authUser'];

  for (const key of objectKeys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      const possibleId =
        parsed?.id ??
        parsed?.user_id ??
        parsed?.user?.id ??
        parsed?.user?.user_id;

      if (possibleId && !Number.isNaN(Number(possibleId))) {
        return Number(possibleId);
      }
    } catch (e) {
      console.warn(`Не удалось распарсить localStorage ключ ${key}`, e);
    }
  }

  return null;
};

const POSE_CONNECTIONS = [
  [LANDMARKS.LEFT_SHOULDER, LANDMARKS.RIGHT_SHOULDER],
  [LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_ELBOW],
  [LANDMARKS.LEFT_ELBOW, LANDMARKS.LEFT_WRIST],
  [LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_ELBOW],
  [LANDMARKS.RIGHT_ELBOW, LANDMARKS.RIGHT_WRIST],
  [LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_HIP],
  [LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_HIP],
  [LANDMARKS.LEFT_HIP, LANDMARKS.RIGHT_HIP],
  [LANDMARKS.LEFT_HIP, LANDMARKS.LEFT_KNEE],
  [LANDMARKS.LEFT_KNEE, LANDMARKS.LEFT_ANKLE],
  [LANDMARKS.RIGHT_HIP, LANDMARKS.RIGHT_KNEE],
  [LANDMARKS.RIGHT_KNEE, LANDMARKS.RIGHT_ANKLE],
];

const isVisiblePoint = (point, min = 0.22) =>
  point && (point.visibility ?? 1) >= min;

const drawRoundedRect = (ctx, x, y, w, h, r = 14) => {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

const getOverlayTone = (errorType, isTargetReached) => {
  if (isTargetReached) {
    return {
      accent: '#22c55e',
      soft: 'rgba(34, 197, 94, 0.18)',
      text: '#dcfce7',
      line: 'rgba(99, 224, 255, 0.95)',
      joint: '#7dd3fc',
    };
  }

  if (!errorType) {
    return {
      accent: '#22c55e',
      soft: 'rgba(34, 197, 94, 0.18)',
      text: '#ecfdf5',
      line: 'rgba(99, 224, 255, 0.95)',
      joint: '#7dd3fc',
    };
  }

  if (
    [
      'not_low_enough',
      'range_incomplete',
      'legs_not_wide_enough',
      'hands_not_up',
      'knee_not_high_enough',
    ].includes(errorType)
  ) {
    return {
      accent: '#f59e0b',
      soft: 'rgba(245, 158, 11, 0.18)',
      text: '#fff7ed',
      line: 'rgba(99, 224, 255, 0.95)',
      joint: '#fbbf24',
    };
  }

  return {
    accent: '#ef4444',
    soft: 'rgba(239, 68, 68, 0.18)',
    text: '#fef2f2',
    line: 'rgba(99, 224, 255, 0.95)',
    joint: '#f87171',
  };
};

const formatStage = (stage) => String(stage || '—').toUpperCase();

const formatMetricValue = (label, value) => {
  if (value == null || Number.isNaN(Number(value))) return '—';

  const lower = String(label || '').toLowerCase();

  if (lower.includes('угол')) {
    return `${Math.round(Number(value))}°`;
  }

  if (lower.includes('время') || lower.includes('сек')) {
    return `${Math.round(Number(value))} сек`;
  }

  if (Math.abs(Number(value)) < 10) {
    return Number(value).toFixed(2);
  }

  return `${Math.round(Number(value))}`;
};

const getNoPoseFeedback = (mode) => {
  if (mode === 'pushup') {
    return 'Поза табылмады. Push-up үшін камераны бүйір жаққа 2–3 метрге қой: бас, қол, бел, тізе және аяқ толық көрінсін.';
  }

  if (mode === 'squat') {
    return 'Поза табылмады. Squat үшін камераны бүйірге қойып, денені толық кадрға сыйдыр.';
  }

  if (mode === 'plank') {
    return 'Поза табылмады. Plank үшін дене толық көрінуі керек: иық, бел және аяқ кадр ішінде болсын.';
  }

  return 'Поза табылмады. Камера денені толық көруі керек, сәл алысырақ тұрып көр.';
};

const drawConnection = (ctx, landmarks, startIdx, endIdx, width, height, tone) => {
  const start = landmarks[startIdx];
  const end = landmarks[endIdx];

  if (!isVisiblePoint(start) || !isVisiblePoint(end)) return;

  ctx.beginPath();
  ctx.moveTo(start.x * width, start.y * height);
  ctx.lineTo(end.x * width, end.y * height);
  ctx.lineWidth = width < 520 ? 3 : 4;
  ctx.strokeStyle = tone.line;
  ctx.stroke();
};

const drawJoint = (ctx, point, width, height, tone) => {
  if (!isVisiblePoint(point)) return;

  const x = point.x * width;
  const y = point.y * height;
  const radius = width < 520 ? 4 : 5;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = tone.joint;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(15, 23, 32, 0.55)';
  ctx.lineWidth = 2;
  ctx.stroke();
};

const drawChip = (ctx, x, y, label, value, tone, options = {}) => {
  const width = options.width ?? 160;
  const height = options.height ?? 56;
  const compact = options.compact ?? false;

  drawRoundedRect(ctx, x, y, width, height, compact ? 12 : 14);
  ctx.fillStyle = 'rgba(10, 15, 25, 0.68)';
  ctx.fill();
  ctx.strokeStyle = tone.soft;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = 'rgba(168, 180, 200, 0.95)';
  ctx.font = `${compact ? 10 : 12}px Inter, Arial, sans-serif`;
  ctx.fillText(label, x + 10, y + (compact ? 15 : 18));

  ctx.fillStyle = tone.text;
  ctx.font = `900 ${compact ? 16 : 22}px Inter, Arial, sans-serif`;
  ctx.fillText(String(value), x + 10, y + (compact ? 36 : 42));
};

const drawPoseSkeleton = (ctx, landmarks, width, height, tone) => {
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
    drawConnection(ctx, landmarks, startIdx, endIdx, width, height, tone);
  }

  for (const point of landmarks) {
    drawJoint(ctx, point, width, height, tone);
  }

  ctx.restore();
};

const drawHudOverlay = (ctx, width, height, overlay) => {
  const {
    exerciseName,
    repCount,
    targetType,
    targetReps,
    targetDurationSeconds,
    stage,
    feedback,
    metricLabel,
    metricValue,
    errorType,
    isTargetReached,
    completionPercent,
    isActive,
  } = overlay;

  const compact = width < 650;
  const tone = getOverlayTone(errorType, isTargetReached);

  ctx.clearRect(0, 0, width, height);
  ctx.save();

  const topGradient = ctx.createLinearGradient(0, 0, 0, compact ? 190 : 160);
  topGradient.addColorStop(0, 'rgba(8, 12, 20, 0.78)');
  topGradient.addColorStop(1, 'rgba(8, 12, 20, 0)');
  ctx.fillStyle = topGradient;
  ctx.fillRect(0, 0, width, compact ? 190 : 160);

  const titleX = compact ? 12 : 18;
  const titleY = compact ? 12 : 16;
  const titleW = compact ? Math.min(width - 24, 220) : 220;
  const titleH = compact ? 38 : 42;

  drawRoundedRect(ctx, titleX, titleY, titleW, titleH, 12);
  ctx.fillStyle = 'rgba(8, 12, 20, 0.72)';
  ctx.fill();
  ctx.strokeStyle = tone.soft;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = `800 ${compact ? 14 : 18}px Inter, Arial, sans-serif`;
  ctx.fillText((exerciseName || 'Camera Coach').slice(0, compact ? 22 : 28), titleX + 12, titleY + (compact ? 25 : 26));

  const statusText = isTargetReached
    ? 'Done'
    : !isActive
    ? 'Prepare'
    : !errorType
    ? 'Good'
    : 'Warning';

  const statusW = compact ? 90 : 142;
  const statusH = compact ? 38 : 42;
  const statusX = Math.max(titleX + titleW + 8, width - statusW - 12);

  if (!compact || width > 360) {
    drawRoundedRect(ctx, statusX, titleY, statusW, statusH, 12);
    ctx.fillStyle = tone.soft;
    ctx.fill();
    ctx.strokeStyle = tone.accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = tone.text;
    ctx.font = `800 ${compact ? 14 : 18}px Inter, Arial, sans-serif`;
    ctx.fillText(statusText, statusX + 12, titleY + (compact ? 25 : 26));
  }

  const targetText =
    targetType === 'reps'
      ? `${targetReps ?? '—'}`
      : `${targetDurationSeconds ?? '—'}s`;

  const metricText = formatMetricValue(metricLabel, metricValue);

  if (compact) {
    const gap = 8;
    const chipW = Math.max(92, (width - 32 - gap) / 2);
    const chipH = 44;
    const x1 = 12;
    const x2 = 12 + chipW + gap;
    const y1 = 62;
    const y2 = 112;

    drawChip(ctx, x1, y1, 'Target', targetText, tone, { width: chipW, height: chipH, compact: true });
    drawChip(ctx, x2, y1, 'Counter', String(repCount ?? 0), tone, { width: chipW, height: chipH, compact: true });
    drawChip(ctx, x1, y2, 'Stage', formatStage(stage), tone, { width: chipW, height: chipH, compact: true });
    drawChip(ctx, x2, y2, metricLabel || 'Metric', metricText, tone, { width: chipW, height: chipH, compact: true });
  } else {
    drawChip(ctx, 18, 72, 'Target', targetText, tone, { width: 120 });
    drawChip(ctx, 148, 72, 'Counter', String(repCount ?? 0), tone, { width: 120 });
    drawChip(ctx, 278, 72, 'Stage', formatStage(stage), tone, { width: 150 });
    drawChip(ctx, 438, 72, metricLabel || 'Metric', metricText, tone, { width: 190 });
  }

  const progress = Math.max(0, Math.min(100, Number(completionPercent ?? 0)));
  const barX = compact ? 12 : 18;
  const barY = height - (compact ? 26 : 34);
  const barW = width - barX * 2;
  const barH = compact ? 10 : 14;

  drawRoundedRect(ctx, barX, barY, barW, barH, 999);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fill();

  drawRoundedRect(ctx, barX, barY, (barW * progress) / 100, barH, 999);
  ctx.fillStyle = tone.accent;
  ctx.fill();

  const feedbackWidth = Math.min(width - barX * 2, compact ? width - 24 : 520);
  const feedbackHeight = compact ? 50 : 56;
  const feedbackX = barX;
  const feedbackY = height - (compact ? 86 : 100);

  drawRoundedRect(ctx, feedbackX, feedbackY, feedbackWidth, feedbackHeight, 14);
  ctx.fillStyle = 'rgba(8, 12, 20, 0.74)';
  ctx.fill();
  ctx.strokeStyle = tone.soft;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = 'rgba(168, 180, 200, 0.95)';
  ctx.font = `700 ${compact ? 10 : 12}px Inter, Arial, sans-serif`;
  ctx.fillText('Feedback', feedbackX + 12, feedbackY + (compact ? 15 : 18));

  ctx.fillStyle = '#f8fafc';
  ctx.font = `700 ${compact ? 13 : 16}px Inter, Arial, sans-serif`;
  const feedbackText = feedback || 'Смотри в камеру и займи позицию.';
  ctx.fillText(feedbackText.slice(0, compact ? 42 : 58), feedbackX + 12, feedbackY + (compact ? 34 : 40));

  ctx.restore();
};

export default function CameraCoachPanel({
  exerciseName = '',
  exerciseOrderIndex = null,
  targetReps = null,
  targetLabel = '',
  targetType = 'reps',
  targetDurationSeconds = null,
  elapsedWorkSeconds = 0,
  isActive = false,
  exerciseModeOverride = '',
  onRepCountChange = null,
  onTargetReached = null,
  onCameraSummary = null,
}) {
  const videoRef = useRef(null);
  const skeletonCanvasRef = useRef(null);
  const hudCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const rafRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const stageRef = useRef('up');

  const lastLiveSampleSentAtRef = useRef(0);
  const isActiveRef = useRef(isActive);
  const exerciseModeRef = useRef('generic');
  const latestFeaturesRef = useRef(null);
  const latestErrorTypeRef = useRef(null);
  const metricLabelRef = useRef('Угол');
  const metricValueRef = useRef(null);

  const lastLandmarksRef = useRef(null);
  const lastOverlayRef = useRef(null);
  const lastPoseSeenAtRef = useRef(0);
  const lastNoPoseFeedbackAtRef = useRef(0);

  const sessionIdRef = useRef(null);
  const finishingSessionRef = useRef(false);
  const repCountRef = useRef(0);
  const feedbackRef = useRef('');
  const prevExerciseNameRef = useRef('');

  const attemptCountRef = useRef(0);
  const correctRepCountRef = useRef(0);
  const incorrectRepCountRef = useRef(0);
  const lastAttemptScoreRef = useRef(null);
  const lastLabelSourceRef = useRef('rule');
  const lastAttemptFeedbackRef = useRef('');
  const errorTypeCountsRef = useRef({});
  const squatMlPendingRef = useRef(false);
  const pushupMlPendingRef = useRef(false);
  const cycleStartedRef = useRef(false);
  const cycleHadErrorRef = useRef(false);
  const repCooldownRef = useRef(0);
  const squatBottomSnapshotRef = useRef(null);

  const targetRepsRef = useRef(targetReps);
  const targetTypeRef = useRef(targetType);
  const targetDurationSecondsRef = useRef(targetDurationSeconds);
  const elapsedWorkSecondsRef = useRef(elapsedWorkSeconds);
  const targetReachedNotifiedRef = useRef(false);

  const [cameraOn, setCameraOn] = useState(false);
  const [modelStatus, setModelStatus] = useState('loading');
  const [feedback, setFeedback] = useState('Инициализация camera coach...');
  const [repCount, setRepCount] = useState(0);
  const [stage, setStage] = useState('up');
  const [metricLabel, setMetricLabel] = useState('Угол');
  const [metricValue, setMetricValue] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  const exerciseMode = useMemo(() => {
    if (exerciseModeOverride) return exerciseModeOverride;
    return detectExerciseMode(exerciseName);
  }, [exerciseModeOverride, exerciseName]);

  const isTouchDevice = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  const isMobileCameraLayout = isSmallScreen || isTouchDevice;

  // Маңызды: 90 градус бұрылуды алып тастадық.
  // Ноутбукта да, телефонда да браузер камераны өзі дұрыс orientation-мен береді.
  const CAMERA_ROTATION = 0;
  const MIRROR_CAMERA = true;
  const cameraTransform = `${MIRROR_CAMERA ? 'scaleX(-1)' : 'scaleX(1)'} rotate(${CAMERA_ROTATION}deg)`;

  const completionPercent = useMemo(() => {
    if (targetType === 'reps') {
      if (!targetReps || targetReps <= 0) return null;
      return Math.min(100, Math.round((repCount / targetReps) * 100));
    }

    if (targetType === 'time') {
      if (!targetDurationSeconds || targetDurationSeconds <= 0) return null;
      return Math.min(
        100,
        Math.round((elapsedWorkSeconds / targetDurationSeconds) * 100)
      );
    }

    return null;
  }, [repCount, targetReps, targetType, targetDurationSeconds, elapsedWorkSeconds]);

  const buildCameraSummary = useCallback(() => {
    const totalAttempts = attemptCountRef.current;
    const correctReps = correctRepCountRef.current;
    const incorrectReps = incorrectRepCountRef.current;
    const currentTargetReps = targetRepsRef.current;
    const currentTargetType = targetTypeRef.current;
    const currentTargetDuration = targetDurationSecondsRef.current;
    const currentElapsed = elapsedWorkSecondsRef.current;

    // Completion көрсеткіші барлық attempt бойынша есептеледі.
    // Мысалы 10 мақсат, 7 дұрыс + 2 қате = 9 attempt => completion 90%.
    // Technique бөлек: correct / totalAttempts.
    const repCompletionPercent =
      currentTargetType === 'reps' && currentTargetReps && currentTargetReps > 0
        ? Math.min(100, Math.round((totalAttempts / currentTargetReps) * 100))
        : null;

    const timeCompletionPercent =
      currentTargetType === 'time' && currentTargetDuration && currentTargetDuration > 0
        ? Math.min(100, Math.round((currentElapsed / currentTargetDuration) * 100))
        : null;

    const techniqueScore =
      totalAttempts > 0 ? Math.round((correctReps / totalAttempts) * 100) : null;

    const completionScore =
      currentTargetType === 'reps' ? repCompletionPercent : timeCompletionPercent;

    const cameraPerformance =
      currentTargetType === 'reps' && completionScore !== null && techniqueScore !== null
        ? Math.round(completionScore * 0.45 + techniqueScore * 0.55)
        : completionScore;

    return {
      exerciseName,
      exerciseOrderIndex,
      exerciseMode: exerciseModeRef.current,
      targetType: currentTargetType,
      targetReps: currentTargetReps,
      targetDurationSeconds: currentTargetDuration,
      elapsedWorkSeconds: currentElapsed,
      totalAttempts,
      totalReps: totalAttempts,
      correctReps,
      incorrectReps,
      completionPercent: completionScore,
      techniqueScore,
      cameraPerformance,
      lastAttemptScore: lastAttemptScoreRef.current,
      labelSource: lastLabelSourceRef.current,
      feedback: lastAttemptFeedbackRef.current || feedbackRef.current || '',
      errorTypes: { ...errorTypeCountsRef.current },
      metricLabel: metricLabelRef.current,
      metricValue: metricValueRef.current,
      stage: stageRef.current,
    };
  }, [exerciseName, exerciseOrderIndex]);

  const publishCameraSummary = useCallback(() => {
    if (typeof onCameraSummary !== 'function') return;
    onCameraSummary(buildCameraSummary());
  }, [buildCameraSummary, onCameraSummary]);



  const isTargetReached = useMemo(() => {
    if (targetType === 'reps') {
      return targetReps ? repCount >= targetReps : false;
    }

    if (targetType === 'time') {
      return targetDurationSeconds
        ? elapsedWorkSeconds >= targetDurationSeconds
        : false;
    }

    return false;
  }, [targetType, targetReps, repCount, targetDurationSeconds, elapsedWorkSeconds]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    repCountRef.current = repCount;
  }, [repCount]);

  useEffect(() => {
    if (typeof onRepCountChange === 'function') {
      onRepCountChange(repCount);
    }
  }, [repCount, onRepCountChange]);

  useEffect(() => {
    publishCameraSummary();
  }, [completionPercent, elapsedWorkSeconds, publishCameraSummary]);


  useEffect(() => {
    feedbackRef.current = feedback;
  }, [feedback]);

  useEffect(() => {
    metricLabelRef.current = metricLabel;
  }, [metricLabel]);

  useEffect(() => {
    metricValueRef.current = metricValue;
  }, [metricValue]);

  useEffect(() => {
    targetRepsRef.current = targetReps;
  }, [targetReps]);

  useEffect(() => {
    targetTypeRef.current = targetType;
  }, [targetType]);

  useEffect(() => {
    targetDurationSecondsRef.current = targetDurationSeconds;
  }, [targetDurationSeconds]);

  useEffect(() => {
    elapsedWorkSecondsRef.current = elapsedWorkSeconds;
  }, [elapsedWorkSeconds]);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    exerciseModeRef.current = exerciseMode;
  }, [exerciseMode]);

  useEffect(() => {
    targetReachedNotifiedRef.current = false;
  }, [exerciseName, exerciseOrderIndex, targetReps, targetType]);

  useEffect(() => {
    if (targetType !== 'reps') return;
    if (!isActive || !cameraOn) return;
    if (!isTargetReached) return;
    if (targetReachedNotifiedRef.current) return;

    targetReachedNotifiedRef.current = true;

    if (typeof onTargetReached === 'function') {
      onTargetReached({
        exerciseName,
        exerciseOrderIndex,
        repCount,
        targetReps,
        targetType,
        completionPercent,
      });
    }
  }, [
    cameraOn,
    isActive,
    isTargetReached,
    onTargetReached,
    exerciseName,
    exerciseOrderIndex,
    repCount,
    targetReps,
    targetType,
    completionPercent,
  ]);

  const startBackendSession = useCallback(async () => {
    try {
      const userId = getStoredUserId();

      if (!userId) {
        console.warn('Camera session: user_id не найден в localStorage');
        return;
      }

      const response = await fetch(`${API_BASE}/camera-workout/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          exercise_name: exerciseName || 'Упражнение',
          exercise_order_index: exerciseOrderIndex,
          exercise_mode: exerciseMode,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Не удалось стартовать camera session:', text);
        return;
      }

      const data = await response.json();
      sessionIdRef.current = data.id;
      lastLiveSampleSentAtRef.current = 0;
      console.log('Camera session started:', data.id);
    } catch (error) {
      console.error('Camera session start error:', error);
    }
  }, [exerciseName, exerciseOrderIndex, exerciseMode]);

  const finishBackendSession = useCallback(async () => {
    const sessionId = sessionIdRef.current;
    if (!sessionId || finishingSessionRef.current) return;

    finishingSessionRef.current = true;

    const currentTargetType = targetTypeRef.current;
    const currentTargetReps = targetRepsRef.current;
    const currentTargetDurationSeconds = targetDurationSecondsRef.current;
    const currentElapsedWorkSeconds = elapsedWorkSecondsRef.current;

    const finalCompletionPercent =
      currentTargetType === 'reps'
        ? currentTargetReps && currentTargetReps > 0
          ? Math.min(
              100,
              Math.round((repCountRef.current / currentTargetReps) * 100)
            )
          : null
        : currentTargetType === 'time'
        ? currentTargetDurationSeconds && currentTargetDurationSeconds > 0
          ? Math.min(
              100,
              Math.round(
                (currentElapsedWorkSeconds / currentTargetDurationSeconds) * 100
              )
            )
          : null
        : null;

    const completionSummary =
      currentTargetType === 'reps'
        ? currentTargetReps && currentTargetReps > 0
          ? `Выполнено ${repCountRef.current} из ${currentTargetReps} (${finalCompletionPercent}%)`
          : `Сделано повторов: ${repCountRef.current}`
        : currentTargetType === 'time'
        ? currentTargetDurationSeconds && currentTargetDurationSeconds > 0
          ? `По времени выполнено ${currentElapsedWorkSeconds} из ${currentTargetDurationSeconds} сек (${finalCompletionPercent}%)`
          : 'Упражнение по времени'
        : `Сделано повторов: ${repCountRef.current}`;

    try {
      const response = await fetch(
        `${API_BASE}/camera-workout/session/${sessionId}/finish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            form_score: finalCompletionPercent,
            feedback_summary: `${feedbackRef.current || ''} | ${completionSummary}`,
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error('Не удалось завершить camera session:', text);
      } else {
        const data = await response.json();
        console.log('Camera session finished:', data.id);
      }
    } catch (error) {
      console.error('Camera session finish error:', error);
    } finally {
      sessionIdRef.current = null;
      finishingSessionRef.current = false;
    }
  }, []);

  const sendRepEvent = useCallback(
    async ({
      repIndex,
      isCorrect,
      feedbackText,
      errorType = null,
      score = null,
      labelSource = 'rule',
      features = latestFeaturesRef.current,
      stage = stageRef.current,
      metricLabel = metricLabelRef.current,
      metricValue =
        typeof metricValueRef.current === 'number' ? metricValueRef.current : null,
    }) => {
      const sessionId = sessionIdRef.current;
      if (!sessionId) return;

      try {
        const response = await fetch(
          `${API_BASE}/camera-workout/session/${sessionId}/rep-event`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              rep_index: repIndex,
              is_correct: isCorrect,
              score: score ?? (isCorrect ? 0.95 : 0.45),
              feedback:
                feedbackText ||
                (isCorrect ? 'Повтор засчитан' : 'Повтор с ошибкой'),
              exercise_mode: exerciseModeRef.current,
              stage,
              metric_label: metricLabel,
              metric_value: metricValue,
              features_json: features,
              error_type: errorType,
              label_source: labelSource,
            }),
          }
        );

        if (!response.ok) {
          const text = await response.text();
          console.error('Не удалось отправить rep-event:', text);
        }
      } catch (error) {
        console.error('Rep-event error:', error);
      }
    },
    []
  );

  const sendLiveSample = useCallback(async () => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;

    const now = performance.now();
    if (now - lastLiveSampleSentAtRef.current < 2500) return;

    lastLiveSampleSentAtRef.current = now;

    const featuresPayload = {
      ...(latestFeaturesRef.current || {}),
      is_active: isActiveRef.current,
      rep_count: repCountRef.current,
      target_type: targetTypeRef.current,
      target_reps: targetRepsRef.current,
      target_duration_seconds: targetDurationSecondsRef.current,
    };

    try {
      const response = await fetch(
        `${API_BASE}/camera-workout/session/${sessionId}/live-sample`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exercise_mode: exerciseModeRef.current,
            stage: stageRef.current,
            metric_label: metricLabelRef.current,
            metric_value:
              typeof metricValueRef.current === 'number'
                ? metricValueRef.current
                : null,
            features_json: featuresPayload,
            error_type: latestErrorTypeRef.current,
            label_source: 'rule_live',
            elapsed_seconds: elapsedWorkSecondsRef.current ?? 0,
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error('Не удалось отправить live-sample:', text);
      }
    } catch (error) {
      console.error('Live-sample error:', error);
    }
  }, []);

  const finalizeAttempt = useCallback(
    ({ isCorrect, feedbackText, errorType = null, score = null, labelSource = 'rule' }) => {
      attemptCountRef.current += 1;
      const currentAttemptIndex = attemptCountRef.current;

      latestErrorTypeRef.current = errorType;
      lastAttemptScoreRef.current = score;
      lastLabelSourceRef.current = labelSource;
      lastAttemptFeedbackRef.current =
        feedbackText || (isCorrect ? 'Повтор засчитан.' : 'Повтор с ошибкой.');

      if (errorType) {
        errorTypeCountsRef.current = {
          ...errorTypeCountsRef.current,
          [errorType]: (errorTypeCountsRef.current[errorType] || 0) + 1,
        };
      }

      if (isCorrect) {
        correctRepCountRef.current += 1;
      } else {
        incorrectRepCountRef.current += 1;
      }

      // Counter тек дұрыс rep емес, барлық аяқталған attempt-ті санайды.
      // Сондықтан қате squat та 1 attempt болып есептеледі,
      // ал correct/incorrect бөлек summary-де сақталады.
      repCountRef.current = currentAttemptIndex;
      setRepCount(currentAttemptIndex);

      void sendRepEvent({
        repIndex: currentAttemptIndex,
        isCorrect,
        feedbackText,
        errorType,
        score,
        labelSource,
      });

      publishCameraSummary();

      cycleStartedRef.current = false;
      cycleHadErrorRef.current = false;
    },
    [sendRepEvent, publishCameraSummary]
  );

  const evaluateSquatAttempt = useCallback(
    async ({
      fallbackIsCorrect,
      fallbackFeedbackText,
      fallbackErrorType = null,
      features = null,
    }) => {
      // Бұрын мұнда squatMlPendingRef guard болды.
      // Ол ML сұранысы ұзақ жауап берсе, келесі squat repeat-терді өткізіп жіберетін.
      // Сондықтан әр аяқталған repeat үшін жеке ML сұранысын жібереміз.
      squatMlPendingRef.current = true;

      try {
        const response = await fetch(`${API_BASE}/camera-workout/ml/squat-evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            features_json: features || latestFeaturesRef.current || {},
            phase: stageRef.current,
            exercise_mode: 'squat',
          }),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'ML squat evaluate failed');
        }

        const data = await response.json();
        const finalFeedback = data.feedback || fallbackFeedbackText;
        setFeedback(finalFeedback);

        finalizeAttempt({
          isCorrect: Boolean(data.is_correct),
          feedbackText: finalFeedback,
          errorType: data.error_type ?? fallbackErrorType ?? null,
          score: data.score ?? null,
          labelSource: data.label_source || 'ml_rf_squat',
        });
      } catch (error) {
        console.error('Squat ML evaluate error:', error);
        setFeedback(fallbackFeedbackText);

        finalizeAttempt({
          isCorrect: fallbackIsCorrect,
          feedbackText: fallbackFeedbackText,
          errorType: fallbackErrorType,
          score: null,
          labelSource: 'rule_fallback',
        });
      } finally {
        squatMlPendingRef.current = false;
      }
    },
    [finalizeAttempt]
  );


  const evaluatePushupAttempt = useCallback(
    async ({
      isCorrect: fallbackIsCorrect,
      feedbackText: fallbackFeedbackText,
      errorType: fallbackErrorType = null,
      score: fallbackScore = null,
      labelSource: fallbackLabelSource = 'rule',
      features = null,
    }) => {
      // Push-up-та да squat сияқты ML сұранысы counter-ді блоктамауы керек.
      // Әр аяқталған repeat үшін жеке ML бағалау жібереміз.
      pushupMlPendingRef.current = true;

      try {
        const response = await fetch(`${API_BASE}/camera-workout/ml/pushup-evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            features_json: features || latestFeaturesRef.current || {},
            phase: stageRef.current,
            exercise_mode: 'pushup',
          }),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'ML pushup evaluate failed');
        }

        const data = await response.json();
        const finalFeedback = data.feedback || fallbackFeedbackText;
        setFeedback(finalFeedback);

        finalizeAttempt({
          isCorrect: Boolean(data.is_correct),
          feedbackText: finalFeedback,
          errorType: data.error_type ?? fallbackErrorType ?? null,
          score: data.score ?? fallbackScore ?? null,
          labelSource: data.label_source || 'ml_rf_pushup',
        });
      } catch (error) {
        console.error('Push-up ML evaluate error:', error);
        setFeedback(fallbackFeedbackText);

        finalizeAttempt({
          isCorrect: fallbackIsCorrect,
          feedbackText: fallbackFeedbackText,
          errorType: fallbackErrorType,
          score: fallbackScore,
          labelSource: fallbackLabelSource || 'rule_fallback_pushup',
        });
      } finally {
        pushupMlPendingRef.current = false;
      }
    },
    [finalizeAttempt]
  );

  useEffect(() => {
    let mounted = true;

    const initPoseModel = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: '/models/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          // Төмен ракурстағы push-up кезінде MediaPipe кейде адамды жоғалтады.
          // Сондықтан confidence сәл төмендетілді: landmarks жиі табылуы үшін.
          minPoseDetectionConfidence: 0.28,
          minPosePresenceConfidence: 0.25,
          minTrackingConfidence: 0.25,
        });

        if (!mounted) return;

        poseLandmarkerRef.current = poseLandmarker;
        setModelStatus('ready');
        setFeedback('Модель позы загружена. Можно включать камеру.');
      } catch (error) {
        console.error('Pose model init error:', error);
        if (!mounted) return;

        setModelStatus('error');
        setFeedback(
          'Камера может работать, но pose model не загрузилась. Проверь файл в public/models.'
        );
      }
    };

    initPoseModel();

    return () => {
      mounted = false;
      void finishBackendSession();

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (poseLandmarkerRef.current?.close) {
        poseLandmarkerRef.current.close();
      }
    };
  }, [finishBackendSession]);

  useEffect(() => {
    setRepCount(0);
    setMetricValue(null);
    attemptCountRef.current = 0;
    correctRepCountRef.current = 0;
    incorrectRepCountRef.current = 0;
    lastAttemptScoreRef.current = null;
    lastLabelSourceRef.current = 'rule';
    lastAttemptFeedbackRef.current = '';
    errorTypeCountsRef.current = {};
    publishCameraSummary();
    cycleStartedRef.current = false;
    cycleHadErrorRef.current = false;
    repCooldownRef.current = 0;
    squatBottomSnapshotRef.current = null;
    latestErrorTypeRef.current = null;
    lastLiveSampleSentAtRef.current = 0;
    squatMlPendingRef.current = false;
    pushupMlPendingRef.current = false;
    lastLandmarksRef.current = null;
    lastOverlayRef.current = null;
    lastPoseSeenAtRef.current = 0;
    lastNoPoseFeedbackAtRef.current = 0;

    stageRef.current = exerciseMode === 'jumping_jacks' ? 'closed' : 'up';
    setStage(exerciseMode === 'jumping_jacks' ? 'closed' : 'up');

    if (exerciseMode === 'jumping_jacks') {
      setMetricLabel('Ширина ног');
      setFeedback('Режим jumping jacks. Нужно разводить ноги шире и поднимать руки вверх.');
    } else if (exerciseMode === 'squat') {
      setMetricLabel('Угол колена');
      setFeedback('Режим squat. Поставь камеру сбоку, чтобы было видно бедро и колено.');
    } else if (exerciseMode === 'pushup') {
      setMetricLabel('Угол локтя');
      setFeedback('Режим push-up. Лучше встать боком к камере.');
    } else if (exerciseMode === 'plank') {
      setMetricLabel('Смещение таза');
      setFeedback('Режим plank. Держи плечи, таз и ноги на одной линии.');
    } else if (exerciseMode === 'high_knees') {
      setMetricLabel('Высота колена');
      setFeedback('Режим high knees. Поднимай колени выше уровня таза.');
    } else if (exerciseMode === 'crunch') {
      setMetricLabel('Угол корпуса');
      setFeedback('Режим crunch. Скручивай корпус сильнее и без рывков.');
    } else if (exerciseMode === 'lunge') {
      setMetricLabel('Угол колена');
      setFeedback('Режим lunge. Лучше встать боком к камере и опускаться глубже.');
    } else {
      setMetricLabel('Landmarks');
      setFeedback('Для этого упражнения пока включён только общий pose tracking.');
    }
  }, [exerciseMode, exerciseName, publishCameraSummary]);

  useEffect(() => {
    if (!cameraOn) {
      prevExerciseNameRef.current = exerciseName;
      return;
    }

    if (!prevExerciseNameRef.current) {
      prevExerciseNameRef.current = exerciseName;
      return;
    }

    if (prevExerciseNameRef.current !== exerciseName) {
      const restartSessionForNewExercise = async () => {
        await finishBackendSession();
        await startBackendSession();
      };

      void restartSessionForNewExercise();
      prevExerciseNameRef.current = exerciseName;
    }
  }, [exerciseName, cameraOn, exerciseMode, startBackendSession, finishBackendSession]);

  const stopCamera = async () => {
    await finishBackendSession();

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    const skeletonCanvas = skeletonCanvasRef.current;
    const hudCanvas = hudCanvasRef.current;
    const skeletonCtx = skeletonCanvas?.getContext('2d');
    const hudCtx = hudCanvas?.getContext('2d');

    if (skeletonCanvas && skeletonCtx) {
      skeletonCtx.clearRect(0, 0, skeletonCanvas.width, skeletonCanvas.height);
    }

    if (hudCanvas && hudCtx) {
      hudCtx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
    }

    lastVideoTimeRef.current = -1;
    targetReachedNotifiedRef.current = false;
    lastLandmarksRef.current = null;
    lastOverlayRef.current = null;
    lastPoseSeenAtRef.current = 0;
    setCameraOn(false);
  };

  const badgeText =
    exerciseMode === 'jumping_jacks'
      ? 'Jumping Jacks coach'
      : exerciseMode === 'squat'
      ? 'Squat coach'
      : exerciseMode === 'pushup'
      ? 'Push-up coach'
      : exerciseMode === 'plank'
      ? 'Plank coach'
      : exerciseMode === 'high_knees'
      ? 'High Knees coach'
      : exerciseMode === 'crunch'
      ? 'Crunch coach'
      : exerciseMode === 'lunge'
      ? 'Lunge coach'
      : 'Camera coach';

  const runAnalyzer = (landmarks) => {
    const currentMode = exerciseModeRef.current;
    const currentIsActive = isActiveRef.current;

    const currentAnalyzerContext = {
      isActive: currentIsActive,
      stageRef,
      setStage,
      setMetricValue,
      setFeedback,
      latestFeaturesRef,
      latestErrorTypeRef,
      cycleStartedRef,
      cycleHadErrorRef,
      finalizeAttempt,
    };

    if (currentMode === 'jumping_jacks') {
      analyzeJumpingJacks({ landmarks, ...currentAnalyzerContext });
      return;
    }

    if (currentMode === 'squat') {
      analyzeSquat({
        landmarks,
        ...currentAnalyzerContext,
        finalizeSquatAttempt: evaluateSquatAttempt,
        repCooldownRef,
        squatBottomSnapshotRef,
      });
      return;
    }

    if (currentMode === 'pushup') {
      analyzePushup({
        landmarks,
        ...currentAnalyzerContext,
        finalizeAttempt: evaluatePushupAttempt,
      });
      return;
    }

    if (currentMode === 'plank') {
      analyzePlank({
        landmarks,
        isActive: currentIsActive,
        setMetricValue,
        setFeedback,
        latestFeaturesRef,
        latestErrorTypeRef,
      });
      return;
    }

    if (currentMode === 'high_knees') {
      analyzeHighKnees({ landmarks, ...currentAnalyzerContext });
      return;
    }

    if (currentMode === 'crunch') {
      analyzeCrunch({ landmarks, ...currentAnalyzerContext });
      return;
    }

    if (currentMode === 'lunge') {
      analyzeLunge({ landmarks, ...currentAnalyzerContext });
      return;
    }

    analyzeGeneric({
      landmarks,
      isActive: currentIsActive,
      setMetricValue,
      setFeedback,
    });
  };

  const buildOverlayPayload = ({
    currentTargetType,
    currentTargetReps,
    currentTargetDurationSeconds,
    currentElapsedWorkSeconds,
    currentCompletionPercent,
    currentIsTargetReached,
  }) => ({
    exerciseName: exerciseName || badgeText,
    repCount: repCountRef.current,
    targetType: currentTargetType,
    targetReps: currentTargetReps,
    targetDurationSeconds: currentTargetDurationSeconds,
    elapsedWorkSeconds: currentElapsedWorkSeconds,
    stage: stageRef.current,
    feedback: feedbackRef.current,
    metricLabel: metricLabelRef.current,
    metricValue: metricValueRef.current,
    errorType: latestErrorTypeRef.current,
    isTargetReached: currentIsTargetReached,
    completionPercent: currentCompletionPercent,
    isActive: isActiveRef.current,
  });

  const processFrame = () => {
    const video = videoRef.current;
    const skeletonCanvas = skeletonCanvasRef.current;
    const hudCanvas = hudCanvasRef.current;
    const poseLandmarker = poseLandmarkerRef.current;

    if (!video || !skeletonCanvas || !hudCanvas) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    if (video.readyState < 2) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const width = video.videoWidth || 960;
    const height = video.videoHeight || 540;

    if (skeletonCanvas.width !== width) skeletonCanvas.width = width;
    if (skeletonCanvas.height !== height) skeletonCanvas.height = height;
    if (hudCanvas.width !== width) hudCanvas.width = width;
    if (hudCanvas.height !== height) hudCanvas.height = height;

    const skeletonCtx = skeletonCanvas.getContext('2d');
    const hudCtx = hudCanvas.getContext('2d');

    if (!skeletonCtx || !hudCtx) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    if (
      modelStatus === 'ready' &&
      poseLandmarker &&
      video.currentTime !== lastVideoTimeRef.current
    ) {
      try {
        let result;

        try {
          result = poseLandmarker.detectForVideo(video, performance.now());
        } catch {
          result = poseLandmarker.detectForVideo(video);
        }

        const landmarks = result?.landmarks?.[0];
        const worldLandmarks = result?.worldLandmarks?.[0] || null;

        const currentTargetType = targetTypeRef.current;
        const currentTargetReps = targetRepsRef.current;
        const currentTargetDurationSeconds = targetDurationSecondsRef.current;
        const currentElapsedWorkSeconds = elapsedWorkSecondsRef.current ?? 0;

        const currentCompletionPercent =
          currentTargetType === 'reps'
            ? currentTargetReps && currentTargetReps > 0
              ? Math.min(100, Math.round((repCountRef.current / currentTargetReps) * 100))
              : 0
            : currentTargetType === 'time'
            ? currentTargetDurationSeconds && currentTargetDurationSeconds > 0
              ? Math.min(
                  100,
                  Math.round(
                    (currentElapsedWorkSeconds / currentTargetDurationSeconds) * 100
                  )
                )
              : 0
            : 0;

        const currentIsTargetReached =
          currentTargetType === 'reps'
            ? Boolean(currentTargetReps && repCountRef.current >= currentTargetReps)
            : currentTargetType === 'time'
            ? Boolean(
                currentTargetDurationSeconds &&
                  currentElapsedWorkSeconds >= currentTargetDurationSeconds
              )
            : false;

        if (landmarks?.length) {
          lastLandmarksRef.current = landmarks;
          lastPoseSeenAtRef.current = performance.now();

          latestFeaturesRef.current = {
            ...buildPoseFeatures(landmarks, worldLandmarks),
            exercise_mode: exerciseModeRef.current,
            phase: stageRef.current,
          };

          runAnalyzer(landmarks);

          const overlayPayload = buildOverlayPayload({
            currentTargetType,
            currentTargetReps,
            currentTargetDurationSeconds,
            currentElapsedWorkSeconds,
            currentCompletionPercent,
            currentIsTargetReached,
          });

          lastOverlayRef.current = overlayPayload;

          const tone = getOverlayTone(
            latestErrorTypeRef.current,
            currentIsTargetReached
          );

          drawPoseSkeleton(skeletonCtx, landmarks, width, height, tone);
          drawHudOverlay(hudCtx, width, height, overlayPayload);

          void sendLiveSample();
        } else {
          const now = performance.now();
          const lastLandmarks = lastLandmarksRef.current;
          const lastOverlay = lastOverlayRef.current;
          const recentlySeen = now - lastPoseSeenAtRef.current < 2500;

          if (lastLandmarks?.length && lastOverlay && recentlySeen) {
            const tone = getOverlayTone(
              latestErrorTypeRef.current,
              lastOverlay.isTargetReached
            );

            drawPoseSkeleton(skeletonCtx, lastLandmarks, width, height, tone);
            drawHudOverlay(hudCtx, width, height, {
              ...lastOverlay,
              feedback: feedbackRef.current || lastOverlay.feedback,
            });
          } else {
            skeletonCtx.clearRect(0, 0, width, height);
            hudCtx.clearRect(0, 0, width, height);

            if (now - lastNoPoseFeedbackAtRef.current > 900) {
              lastNoPoseFeedbackAtRef.current = now;
              setFeedback(getNoPoseFeedback(exerciseModeRef.current));
            }
          }
        }

        lastVideoTimeRef.current = video.currentTime;
      } catch (error) {
        console.error('Pose detect error:', error);
        setFeedback('Ошибка распознавания позы.');
      }
    } else {
      const lastLandmarks = lastLandmarksRef.current;
      const lastOverlay = lastOverlayRef.current;
      const recentlySeen = performance.now() - lastPoseSeenAtRef.current < 2500;

      if (lastLandmarks?.length && lastOverlay && recentlySeen) {
        const tone = getOverlayTone(
          latestErrorTypeRef.current,
          lastOverlay.isTargetReached
        );

        drawPoseSkeleton(skeletonCtx, lastLandmarks, width, height, tone);
        drawHudOverlay(hudCtx, width, height, lastOverlay);
      } else {
        skeletonCtx.clearRect(0, 0, width, height);
        hudCtx.clearRect(0, 0, width, height);
      }
    }

    rafRef.current = requestAnimationFrame(processFrame);
  };

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Браузер не поддерживает доступ к камере');
      }

      let stream = null;
      let lastError = null;

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');

      console.log(
        'Available cameras:',
        videoDevices.map((d, index) => ({
          index,
          label: d.label || `Camera ${index + 1}`,
          deviceId: d.deviceId,
        }))
      );

      const attempts = [];

      videoDevices.forEach((device, index) => {
        if (device.deviceId) {
          attempts.push({
            name: device.label || `Camera ${index + 1}`,
            constraints: {
              video: {
                deviceId: { exact: device.deviceId },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
              audio: false,
            },
          });
        }
      });

      // Телефонмен push-up түсіргенде артқы камера көбіне денені жақсырақ көреді.
      attempts.push({
        name: 'Default environment camera',
        constraints: {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        },
      });

      attempts.push({
        name: 'Default user camera',
        constraints: {
          video: {
            facingMode: { ideal: 'user' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        },
      });

      attempts.push({
        name: 'Default camera',
        constraints: {
          video: true,
          audio: false,
        },
      });

      for (const attempt of attempts) {
        try {
          console.log('Trying camera:', attempt.name);
          stream = await navigator.mediaDevices.getUserMedia(attempt.constraints);
          console.log('Camera opened:', attempt.name);
          break;
        } catch (err) {
          console.warn('Camera attempt failed:', attempt.name, err);
          lastError = err;
        }
      }

      if (!stream) {
        throw lastError || new Error('Камера табылмады немесе ашылмады');
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      lastVideoTimeRef.current = -1;
      lastLandmarksRef.current = null;
      lastOverlayRef.current = null;
      lastPoseSeenAtRef.current = 0;
      lastNoPoseFeedbackAtRef.current = 0;

      setCameraOn(true);
      prevExerciseNameRef.current = exerciseName;
      await startBackendSession();

      rafRef.current = requestAnimationFrame(processFrame);
    } catch (error) {
      console.error('Camera start error:', error);

      if (error?.name === 'NotAllowedError') {
        setFeedback('Камераға рұқсат берілмеді. Chrome ішінде Camera → Allow қой.');
        return;
      }

      if (error?.name === 'NotFoundError') {
        setFeedback('Камера табылмады. Ноутбук камерасы немесе телефон камерасы қосулы екенін тексер.');
        return;
      }

      if (error?.name === 'OverconstrainedError') {
        setFeedback(
          'Chrome таңдалған камераны аша алмады. Chrome Settings → Camera бөлімінен басқа камераны таңда.'
        );
        return;
      }

      setFeedback(`Не удалось открыть камеру: ${error.message || error}`);
    }
  };

  const videoWrapStyle = {
    ...styles.videoWrap,
    maxWidth: isMobileCameraLayout ? 'min(100%, 430px)' : '560px',
    aspectRatio: isMobileCameraLayout ? '9 / 16' : '4 / 3',
    minHeight: isMobileCameraLayout ? 'min(70vh, 620px)' : '360px',
  };

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <div>
          <div style={styles.badge}>{badgeText}</div>
          <h3 style={styles.title}>Камера</h3>
            <p style={styles.subtitle}>
              MediaPipe Pose + Computer Vision: дене нүктелерін анықтау, қозғалысты талдау және feedback көрсету.
            </p>

            <div style={styles.techRow}>
              <span style={styles.techChip}>🧠 MediaPipe Pose</span>
              <span style={styles.techChip}>👁️ Computer Vision</span>

              <span
                style={{
                  ...styles.techChip,
                  ...(modelStatus === 'ready'
                    ? styles.techChipReady
                    : modelStatus === 'error'
                    ? styles.techChipError
                    : styles.techChipLoading),
                }}
              >
                {modelStatus === 'ready'
                  ? 'Model ready'
                  : modelStatus === 'loading'
                  ? 'Loading model'
                  : 'Model error'}
              </span>
            </div>
        </div>

        <div style={styles.actions}>
          {!cameraOn ? (
            <button style={styles.primaryBtn} onClick={startCamera}>
              Включить
            </button>
          ) : (
            <button style={styles.secondaryBtn} onClick={() => void stopCamera()}>
              Остановить
            </button>
          )}
        </div>
      </div>

      <div style={videoWrapStyle}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            ...styles.video,
            transform: cameraTransform,
            transformOrigin: 'center center',
          }}
        />

        <canvas
          ref={skeletonCanvasRef}
          style={{
            ...styles.canvas,
            transform: cameraTransform,
            transformOrigin: 'center center',
          }}
        />

        <canvas ref={hudCanvasRef} style={styles.canvas} />
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>MediaPipe Pose</span>
          <strong style={styles.statValue}>
            {modelStatus === 'ready'
              ? 'Ready'
              : modelStatus === 'loading'
              ? 'Loading'
              : 'Error'}
          </strong>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statLabel}>Повторы</span>
          <strong style={styles.statValue}>{repCount}</strong>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statLabel}>Фаза</span>
          <strong style={styles.statValue}>{stage}</strong>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statLabel}>{metricLabel}</span>
          <strong style={styles.statValue}>{metricValue ?? '—'}</strong>
        </div>
      </div>

      <div style={styles.progressCard}>
        <div style={styles.progressTop}>
          <span style={styles.progressLabel}>Цель</span>

          <strong style={styles.progressValue}>
            {targetType === 'reps'
              ? `${repCount} / ${targetReps ?? '—'}`
              : targetType === 'time'
              ? `${elapsedWorkSeconds} / ${targetDurationSeconds ?? '—'} сек`
              : targetLabel || 'Без цели'}
          </strong>
        </div>

        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressFill,
              width: `${completionPercent ?? 0}%`,
            }}
          />
        </div>

        <div style={styles.progressBottom}>
          <span>{completionPercent ?? 0}% выполнено</span>
          <strong>
            {isTargetReached ? 'Упражнение завершено' : 'Ещё не завершено'}
          </strong>
        </div>
      </div>

      <div style={styles.feedbackBox}>{feedback}</div>

      <div style={styles.helpText}>
        Текущее упражнение: <strong>{exerciseName || 'не выбрано'}</strong>
      </div>
    </div>
  );
}

const styles = {
  panel: {
    width: '100%',
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    color: '#fff',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '14px',
    flexWrap: 'wrap',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 14px',
    borderRadius: '999px',
    background: 'rgba(198, 120, 221, 0.12)',
    border: '1px solid rgba(198, 120, 221, 0.26)',
    color: '#d8a8ea',
    fontSize: '12px',
    fontWeight: 800,
    marginBottom: '12px',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(28px, 5vw, 38px)',
    lineHeight: 1.05,
    fontWeight: 900,
  },
  subtitle: {
    margin: '10px 0 0',
    color: '#aab3c2',
    lineHeight: 1.6,
    fontSize: '15px',
    maxWidth: '420px',
  },
    techRow: {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '12px',
},

techChip: {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '7px 11px',
  borderRadius: '999px',
  background: 'rgba(97, 218, 251, 0.08)',
  border: '1px solid rgba(97, 218, 251, 0.20)',
  color: '#9eeaff',
  fontSize: '11px',
  fontWeight: 900,
  letterSpacing: '0.02em',
  whiteSpace: 'nowrap',
},

techChipReady: {
  background: 'rgba(34, 197, 94, 0.12)',
  border: '1px solid rgba(34, 197, 94, 0.26)',
  color: '#86efac',
},

techChipLoading: {
  background: 'rgba(245, 158, 11, 0.12)',
  border: '1px solid rgba(245, 158, 11, 0.28)',
  color: '#fcd34d',
},

techChipError: {
  background: 'rgba(239, 68, 68, 0.12)',
  border: '1px solid rgba(239, 68, 68, 0.28)',
  color: '#fca5a5',
},
  actions: {
    display: 'flex',
    gap: '10px',
  },
  primaryBtn: {
    border: 'none',
    borderRadius: '16px',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 800,
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #63e0ff 0%, #4e8fff 100%)',
    color: '#0f1720',
  },
  secondaryBtn: {
    borderRadius: '16px',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 800,
    cursor: 'pointer',
    background: 'transparent',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  videoWrap: {
    position: 'relative',
    width: '100%',
    margin: '0 auto',
    background: '#11161f',
    borderRadius: '22px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    display: 'block',
    background: '#000',
    objectFit: 'cover',
  },
  canvas: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '18px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: 0,
  },
  statLabel: {
    color: '#9ea8b8',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 900,
    color: '#fff',
    wordBreak: 'break-word',
  },
  progressCard: {
    borderRadius: '18px',
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  progressTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
  },
  progressLabel: {
    color: '#9ea8b8',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  progressValue: {
    fontSize: '20px',
    fontWeight: 900,
    color: '#fff',
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
    background: 'linear-gradient(90deg, #63e0ff 0%, #4e8fff 100%)',
    transition: 'width 0.25s ease',
  },
  progressBottom: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    color: '#c9d4e4',
    fontSize: '14px',
    flexWrap: 'wrap',
  },
  feedbackBox: {
    borderRadius: '18px',
    padding: '14px 16px',
    background: 'rgba(99, 224, 255, 0.08)',
    border: '1px solid rgba(99, 224, 255, 0.18)',
    color: '#dbefff',
    lineHeight: 1.5,
    fontWeight: 700,
  },
  helpText: {
    color: '#aab3c2',
    fontSize: '14px',
  },
};