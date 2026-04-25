
export const LANDMARKS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

export const detectExerciseMode = (exerciseName = '') => {
  const name = exerciseName.toLowerCase();

  if (
    name.includes('jumping jack') ||
    name.includes('jumping jacks') ||
    name.includes('прыж')
  ) {
    return 'jumping_jacks';
  }

  if (name.includes('squat') || name.includes('присед')) {
    return 'squat';
  }
  if (
  name.includes('plank') ||
  name.includes('планка') ||
  name.includes('планк')
) {
  return 'plank';
}
  if (
  name.includes('high knees') ||
  name.includes('high_knees') ||
  name.includes('колен') ||
  name.includes('высок')
) {
  return 'high_knees';
}
  if (
  name.includes('crunch') ||
  name.includes('reverse crunch') ||
  name.includes('скручив') ||
  name.includes('обратн')
) {
  return 'crunch';
}
  if (
  name.includes('lunge') ||
  name.includes('lunges') ||
  name.includes('выпад')
) {
  return 'lunge';
}

  if (
    name.includes('push-up') ||
    name.includes('push up') ||
    name.includes('pushup') ||
    name.includes('отжим')
  ) {
    return 'pushup';
  }

  return 'generic';
};

export const getAngle = (a, b, c) => {
  if (!a || !b || !c) return null;

  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };

  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
  const magCB = Math.sqrt(cb.x * cb.x + cb.y * cb.y);

  if (!magAB || !magCB) return null;

  const cosine = Math.max(-1, Math.min(1, dot / (magAB * magCB)));
  return Math.round((Math.acos(cosine) * 180) / Math.PI);
};

