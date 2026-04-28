import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import WorkoutEngine from './WorkoutEngine';
import { supabase } from '../../lib/supabaseClient';

import fullImg from './photo/full.jpg';
import absImg from './photo/abs.jpg';
import armsImg from './photo/arms.jpg';
import legsImg from './photo/legs.jpg';

const getVideoUrl = (path) =>
  supabase.storage.from('exercise-videos').getPublicUrl(path).data.publicUrl;


const CAMERA_EXERCISE_META = {
  // Full body / cardio
  jumpingJacks: { cameraMode: 'jumping_jacks', reps: '20 reps', workSeconds: 40 },
  highKnees: { cameraMode: 'high_knees', reps: '20 reps', workSeconds: 35 },
  run: { cameraMode: 'high_knees', reps: '20 reps', workSeconds: 35 },

  // Squat
  squatLegRaise: { cameraMode: 'squat', reps: '10 reps', workSeconds: 45 },
  squat1: { cameraMode: 'squat', reps: '10 reps', workSeconds: 45 },
  squat2: { cameraMode: 'squat', reps: '10 reps', workSeconds: 45 },

  // Lunge
  lungeTwist: { cameraMode: 'lunge', reps: '10 reps', workSeconds: 40 },
  lunge1: { cameraMode: 'lunge', reps: '10 reps', workSeconds: 40 },
  lunge2: { cameraMode: 'lunge', reps: '10 reps', workSeconds: 40 },

  // Push-up
  push1: { cameraMode: 'pushup', reps: '8 reps', workSeconds: 40 },
  push2: { cameraMode: 'pushup', reps: '8 reps', workSeconds: 40 },
  push3: { cameraMode: 'pushup', reps: '8 reps', workSeconds: 40 },

  // Core / abs
  plankClassic: { cameraMode: 'plank' },
  sitUps: { cameraMode: 'crunch', reps: '12 reps', workSeconds: 35 },
  reverseCrunch: { cameraMode: 'crunch', reps: '12 reps', workSeconds: 35 },
  crunches: { cameraMode: 'crunch', reps: '12 reps', workSeconds: 35 },
  bicycle: { cameraMode: 'crunch', reps: '16 reps', workSeconds: 35 },
  legRaise: { cameraMode: 'crunch', reps: '12 reps', workSeconds: 35 },
};

const applyCameraAnalysisMeta = (exercise) => {
  const meta = CAMERA_EXERCISE_META[exercise.key];

  if (!meta) {
    return exercise;
  }

  return {
    ...exercise,
    ...meta,
    analysisEnabled: true,
  };
};