export const getDistance = (a, b) => {
  if (!a || !b) return null;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const pickBetterSide = (landmarks, leftIdx, rightIdx) => {
  const leftScore = leftIdx.reduce(
    (sum, idx) => sum + (landmarks[idx]?.visibility ?? 0),
    0
  );
  const rightScore = rightIdx.reduce(
    (sum, idx) => sum + (landmarks[idx]?.visibility ?? 0),
    0
  );

  return leftScore >= rightScore ? leftIdx : rightIdx;
};


export const safeLandmark = (points, idx) => {
  if (!points || idx >= points.length) return null;
  return points[idx];
};

export const buildPoseFeatures = (landmarks, worldLandmarks = null) => {
  const wl = worldLandmarks?.length ? worldLandmarks : landmarks;
  const lm = landmarks;

  const lSh = safeLandmark(wl, LANDMARKS.LEFT_SHOULDER);
  const rSh = safeLandmark(wl, LANDMARKS.RIGHT_SHOULDER);
  const lEl = safeLandmark(wl, LANDMARKS.LEFT_ELBOW);
  const rEl = safeLandmark(wl, LANDMARKS.RIGHT_ELBOW);
  const lWr = safeLandmark(wl, LANDMARKS.LEFT_WRIST);
  const rWr = safeLandmark(wl, LANDMARKS.RIGHT_WRIST);
  const lHip = safeLandmark(wl, LANDMARKS.LEFT_HIP);
  const rHip = safeLandmark(wl, LANDMARKS.RIGHT_HIP);
  const lKnee = safeLandmark(wl, LANDMARKS.LEFT_KNEE);
  const rKnee = safeLandmark(wl, LANDMARKS.RIGHT_KNEE);
  const lAnk = safeLandmark(wl, LANDMARKS.LEFT_ANKLE);
  const rAnk = safeLandmark(wl, LANDMARKS.RIGHT_ANKLE);

  const imgLHip = safeLandmark(lm, LANDMARKS.LEFT_HIP);
  const imgRHip = safeLandmark(lm, LANDMARKS.RIGHT_HIP);
  const imgLKnee = safeLandmark(lm, LANDMARKS.LEFT_KNEE);
  const imgRKnee = safeLandmark(lm, LANDMARKS.RIGHT_KNEE);
  const imgLSh = safeLandmark(lm, LANDMARKS.LEFT_SHOULDER);
  const imgRSh = safeLandmark(lm, LANDMARKS.RIGHT_SHOULDER);
  const imgLAnk = safeLandmark(lm, LANDMARKS.LEFT_ANKLE);
  const imgRAnk = safeLandmark(lm, LANDMARKS.RIGHT_ANKLE);

  const leftKneeAngle = getAngle(lHip, lKnee, lAnk);
  const rightKneeAngle = getAngle(rHip, rKnee, rAnk);
  const leftElbowAngle = getAngle(lSh, lEl, lWr);
  const rightElbowAngle = getAngle(rSh, rEl, rWr);
  const leftHipAngle = getAngle(lSh, lHip, lKnee);
  const rightHipAngle = getAngle(rSh, rHip, rKnee);

  const shoulderWidth = getDistance(lSh, rSh);
  const ankleWidth = getDistance(lAnk, rAnk);
  const wristWidth = getDistance(lWr, rWr);

  let leftKneeLift = null;
  let rightKneeLift = null;
  if (imgLHip && imgLKnee) leftKneeLift = imgLHip.y - imgLKnee.y;
  if (imgRHip && imgRKnee) rightKneeLift = imgRHip.y - imgRKnee.y;

  let hipOffset = null;
  if (imgLSh && imgRSh && imgLHip && imgRHip && imgLAnk && imgRAnk) {
    const shoulderY = (imgLSh.y + imgRSh.y) / 2;
    const hipY = (imgLHip.y + imgRHip.y) / 2;
    const ankleY = (imgLAnk.y + imgRAnk.y) / 2;
    hipOffset = Math.abs(hipY - ((shoulderY + ankleY) / 2));
  }

  const features = {
    feature_left_knee_angle: leftKneeAngle,
    feature_right_knee_angle: rightKneeAngle,
    feature_left_elbow_angle: leftElbowAngle,
    feature_right_elbow_angle: rightElbowAngle,
    feature_left_hip_angle: leftHipAngle,
    feature_right_hip_angle: rightHipAngle,
    feature_shoulder_width: shoulderWidth,
    feature_ankle_width: ankleWidth,
    feature_wrist_width: wristWidth,
    feature_left_knee_lift: leftKneeLift,
    feature_right_knee_lift: rightKneeLift,
    feature_hip_offset: hipOffset,
  };

  lm.forEach((point, i) => {
    features[`lm_${i}_x`] = point?.x ?? null;
    features[`lm_${i}_y`] = point?.y ?? null;
    features[`lm_${i}_z`] = point?.z ?? null;
    features[`lm_${i}_visibility`] = point?.visibility ?? null;
  });

  if (worldLandmarks?.length) {
    worldLandmarks.forEach((point, i) => {
      features[`wlm_${i}_x`] = point?.x ?? null;
      features[`wlm_${i}_y`] = point?.y ?? null;
      features[`wlm_${i}_z`] = point?.z ?? null;
      features[`wlm_${i}_visibility`] = point?.visibility ?? null;
    });
  }

  return features;
};


export const analyzeSquat = ({
  landmarks,
  isActive,
  stageRef,
  setStage,
  setMetricValue,
  setFeedback,
  latestFeaturesRef,
  latestErrorTypeRef,
  cycleStartedRef,
  cycleHadErrorRef,
  finalizeAttempt,
  finalizeSquatAttempt,
  repCooldownRef,
  squatBottomSnapshotRef,
}) => {
  const side = pickBetterSide(
    landmarks,
    [LANDMARKS.LEFT_HIP, LANDMARKS.LEFT_KNEE, LANDMARKS.LEFT_ANKLE],
    [LANDMARKS.RIGHT_HIP, LANDMARKS.RIGHT_KNEE, LANDMARKS.RIGHT_ANKLE]
  );

  const hip = landmarks[side[0]];
  const knee = landmarks[side[1]];
  const ankle = landmarks[side[2]];

  const angle = getAngle(hip, knee, ankle);
  if (!angle) return;

  const MIN_VALID_ANGLE = 40;
  const MAX_VALID_ANGLE = 175;
  const DOWN_ANGLE = 105;
  const MID_ANGLE = 135;
  const UP_ANGLE = 155;
  const REP_COOLDOWN_MS = 900;

  if (angle < MIN_VALID_ANGLE || angle > MAX_VALID_ANGLE) {
    return;
  }

  const now = performance.now();

  setMetricValue(angle);
  latestFeaturesRef.current = {
    ...(latestFeaturesRef.current || {}),
    exercise_mode: 'squat',
    knee_angle: angle,
    phase: stageRef.current,
  };

  if (!isActive) {
    cycleStartedRef.current = false;
    cycleHadErrorRef.current = false;
    latestErrorTypeRef.current = null;
    squatBottomSnapshotRef.current = null;
    setFeedback('Сейчас prepare phase. Займи исходную позицию.');
    return;
  }

  if (stageRef.current === 'up' && angle <= DOWN_ANGLE) {
    if (
      repCooldownRef?.current &&
      now - repCooldownRef.current < REP_COOLDOWN_MS
    ) {
      return;
    }

    cycleStartedRef.current = true;
    cycleHadErrorRef.current = false;
    latestErrorTypeRef.current = null;
    stageRef.current = 'down';
    setStage('down');

    const downSnapshot = {
      ...(latestFeaturesRef.current || {}),
      exercise_mode: 'squat',
      knee_angle: angle,
      phase: 'down',
      rep_timestamp_ms: now,
    };
    latestFeaturesRef.current = downSnapshot;
    squatBottomSnapshotRef.current = downSnapshot;

    setFeedback('Нижняя точка зафиксирована. Поднимайся вверх.');
    return;
  }

  if (stageRef.current === 'down' && angle > DOWN_ANGLE && angle < MID_ANGLE) {
    cycleStartedRef.current = true;
    latestErrorTypeRef.current = null;

    if (
      !squatBottomSnapshotRef.current ||
      angle < (squatBottomSnapshotRef.current.knee_angle ?? 999)
    ) {
      const midSnapshot = {
        ...(latestFeaturesRef.current || {}),
        exercise_mode: 'squat',
        knee_angle: angle,
        phase: 'down',
        rep_timestamp_ms: now,
      };
      latestFeaturesRef.current = midSnapshot;
      squatBottomSnapshotRef.current = midSnapshot;
    }

    setFeedback('Поднимайся вверх плавно.');
    return;
  }

  if (stageRef.current === 'up' && angle > DOWN_ANGLE && angle < MID_ANGLE) {
    cycleStartedRef.current = true;
    cycleHadErrorRef.current = true;
    latestErrorTypeRef.current = 'not_low_enough';

    latestFeaturesRef.current = {
      ...(latestFeaturesRef.current || {}),
      exercise_mode: 'squat',
      knee_angle: angle,
      phase: 'mid',
      rep_timestamp_ms: now,
    };

    setFeedback('Опустись ещё чуть ниже.');
    return;
  }

  if (angle >= UP_ANGLE) {
    if (stageRef.current === 'down') {
      if (
        repCooldownRef?.current &&
        now - repCooldownRef.current < REP_COOLDOWN_MS
      ) {
        return;
      }

      stageRef.current = 'up';
      setStage('up');
      if (repCooldownRef) {
        repCooldownRef.current = now;
      }

      const featuresSnapshot =
        squatBottomSnapshotRef.current || {
          ...(latestFeaturesRef.current || {}),
          exercise_mode: 'squat',
          knee_angle: angle,
          phase: 'up',
          rep_timestamp_ms: now,
        };

      latestFeaturesRef.current = featuresSnapshot;

      const fallbackPayload = cycleHadErrorRef.current
        ? {
            fallbackIsCorrect: false,
            fallbackFeedbackText:
              'Повтор с ошибкой: недостаточная глубина приседа.',
            fallbackErrorType: latestErrorTypeRef.current || 'not_low_enough',
            features: featuresSnapshot,
          }
        : {
            fallbackIsCorrect: true,
            fallbackFeedbackText: 'Повтор засчитан.',
            fallbackErrorType: null,
            features: featuresSnapshot,
          };

      cycleStartedRef.current = false;
      cycleHadErrorRef.current = false;
      squatBottomSnapshotRef.current = null;

      if (typeof finalizeSquatAttempt === 'function') {
        setFeedback('ML проверяет присед...');
        void finalizeSquatAttempt(fallbackPayload);
      } else {
        setFeedback(
          fallbackPayload.fallbackIsCorrect
            ? 'Повтор засчитан.'
            : 'Повтор завершён, но с ошибкой.'
        );
        finalizeAttempt({
          isCorrect: fallbackPayload.fallbackIsCorrect,
          feedbackText: fallbackPayload.fallbackFeedbackText,
          errorType: fallbackPayload.fallbackErrorType,
        });
      }
      return;
    }

    if (cycleStartedRef.current) {
      if (
        repCooldownRef?.current &&
        now - repCooldownRef.current < REP_COOLDOWN_MS
      ) {
        return;
      }

      stageRef.current = 'up';
      setStage('up');
      if (repCooldownRef) {
        repCooldownRef.current = now;
      }

      const fallbackPayload = {
        fallbackIsCorrect: false,
        fallbackFeedbackText: 'Попытка не засчитана: неполный присед.',
        fallbackErrorType: latestErrorTypeRef.current || 'range_incomplete',
        features:
          squatBottomSnapshotRef.current || {
            ...(latestFeaturesRef.current || {}),
            exercise_mode: 'squat',
            knee_angle: angle,
            phase: 'up',
            rep_timestamp_ms: now,
          },
      };

      cycleStartedRef.current = false;
      cycleHadErrorRef.current = false;
      squatBottomSnapshotRef.current = null;

      if (typeof finalizeSquatAttempt === 'function') {
        setFeedback('ML проверяет присед...');
        void finalizeSquatAttempt(fallbackPayload);
      } else {
        setFeedback('Попытка не засчитана: присед был неполный.');
        finalizeAttempt({
          isCorrect: false,
          feedbackText: fallbackPayload.fallbackFeedbackText,
          errorType: fallbackPayload.fallbackErrorType,
        });
      }
      return;
    }

    latestErrorTypeRef.current = null;
    setFeedback('Исходная стойка нормальная.');
    return;
  }

  latestErrorTypeRef.current = 'unstable_motion';
  setFeedback('Держи движение плавным и корпус стабильным.');
};

export const analyzePushup = ({
  landmarks,
  isActive,
  stageRef,
  setStage,
  setMetricValue,
  setFeedback,
  latestFeaturesRef,
  latestErrorTypeRef,
  cycleStartedRef,
  cycleHadErrorRef,
  finalizeAttempt,
  finalizeSquatAttempt,
}) => {
  const side = pickBetterSide(
    landmarks,
    [LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_ELBOW, LANDMARKS.LEFT_WRIST],
    [LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_ELBOW, LANDMARKS.RIGHT_WRIST]
  );

  const shoulder = landmarks[side[0]];
  const elbow = landmarks[side[1]];
  const wrist = landmarks[side[2]];

  const angle = getAngle(shoulder, elbow, wrist);
  if (!angle) return;

  setMetricValue(angle);
  latestFeaturesRef.current = {
    exercise_mode: 'pushup',
    elbow_angle: angle,
    phase: stageRef.current,
  };

  if (!isActive) {
    cycleStartedRef.current = false;
    cycleHadErrorRef.current = false;
    latestErrorTypeRef.current = null;
    setFeedback('Сейчас prepare phase. Прими позицию для отжиманий.');
    return;
  }

  if (angle < 95) {
    cycleStartedRef.current = true;
    latestErrorTypeRef.current = null;

    if (stageRef.current !== 'down') {
      stageRef.current = 'down';
      setStage('down');
    }

    latestFeaturesRef.current = {
      exercise_mode: 'pushup',
      elbow_angle: angle,
      phase: 'down',
    };

    setFeedback('Нижняя точка хорошая.');
    return;
  }

  if (angle >= 95 && angle < 135) {
    latestFeaturesRef.current = {
      exercise_mode: 'pushup',
      elbow_angle: angle,
      phase: 'mid',
    };

    if (stageRef.current === 'down') {
      latestErrorTypeRef.current = null;
      setFeedback('Поднимайся вверх плавно.');
      return;
    }

    cycleStartedRef.current = true;
    cycleHadErrorRef.current = true;
    latestErrorTypeRef.current = 'not_low_enough';
    setFeedback('Опустись ещё немного ниже.');
    return;
  }

  if (angle > 155) {
    if (stageRef.current === 'down') {
      stageRef.current = 'up';
      setStage('up');

      latestFeaturesRef.current = {
        exercise_mode: 'pushup',
        elbow_angle: angle,
        phase: 'up',
      };

      if (cycleHadErrorRef.current) {
        setFeedback('Повтор завершён, но с ошибкой.');
        finalizeAttempt({
          isCorrect: false,
          feedbackText: 'Повтор с ошибкой: отжимание было неполным.',
          errorType: latestErrorTypeRef.current || 'not_low_enough',
        });
      } else {
        setFeedback('Повтор засчитан.');
        finalizeAttempt({
          isCorrect: true,
          feedbackText: 'Повтор засчитан.',
          errorType: null,
        });
      }
      return;
    }

    if (cycleStartedRef.current) {
      stageRef.current = 'up';
      setStage('up');

      setFeedback('Попытка не засчитана: отжимание было неполным.');
      finalizeAttempt({
        isCorrect: false,
        feedbackText: 'Попытка не засчитана: неполное отжимание.',
        errorType: latestErrorTypeRef.current || 'range_incomplete',
      });
      return;
    }

    latestErrorTypeRef.current = null;
    setFeedback('Верхняя позиция нормальная.');
    return;
  }

  latestErrorTypeRef.current = 'unstable_motion';
  setFeedback('Старайся держать локоть под контролем.');
};

export const analyzeJumpingJacks = ({
  landmarks,
  isActive,
  stageRef,
  setStage,
  setMetricValue,
  setFeedback,
  latestFeaturesRef,
  latestErrorTypeRef,
  cycleStartedRef,
  cycleHadErrorRef,
  finalizeAttempt,
  finalizeSquatAttempt,
}) => {
  const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
  const leftWrist = landmarks[LANDMARKS.LEFT_WRIST];
  const rightWrist = landmarks[LANDMARKS.RIGHT_WRIST];
  const leftAnkle = landmarks[LANDMARKS.LEFT_ANKLE];
  const rightAnkle = landmarks[LANDMARKS.RIGHT_ANKLE];

  if (
    !leftShoulder ||
    !rightShoulder ||
    !leftWrist ||
    !rightWrist ||
    !leftAnkle ||
    !rightAnkle
  ) {
    return;
  }

  const anklesDistance = getDistance(leftAnkle, rightAnkle);
  if (!anklesDistance) return;

  const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const handsUp = leftWrist.y < shoulderY && rightWrist.y < shoulderY;
  const handsDown = leftWrist.y > shoulderY && rightWrist.y > shoulderY;
  const legsWide = anklesDistance > 0.35;
  const legsClosed = anklesDistance < 0.18;

  const distanceRounded = Number(anklesDistance.toFixed(4));
  setMetricValue(distanceRounded);

  latestFeaturesRef.current = {
    exercise_mode: 'jumping_jacks',
    ankles_distance: distanceRounded,
    hands_up: handsUp,
    hands_down: handsDown,
    legs_wide: legsWide,
    legs_closed: legsClosed,
    phase: stageRef.current,
  };

  if (!isActive) {
    cycleStartedRef.current = false;
    cycleHadErrorRef.current = false;
    latestErrorTypeRef.current = null;
    setFeedback('Сейчас prepare phase. Встань ровно и приготовься к jumping jacks.');
    return;
  }

  if (handsUp && legsWide) {
    cycleStartedRef.current = true;

    if (stageRef.current !== 'open') {
      stageRef.current = 'open';
      setStage('open');
    }

    latestFeaturesRef.current = {
      exercise_mode: 'jumping_jacks',
      ankles_distance: distanceRounded,
      hands_up: handsUp,
      hands_down: handsDown,
      legs_wide: legsWide,
      legs_closed: legsClosed,
      phase: 'open',
    };

    latestErrorTypeRef.current = null;
    setFeedback('Хорошее раскрытие рук и ног.');
    return;
  }

  if (handsDown && legsClosed) {
    if (stageRef.current === 'open') {
      stageRef.current = 'closed';
      setStage('closed');

      latestFeaturesRef.current = {
        exercise_mode: 'jumping_jacks',
        ankles_distance: distanceRounded,
        hands_up: handsUp,
        hands_down: handsDown,
        legs_wide: legsWide,
        legs_closed: legsClosed,
        phase: 'closed',
      };

      if (cycleHadErrorRef.current) {
        setFeedback('Попытка завершена, но с ошибкой.');
        finalizeAttempt({
          isCorrect: false,
          feedbackText: 'Попытка с ошибкой: jumping jacks выполнен не полностью.',
          errorType: latestErrorTypeRef.current || 'unsynced_motion',
        });
      } else {
        setFeedback('Повтор jumping jacks засчитан.');
        finalizeAttempt({
          isCorrect: true,
          feedbackText: 'Повтор jumping jacks засчитан.',
          errorType: null,
        });
      }
      return;
    }

    if (cycleStartedRef.current) {
      stageRef.current = 'closed';
      setStage('closed');

      setFeedback('Попытка не засчитана: раскрытие было неполным.');
      finalizeAttempt({
        isCorrect: false,
        feedbackText: 'Попытка не засчитана: jumping jacks неполный.',
        errorType: latestErrorTypeRef.current || 'range_incomplete',
      });
      return;
    }

    latestErrorTypeRef.current = null;
    setFeedback('Исходная позиция нормальная.');
    return;
  }

  if (handsUp && !legsWide) {
    cycleStartedRef.current = true;
    cycleHadErrorRef.current = true;
    latestErrorTypeRef.current = 'legs_not_wide_enough';
    setFeedback('Разводи ноги шире.');
    return;
  }

  if (!handsUp && legsWide) {
    cycleStartedRef.current = true;
    cycleHadErrorRef.current = true;
    latestErrorTypeRef.current = 'hands_not_up';
    setFeedback('Поднимай руки выше.');
    return;
  }

  if (handsUp || legsWide) {
    cycleStartedRef.current = true;
    cycleHadErrorRef.current = true;
    latestErrorTypeRef.current = 'unsynced_motion';
    setFeedback('Делай движение шире и синхронно руками и ногами.');
    return;
  }

  latestErrorTypeRef.current = null;
  setFeedback('Исходная позиция нормальная.');
};
export const analyzePlank = ({
  landmarks,
  isActive,
  setMetricValue,
  setFeedback,
  latestFeaturesRef,
  latestErrorTypeRef,
}) => {
  const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
  const leftHip = landmarks[LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
  const leftAnkle = landmarks[LANDMARKS.LEFT_ANKLE];
  const rightAnkle = landmarks[LANDMARKS.RIGHT_ANKLE];

  if (
    !leftShoulder ||
    !rightShoulder ||
    !leftHip ||
    !rightHip ||
    !leftAnkle ||
    !rightAnkle
  ) {
    return;
  }

  const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const hipY = (leftHip.y + rightHip.y) / 2;
  const ankleY = (leftAnkle.y + rightAnkle.y) / 2;

  const hipOffset = Math.abs(hipY - ((shoulderY + ankleY) / 2));
  const offsetRounded = Number(hipOffset.toFixed(4));

  setMetricValue(offsetRounded);

  latestFeaturesRef.current = {
    exercise_mode: 'plank',
    shoulder_y: Number(shoulderY.toFixed(4)),
    hip_y: Number(hipY.toFixed(4)),
    ankle_y: Number(ankleY.toFixed(4)),
    hip_offset: offsetRounded,
  };

  if (!isActive) {
    latestErrorTypeRef.current = null;
    setFeedback('Сейчас prepare phase. Прими позицию для планки.');
    return;
  }

  if (hipOffset < 0.05) {
    latestErrorTypeRef.current = null;
    setFeedback('Планка ровная. Держи корпус стабильно.');
    return;
  }

  if (hipY < shoulderY && hipOffset >= 0.05) {
    latestErrorTypeRef.current = 'hips_too_high';
    setFeedback('Таз слишком высоко. Опусти корпус чуть ниже.');
    return;
  }

  if (hipY > ankleY - 0.02 && hipOffset >= 0.05) {
    latestErrorTypeRef.current = 'hips_too_low';
    setFeedback('Таз провисает. Подтяни пресс и подними таз чуть выше.');
    return;
  }

  latestErrorTypeRef.current = 'body_not_straight';
  setFeedback('Старайся держать тело по одной линии.');
};

export const analyzeHighKnees = ({
  landmarks,
  isActive,
  stageRef,
  setStage,
  setMetricValue,
  setFeedback,
  latestFeaturesRef,
  latestErrorTypeRef,
  cycleStartedRef,
  cycleHadErrorRef,
  finalizeAttempt,
  finalizeSquatAttempt,
}) => {
  const leftHip = landmarks[LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
  const leftKnee = landmarks[LANDMARKS.LEFT_KNEE];
  const rightKnee = landmarks[LANDMARKS.RIGHT_KNEE];

  if (!leftHip || !rightHip || !leftKnee || !rightKnee) {
    return;
  }

  const leftLift = leftHip.y - leftKnee.y;
  const rightLift = rightHip.y - rightKnee.y;
  const bestLift = Math.max(leftLift, rightLift);
  const liftRounded = Number(bestLift.toFixed(4));

  setMetricValue(liftRounded);

  latestFeaturesRef.current = {
    exercise_mode: 'high_knees',
    left_knee_lift: Number(leftLift.toFixed(4)),
    right_knee_lift: Number(rightLift.toFixed(4)),
    best_knee_lift: liftRounded,
    phase: stageRef.current,
  };

  if (!isActive) {
    cycleStartedRef.current = false;
    cycleHadErrorRef.current = false;
    latestErrorTypeRef.current = null;
    setFeedback('Сейчас prepare phase. Приготовься к high knees.');
    return;
  }

  const kneeHighEnough = bestLift > 0.08;
  const kneeLow = bestLift < 0.03;

  if (kneeHighEnough) {
    cycleStartedRef.current = true;
    latestErrorTypeRef.current = null;

    if (stageRef.current !== 'up') {
      stageRef.current = 'up';
      setStage('up');
    }

    latestFeaturesRef.current = {
      exercise_mode: 'high_knees',
      left_knee_lift: Number(leftLift.toFixed(4)),
      right_knee_lift: Number(rightLift.toFixed(4)),
      best_knee_lift: liftRounded,
      phase: 'up',
    };

    setFeedback('Колено поднято достаточно высоко.');
    return;
  }

  if (bestLift >= 0.04 && bestLift <= 0.08) {
    cycleStartedRef.current = true;
    cycleHadErrorRef.current = true;
    latestErrorTypeRef.current = 'knee_not_high_enough';

    latestFeaturesRef.current = {
      exercise_mode: 'high_knees',
      left_knee_lift: Number(leftLift.toFixed(4)),
      right_knee_lift: Number(rightLift.toFixed(4)),
      best_knee_lift: liftRounded,
      phase: 'mid',
    };

    setFeedback('Поднимай колено выше.');
    return;
  }

  if (kneeLow) {
    if (stageRef.current === 'up') {
      stageRef.current = 'down';
      setStage('down');

      latestFeaturesRef.current = {
        exercise_mode: 'high_knees',
        left_knee_lift: Number(leftLift.toFixed(4)),
        right_knee_lift: Number(rightLift.toFixed(4)),
        best_knee_lift: liftRounded,
        phase: 'down',
      };

      if (cycleHadErrorRef.current) {
        setFeedback('Шаг завершён, но с ошибкой.');
        finalizeAttempt({
          isCorrect: false,
          feedbackText: 'High knees: колено поднято недостаточно высоко.',
          errorType: latestErrorTypeRef.current || 'knee_not_high_enough',
        });
      } else {
        setFeedback('Шаг high knees засчитан.');
        finalizeAttempt({
          isCorrect: true,
          feedbackText: 'Шаг high knees засчитан.',
          errorType: null,
        });
      }
      return;
    }

    latestErrorTypeRef.current = null;
    setFeedback('Исходная позиция нормальная.');
    return;
  }

  latestErrorTypeRef.current = 'unstable_motion';
  setFeedback('Двигайся ритмично и поднимай колени выше.');
};

export const analyzeCrunch = ({
  landmarks,
  isActive,
  stageRef,
  setStage,
  setMetricValue,
  setFeedback,
  latestFeaturesRef,
  latestErrorTypeRef,
  cycleStartedRef,
  cycleHadErrorRef,
  finalizeAttempt,
  finalizeSquatAttempt,
}) => {
  const side = pickBetterSide(
    landmarks,
    [LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_HIP, LANDMARKS.LEFT_KNEE],
    [LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_HIP, LANDMARKS.RIGHT_KNEE]
  );

  const shoulder = landmarks[side[0]];
  const hip = landmarks[side[1]];
  const knee = landmarks[side[2]];

  if (!shoulder || !hip || !knee) {
    return;
  }

  const hipAngle = getAngle(shoulder, hip, knee);
  const shoulderKneeDistance = getDistance(shoulder, knee);

  if (!hipAngle || !shoulderKneeDistance) {
    return;
  }

  const distanceRounded = Number(shoulderKneeDistance.toFixed(4));
  setMetricValue(hipAngle);

  latestFeaturesRef.current = {
    exercise_mode: 'crunch',
    hip_angle: hipAngle,
    shoulder_knee_distance: distanceRounded,
    phase: stageRef.current,
  };

  if (!isActive) {
    cycleStartedRef.current = false;
    cycleHadErrorRef.current = false;
    latestErrorTypeRef.current = null;
    setFeedback('Сейчас prepare phase. Прими позицию для crunch.');
    return;
  }

  const compactEnough = hipAngle < 110 || shoulderKneeDistance < 0.20;
  const midRange =
    (hipAngle >= 110 && hipAngle < 145) ||
    (shoulderKneeDistance >= 0.20 && shoulderKneeDistance < 0.28);
  const backDown = hipAngle > 150 && shoulderKneeDistance >= 0.28;

  if (compactEnough) {
    cycleStartedRef.current = true;
    latestErrorTypeRef.current = null;

    if (stageRef.current !== 'up') {
      stageRef.current = 'up';
      setStage('up');
    }

    latestFeaturesRef.current = {
      exercise_mode: 'crunch',
      hip_angle: hipAngle,
      shoulder_knee_distance: distanceRounded,
      phase: 'up',
    };

    setFeedback('Хорошее сжатие в верхней точке.');
    return;
  }

  if (midRange) {
    cycleStartedRef.current = true;
    cycleHadErrorRef.current = true;
    latestErrorTypeRef.current = 'not_compact_enough';

    latestFeaturesRef.current = {
      exercise_mode: 'crunch',
      hip_angle: hipAngle,
      shoulder_knee_distance: distanceRounded,
      phase: 'mid',
    };

    setFeedback('Подкручивай корпус сильнее.');
    return;
  }

  if (backDown) {
    if (stageRef.current === 'up') {
      stageRef.current = 'down';
      setStage('down');

      latestFeaturesRef.current = {
        exercise_mode: 'crunch',
        hip_angle: hipAngle,
        shoulder_knee_distance: distanceRounded,
        phase: 'down',
      };

      if (cycleHadErrorRef.current) {
        setFeedback('Повтор завершён, но с ошибкой.');
        finalizeAttempt({
          isCorrect: false,
          feedbackText: 'Crunch выполнен не полностью.',
          errorType: latestErrorTypeRef.current || 'not_compact_enough',
        });
      } else {
        setFeedback('Повтор crunch засчитан.');
        finalizeAttempt({
          isCorrect: true,
          feedbackText: 'Повтор crunch засчитан.',
          errorType: null,
        });
      }
      return;
    }

    if (cycleStartedRef.current) {
      stageRef.current = 'down';
      setStage('down');

      setFeedback('Попытка не засчитана: амплитуда была неполной.');
      finalizeAttempt({
        isCorrect: false,
        feedbackText: 'Попытка не засчитана: неполный crunch.',
        errorType: latestErrorTypeRef.current || 'range_incomplete',
      });
      return;
    }

    latestErrorTypeRef.current = null;
    setFeedback('Исходная позиция нормальная.');
    return;
  }

  latestErrorTypeRef.current = 'unstable_motion';
  setFeedback('Двигайся плавно и подкручивай корпус без рывков.');
}

export const analyzeLunge = ({
  landmarks,
  isActive,
  stageRef,
  setStage,
  setMetricValue,
  setFeedback,
  latestFeaturesRef,
  latestErrorTypeRef,
  cycleStartedRef,
  cycleHadErrorRef,
  finalizeAttempt,
  finalizeSquatAttempt,
}) => {
  const side = pickBetterSide(
    landmarks,
    [LANDMARKS.LEFT_HIP, LANDMARKS.LEFT_KNEE, LANDMARKS.LEFT_ANKLE],
    [LANDMARKS.RIGHT_HIP, LANDMARKS.RIGHT_KNEE, LANDMARKS.RIGHT_ANKLE]
  );

  const hip = landmarks[side[0]];
  const knee = landmarks[side[1]];
  const ankle = landmarks[side[2]];

  const angle = getAngle(hip, knee, ankle);
  if (!angle) return;

  setMetricValue(angle);
  latestFeaturesRef.current = {
    exercise_mode: 'lunge',
    knee_angle: angle,
    phase: stageRef.current,
  };

  if (!isActive) {
    cycleStartedRef.current = false;
    cycleHadErrorRef.current = false;
    latestErrorTypeRef.current = null;
    setFeedback('Сейчас prepare phase. Прими позицию для выпадов.');
    return;
  }

  if (angle < 105) {
    cycleStartedRef.current = true;
    latestErrorTypeRef.current = null;

    if (stageRef.current !== 'down') {
      stageRef.current = 'down';
      setStage('down');
    }

    latestFeaturesRef.current = {
      exercise_mode: 'lunge',
      knee_angle: angle,
      phase: 'down',
    };

    setFeedback('Хорошая нижняя точка выпада.');
    return;
  }

  if (angle >= 105 && angle < 140) {
    latestFeaturesRef.current = {
      exercise_mode: 'lunge',
      knee_angle: angle,
      phase: 'mid',
    };

    if (stageRef.current === 'down') {
      latestErrorTypeRef.current = null;
      setFeedback('Поднимайся вверх плавно.');
      return;
    }

    cycleStartedRef.current = true;
    cycleHadErrorRef.current = true;
    latestErrorTypeRef.current = 'not_low_enough';
    setFeedback('Опустись ниже, чтобы колено согнулось сильнее.');
    return;
  }

  if (angle > 160) {
    if (stageRef.current === 'down') {
      stageRef.current = 'up';
      setStage('up');

      latestFeaturesRef.current = {
        exercise_mode: 'lunge',
        knee_angle: angle,
        phase: 'up',
      };

      if (cycleHadErrorRef.current) {
        setFeedback('Выпад завершён, но с ошибкой.');
        finalizeAttempt({
          isCorrect: false,
          feedbackText: 'Выпад выполнен не полностью.',
          errorType: latestErrorTypeRef.current || 'not_low_enough',
        });
      } else {
        setFeedback('Повтор выпада засчитан.');
        finalizeAttempt({
          isCorrect: true,
          feedbackText: 'Повтор выпада засчитан.',
          errorType: null,
        });
      }
      return;
    }

    if (cycleStartedRef.current) {
      stageRef.current = 'up';
      setStage('up');

      setFeedback('Попытка не засчитана: выпад был неполный.');
      finalizeAttempt({
        isCorrect: false,
        feedbackText: 'Попытка не засчитана: неполный выпад.',
        errorType: latestErrorTypeRef.current || 'range_incomplete',
      });
      return;
    }

    latestErrorTypeRef.current = null;
    setFeedback('Исходная позиция нормальная.');
    return;
  }

  latestErrorTypeRef.current = 'unstable_motion';
  setFeedback('Держи движение стабильно и контролируй колено.');
};

export const analyzeGeneric = ({
  landmarks,
  isActive,
  setMetricValue,
  setFeedback,
}) => {
  setMetricValue(landmarks.length || 0);

  if (!isActive) {
    setFeedback('Сейчас prepare phase. Камера уже видит твою позу.');
    return;
  }

  setFeedback(
    'Поза отслеживается. Для этого упражнения правила техники добавим следующим шагом.'
  );
};