const LoseWeightWorkout = ({ onAllStepsComplete, onBack }) => {
  const { t } = useTranslation();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);

  const timedReps = useCallback(
    (seconds = 30) => `${seconds} ${t('training.seconds')}`,
    [t]
  );

  useEffect(() => {
    if (!selectedBodyPart) return;

    const fetchLoseWeightExercises = async () => {
      setLoading(true);

      try {
        let prepared = [];

        if (selectedBodyPart === 'full') {
          prepared = [
            {
              name: t('training.lose.full.armCircles.title'),
              description: t('training.lose.full.armCircles.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('fullbody/krug-rukami.mp4'),
              muscles: [t('training.labels.shoulders'), t('training.labels.arms')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'jumpingJacks',
              name: t('training.lose.full.jumpingJacks.title'),
              description: t('training.lose.full.jumpingJacks.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('fullbody/pryzhki-jumping-jacks.mp4'),
              muscles: [t('training.labels.legs'), t('training.labels.core'), t('training.labels.cardio')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'highKnees',
              name: t('training.lose.full.highKnees.title'),
              description: t('training.lose.full.highKnees.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('fullbody/beg-koleni-vverh.mp4'),
              muscles: [t('training.labels.legs'), t('training.labels.core'), t('training.labels.cardio')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'squatLegRaise',
              name: t('training.lose.full.squatLegRaise.title'),
              description: t('training.lose.full.squatLegRaise.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('fullbody/prisedanie-podem-nog.mp4'),
              muscles: [t('training.labels.legs'), t('training.labels.glutes'), t('training.labels.core')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'lungeTwist',
              name: t('training.lose.full.lungeTwist.title'),
              description: t('training.lose.full.lungeTwist.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('fullbody/vypad-so-skruchivaniem.mp4'),
              muscles: [t('training.labels.legs'), t('training.labels.core'), t('training.labels.glutes')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              name: t('training.lose.full.modifiedBurpees.title'),
              description: t('training.lose.full.modifiedBurpees.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('fullbody/izmenennye-berpi.mp4'),
              muscles: [t('training.labels.wholeBody'), t('training.labels.cardio'), t('training.labels.core')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              name: t('training.lose.full.plankJacks.title'),
              description: t('training.lose.full.plankJacks.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('fullbody/pryzhki-v-planke.mp4'),
              muscles: [t('training.labels.core'), t('training.labels.shoulders'), t('training.labels.legs')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'bicycle',
              name: t('training.lose.full.bicycle.title'),
              description: t('training.lose.full.bicycle.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('fullbody/velosiped.mp4'),
              muscles: [t('training.labels.abs'), t('training.labels.obliques')],
              equipment: t('training.labels.mat'),
            },
            {
              key: 'reverseCrunch',
              name: t('training.lose.full.reverseCrunch.title'),
              description: t('training.lose.full.reverseCrunch.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('fullbody/obratnye-skruchivaniya.mp4'),
              muscles: [t('training.labels.abs'), t('training.labels.core')],
              equipment: t('training.labels.mat'),
            },
            {
              name: t('training.lose.full.cobraStretch.title'),
              description: t('training.lose.full.cobraStretch.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('fullbody/rastyazhka-kobra.mp4'),
              muscles: [t('training.labels.abs'), t('training.labels.back')],
              equipment: t('training.labels.mat'),
            },
          ];
        }

        if (selectedBodyPart === 'abs') {
          prepared = [
            {
              key: 'plankClassic',
              name: t('training.lose.abs.plankClassic.title'),
              description: t('training.lose.abs.plankClassic.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('abs/planka-klassicheskaya.mp4'),
              muscles: [t('training.labels.core'), t('training.labels.abs')],
              equipment: t('training.labels.mat'),
            },
            {
              name: t('training.lose.abs.mountainClimbers.title'),
              description: t('training.lose.abs.mountainClimbers.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('abs/planka-s-podemom-nog.mp4'),
              muscles: [t('training.labels.core'), t('training.labels.abs'), t('training.labels.glutes')],
              equipment: t('training.labels.mat'),
            },
            {
              key: 'sitUps',
              name: t('training.lose.abs.sitUps.title'),
              description: t('training.lose.abs.sitUps.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('abs/podem-korpusa-v-sed.mp4'),
              muscles: [t('training.labels.abs')],
              equipment: t('training.labels.mat'),
            },
            {
              key: 'reverseCrunch',
              name: t('training.lose.abs.reverseCrunch.title'),
              description: t('training.lose.abs.reverseCrunch.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('abs/obratnye-skruchivaniya.mp4'),
              muscles: [t('training.labels.abs'), t('training.labels.core')],
              equipment: t('training.labels.mat'),
            },
            {
              key: 'crunches',
              name: t('training.lose.abs.crunches.title'),
              description: t('training.lose.abs.crunches.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('abs/skruchivaniya.mp4'),
              muscles: [t('training.labels.abs')],
              equipment: t('training.labels.mat'),
            },
            {
              key: 'bicycle',
              name: t('training.lose.abs.bicycle.title'),
              description: t('training.lose.abs.bicycle.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('abs/velosiped.mp4'),
              muscles: [t('training.labels.abs'), t('training.labels.obliques')],
              equipment: t('training.labels.mat'),
            },
            {
              name: t('training.lose.abs.heelTouches.title'),
              description: t('training.lose.abs.heelTouches.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('abs/kasanie-pyatok.mp4'),
              muscles: [t('training.labels.obliques'), t('training.labels.abs')],
              equipment: t('training.labels.mat'),
            },
            {
              key: 'legRaise',
              name: t('training.lose.abs.legRaise.title'),
              description: t('training.lose.abs.legRaise.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('abs/podem-nog-lezha.mp4'),
              muscles: [t('training.labels.lowerAbs'), t('training.labels.abs')],
              equipment: t('training.labels.mat'),
            },
            {
              name: t('training.lose.abs.hollowHold.title'),
              description: t('training.lose.abs.hollowHold.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('abs/ugolok.mp4'),
              muscles: [t('training.labels.core'), t('training.labels.abs')],
              equipment: t('training.labels.mat'),
            },
            {
              name: t('training.lose.abs.cobraStretch.title'),
              description: t('training.lose.abs.cobraStretch.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('abs/rastyazhka-kobra.mp4'),
              muscles: [t('training.labels.abs'), t('training.labels.back')],
              equipment: t('training.labels.mat'),
            },
          ];
        }

        if (selectedBodyPart === 'legs') {
          prepared = [
            {
              key: 'run',
              name: t('training.lose.legs.run.title'),
              description: t('training.lose.legs.run.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('legs/beg-koleni-vverh.mp4'),
              muscles: [t('training.labels.legs'), t('training.labels.core'), t('training.labels.cardio')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              name: t('training.lose.legs.heel.title'),
              description: t('training.lose.legs.heel.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('legs/zahlyost-goleni.mp4'),
              muscles: [t('training.labels.legs'), t('training.labels.cardio')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              name: t('training.lose.legs.jump2.title'),
              description: t('training.lose.legs.jump2.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('legs/prizhki.mp4'),
              muscles: [t('training.labels.legs'), t('training.labels.cardio')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              name: t('training.lose.legs.jump1.title'),
              description: t('training.lose.legs.jump1.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('legs/prizhki-iz-planki.mp4'),
              muscles: [t('training.labels.legs'), t('training.labels.core'), t('training.labels.shoulders')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              name: t('training.lose.legs.burpee.title'),
              description: t('training.lose.legs.burpee.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('legs/burpi.mp4'),
              muscles: [t('training.labels.wholeBody'), t('training.labels.cardio')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'squat1',
              name: t('training.lose.legs.squat1.title'),
              description: t('training.lose.legs.squat1.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('legs/korotkie-prisedaniya.mp4'),
              muscles: [t('training.labels.quadriceps'), t('training.labels.glutes')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'squat2',
              name: t('training.lose.legs.squat2.title'),
              description: t('training.lose.legs.squat2.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('legs/vprisyadku.mp4'),
              muscles: [t('training.labels.legs'), t('training.labels.glutes'), t('training.labels.core')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'lunge1',
              name: t('training.lose.legs.lunge1.title'),
              description: t('training.lose.legs.lunge1.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('legs/vypad-nazad.mp4'),
              muscles: [t('training.labels.glutes'), t('training.labels.quadriceps')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'lunge2',
              name: t('training.lose.legs.lunge2.title'),
              description: t('training.lose.legs.lunge2.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('legs/vypady-v-storonu.mp4'),
              muscles: [t('training.labels.legs'), t('training.labels.glutes')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              name: t('training.lose.legs.quad1.title'),
              description: t('training.lose.legs.quad1.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('legs/rastyazhka-kvadriceps-levo.mp4'),
              muscles: [t('training.labels.quadriceps')],
              equipment: t('training.labels.noEquipment'),
            },
          ];
        }

        if (selectedBodyPart === 'arms') {
          prepared = [
            {
              name: t('training.lose.arms.warmup3.title'),
              description: t('training.lose.arms.warmup3.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('arms/prizhki-bez-skakalki.mp4'),
              muscles: [t('training.labels.cardio'), t('training.labels.legs'), t('training.labels.core')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              name: t('training.lose.arms.warmup1.title'),
              description: t('training.lose.arms.warmup1.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('arms/mahi-rukami-po-chasovoy.mp4'),
              muscles: [t('training.labels.shoulders')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              name: t('training.lose.arms.warmup2.title'),
              description: t('training.lose.arms.warmup2.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('arms/mahi-rukami-protiv-chasovoy.mp4'),
              muscles: [t('training.labels.shoulders')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'push1',
              name: t('training.lose.arms.push1.title'),
              description: t('training.lose.arms.push1.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('arms/otzhimaniya-s-kolenei-s-zaderzhkoy.mp4'),
              muscles: [t('training.labels.chest'), t('training.labels.triceps'), t('training.labels.shoulders')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'push2',
              name: t('training.lose.arms.push2.title'),
              description: t('training.lose.arms.push2.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('arms/voennye-otzhimaniya.mp4'),
              muscles: [t('training.labels.triceps'), t('training.labels.shoulders'), t('training.labels.chest')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'push3',
              name: t('training.lose.arms.push3.title'),
              description: t('training.lose.arms.push3.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('arms/otzhimaniya-s-povorotom.mp4'),
              muscles: [t('training.labels.triceps'), t('training.labels.core'), t('training.labels.shoulders')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              name: t('training.lose.arms.box.title'),
              description: t('training.lose.arms.box.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('arms/bokovye-udary.mp4'),
              muscles: [t('training.labels.shoulders'), t('training.labels.arms'), t('training.labels.cardio')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              name: t('training.lose.arms.arms1.title'),
              description: t('training.lose.arms.arms1.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('arms/svedenie-loktey.mp4'),
              muscles: [t('training.labels.arms'), t('training.labels.shoulders')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              name: t('training.lose.arms.burpee.title'),
              description: t('training.lose.arms.burpee.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('arms/burpi.mp4'),
              muscles: [t('training.labels.wholeBody'), t('training.labels.cardio')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              name: t('training.lose.arms.stretch3.title'),
              description: t('training.lose.arms.stretch3.desc'),
              reps: timedReps(30),
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('arms/rastyazhka-biceps.mp4'),
              muscles: [t('training.labels.biceps')],
              equipment: t('training.labels.noEquipment'),
            },
          ];
        }

        setExercises(prepared.map(applyCameraAnalysisMeta));
      } catch (err) {
        console.error('Workout loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoseWeightExercises();
  }, [selectedBodyPart, t, timedReps]);

  const selectedBodyPartLabel = (id) => {
    if (id === 'full') return t('training.bodyParts.full');
    if (id === 'abs') return t('training.bodyParts.abs');
    if (id === 'arms') return t('training.bodyParts.arms');
    if (id === 'legs') return t('training.bodyParts.legs');
    return '';
  };

  const bodyPartCards = [
    {
      id: 'full',
      icon: '🔥',
      title: t('training.bodyParts.full'),
      image: fullImg,
      accent: 'orange',
    },
    {
      id: 'abs',
      icon: '⚡',
      title: t('training.bodyParts.abs'),
      image: absImg,
      accent: 'purple',
    },
    {
      id: 'arms',
      icon: '🥊',
      title: t('training.bodyParts.arms'),
      image: armsImg,
      accent: 'blue',
    },
    {
      id: 'legs',
      icon: '🏃',
      title: t('training.bodyParts.legs'),
      image: legsImg,
      accent: 'green',
    },
  ];

  if (!selectedBodyPart) {
    return (
      <div className="lw-page">
        <div className="lw-topbar">
          <button className="lw-back-btn" onClick={onBack}>
            <span>←</span> {t('common.back')}
          </button>
        </div>

        <div className="bodypart-container">
          <div className="lw-hero">
            <span className="lw-badge">Fat loss training</span>
            <h2>{t('training.loseSelectTitle')}</h2>
            <p>
              Выберите направление, а система откроет энергичный план с видео,
              таймером и контролем выполнения.
            </p>
          </div>

          <div className="bodypart-grid">
            {bodyPartCards.map((card) => (
              <button
                key={card.id}
                type="button"
                className={`bodypart-card bodypart-card--${card.accent}`}
                style={{ backgroundImage: `url(${card.image})` }}
                onClick={() => setSelectedBodyPart(card.id)}
              >
                <span className="bodypart-overlay" />
                <span className="bodypart-content">
                  <span className="bodypart-icon">{card.icon}</span>
                  <span className="bodypart-title">{card.title}</span>
                  <span className="bodypart-hint">Start fat burn ›</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="lw-page">
        <div className="lw-topbar">
          <button className="lw-back-btn" onClick={() => setSelectedBodyPart(null)}>
            <span>←</span> {t('common.back')}
          </button>
        </div>

        <div className="lw-loading-card">
          <div className="lw-loader"></div>
          <h3>{t('training.loadingTitle')}</h3>
          <p>{t('training.loadingSubtitle')}</p>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="lw-page lw-page--engine">
      <WorkoutEngine
        title={`${t('training.loseWeightTitle')} • ${selectedBodyPartLabel(selectedBodyPart)}`}
        exercises={exercises}
        onComplete={onAllStepsComplete}
        onBack={() => setSelectedBodyPart(null)}
      />

      <style>{styles}</style>
    </div>
  );
};

const styles = `
.lw-page {
  width: 100%;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  box-sizing: border-box;
  color: #fff;
  background:
    radial-gradient(circle at top left, rgba(255, 128, 80, 0.09), transparent 28%),
    radial-gradient(circle at top right, rgba(97, 218, 251, 0.07), transparent 26%),
    #1c1f24;
  padding: 16px;
}

.lw-page--engine {
  padding: 0;
  background: transparent;
}

.lw-topbar {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
  width: 100%;
}

.lw-back-btn {
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
  min-height: 44px;
  touch-action: manipulation;
}

.lw-back-btn:hover {
  transform: translateY(-2px);
  background: rgba(97, 218, 251, 0.16);
  box-shadow: 0 10px 30px rgba(97, 218, 251, 0.18);
}

.bodypart-container {
  width: min(1100px, 100%);
  margin: 0 auto;
  padding: 4px 4px 40px;
  box-sizing: border-box;
}

.lw-hero {
  width: min(820px, 100%);
  margin: 0 auto 28px;
  text-align: center;
}

.lw-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 128, 80, 0.11);
  border: 1px solid rgba(255, 128, 80, 0.26);
  color: #ffb08a;
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 14px;
  letter-spacing: 0.04em;
}

.lw-hero h2 {
  margin: 0 0 12px;
  font-size: clamp(32px, 5vw, 50px);
  line-height: 1.05;
  font-weight: 950;
  letter-spacing: -0.03em;
}

.lw-hero p {
  margin: 0 auto;
  color: #aab3c2;
  font-size: 15px;
  line-height: 1.65;
  max-width: 680px;
}

.bodypart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  width: 100%;
  margin: 0 auto;
}

.bodypart-card {
  position: relative;
  height: 260px;
  border-radius: 28px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 0;
  color: #fff;
  background-size: cover;
  background-position: center;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 22px 50px rgba(0,0,0,0.32);
  transition:
    transform 0.32s ease,
    box-shadow 0.32s ease,
    border-color 0.32s ease,
    filter 0.32s ease;
  font-family: inherit;
  text-align: left;
  touch-action: manipulation;
}

.bodypart-card:hover {
  transform: translateY(-6px) scale(1.015);
  box-shadow: 0 28px 70px rgba(0,0,0,0.52);
  border-color: rgba(255, 128, 80, 0.46);
}

.bodypart-card:active {
  transform: scale(0.985);
}

.bodypart-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(
      to top,
      rgba(0,0,0,0.88) 0%,
      rgba(0,0,0,0.56) 42%,
      rgba(0,0,0,0.10) 100%
    );
}

.bodypart-card::after {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  z-index: 1;
  height: 55%;
  opacity: 0.38;
  pointer-events: none;
}

.bodypart-card--orange::after {
  background: linear-gradient(to top, rgba(255,128,80,0.52), transparent);
}

.bodypart-card--purple::after {
  background: linear-gradient(to top, rgba(198,120,221,0.46), transparent);
}

.bodypart-card--blue::after {
  background: linear-gradient(to top, rgba(78,143,255,0.46), transparent);
}

.bodypart-card--green::after {
  background: linear-gradient(to top, rgba(34,197,94,0.46), transparent);
}

.bodypart-content {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bodypart-icon {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.16);
  backdrop-filter: blur(10px);
  font-size: 28px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.22);
}

.bodypart-title {
  display: block;
  font-weight: 950;
  font-size: clamp(22px, 3vw, 30px);
  line-height: 1.08;
  text-shadow: 0 4px 18px rgba(0,0,0,0.55);
}

.bodypart-hint {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  color: #fff2ea;
  font-size: 14px;
  font-weight: 850;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.14);
  backdrop-filter: blur(10px);
}

.lw-loading-card {
  width: min(760px, 100%);
  margin: 0 auto;
  background:
    radial-gradient(circle at top, rgba(255,128,80,0.10), transparent 34%),
    linear-gradient(180deg, #232833 0%, #1b2029 100%);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 30px;
  padding: 48px 24px;
  text-align: center;
  box-shadow: 0 25px 60px rgba(0,0,0,0.35);
  box-sizing: border-box;
}

.lw-loading-card h3 {
  margin: 10px 0 8px;
  font-size: 24px;
  color: #fff;
  font-weight: 900;
}

.lw-loading-card p {
  margin: 0;
  color: #aab3c2;
  line-height: 1.6;
}

.lw-loader {
  width: 46px;
  height: 46px;
  border: 4px solid rgba(255,255,255,0.08);
  border-top-color: #ff8a5c;
  border-radius: 50%;
  animation: lw-spin 0.8s linear infinite;
  margin: 0 auto 18px;
}

@keyframes lw-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Tablet */
@media (max-width: 1024px) {
  .bodypart-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bodypart-card {
    height: 230px;
  }
}

/* Phone */
@media (max-width: 768px) {
  .lw-page {
    min-height: 100dvh;
    padding: 10px 10px 100px;
    background:
      radial-gradient(circle at top, rgba(255,128,80,0.11), transparent 28%),
      #1c1f24;
  }

  .lw-page--engine {
    padding: 0;
    background: transparent;
  }

  .lw-topbar {
    position: sticky;
    top: 0;
    z-index: 10;
    margin-bottom: 14px;
    padding: 6px 0 10px;
    background: linear-gradient(180deg, rgba(28,31,36,0.98), rgba(28,31,36,0.82));
    backdrop-filter: blur(12px);
  }

  .lw-back-btn {
    min-height: 42px;
    padding: 10px 14px;
    font-size: 13px;
  }

  .bodypart-container {
    padding: 0 0 24px;
  }

  .lw-hero {
    text-align: left;
    margin: 6px 0 20px;
    padding: 0 4px;
  }

  .lw-badge {
    padding: 7px 12px;
    font-size: 11px;
    margin-bottom: 12px;
  }

  .lw-hero h2 {
    font-size: clamp(30px, 9vw, 40px);
    line-height: 1.08;
  }

  .lw-hero p {
    font-size: 14px;
    line-height: 1.55;
    max-width: 100%;
  }

  .bodypart-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .bodypart-card {
    height: 170px;
    border-radius: 22px;
  }

  .bodypart-content {
    padding: 16px;
    gap: 8px;
  }

  .bodypart-icon {
    width: 46px;
    height: 46px;
    border-radius: 15px;
    font-size: 24px;
  }

  .bodypart-title {
    font-size: 24px;
  }

  .bodypart-hint {
    font-size: 13px;
    padding: 7px 10px;
  }

  .lw-loading-card {
    margin-top: 16px;
    padding: 34px 18px;
    border-radius: 24px;
  }

  .lw-loading-card h3 {
    font-size: 22px;
  }
}

/* Small phone */
@media (max-width: 430px) {
  .lw-page {
    padding-left: 8px;
    padding-right: 8px;
  }

  .bodypart-card {
    height: 154px;
    border-radius: 20px;
  }

  .bodypart-content {
    padding: 14px;
  }

  .bodypart-icon {
    width: 42px;
    height: 42px;
    font-size: 22px;
    border-radius: 14px;
  }

  .bodypart-title {
    font-size: 22px;
  }

  .bodypart-hint {
    font-size: 12px;
  }
}
`;

export default LoseWeightWorkout;