import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import WorkoutEngine from './WorkoutEngine';
import { supabase } from '../../lib/supabaseClient';

import fullImg from './photo/full.jpg';
import chestImg from './photo/chest.jpg';
import absImg from './photo/abs.jpg';
import armsImg from './photo/arms.jpg';
import legsImg from './photo/legs.jpg';

const getVideoUrl = (path) =>
  supabase.storage.from('exercise-videos').getPublicUrl(path).data.publicUrl;

const GeneralWorkout = ({ onAllStepsComplete, onBack }) => {
  const { t } = useTranslation();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);

  useEffect(() => {
    if (!selectedBodyPart) return;

    const fetchGeneralExercises = async () => {
      setLoading(true);

      try {
        let prepared = [];

        if (selectedBodyPart === 'full') {
          prepared = [
            {
              name: t('training.general.full.armCircles.title'),
              description: t('training.general.full.armCircles.desc'),
              reps: '30 сек',
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('fullbody/krug-rukami.mp4'),
              muscles: [t('training.labels.shoulders'), t('training.labels.arms')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              name: t('training.general.full.torsoRotation.title'),
              description: t('training.general.full.torsoRotation.desc'),
              reps: '30 сек',
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('fullbody/vrashchenie-korpusom.mp4'),
              muscles: [t('training.labels.core'), t('training.labels.back')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              name: t('training.general.full.jumpingJacks.title'),
              description: t('training.general.full.jumpingJacks.desc'),
              reps: '20 reps',
              workSeconds: 45,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('fullbody/pryzhki-jumping-jacks.mp4'),
              muscles: [t('training.labels.legs'), t('training.labels.cardio'), t('training.labels.core')],
              equipment: t('training.labels.noEquipment'),
              cameraMode: 'jumping_jacks',
            },
            {
              name: t('training.general.full.squatLegRaise.title'),
              description: t('training.general.full.squatLegRaise.desc'),
              reps: '12 reps',
              workSeconds: 45,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('fullbody/prisedanie-podem-nog.mp4'),
              muscles: [t('training.labels.legs'), t('training.labels.glutes'), t('training.labels.core')],
              equipment: t('training.labels.noEquipment'),
              cameraMode: 'squat',
            },
            {
              name: t('training.general.full.inchwormPushUp.title'),
              description: t('training.general.full.inchwormPushUp.desc'),
              reps: '8 reps',
              workSeconds: 45,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('fullbody/otzhimanie-gusenica.mp4'),
              muscles: [t('training.labels.chest'), t('training.labels.shoulders'), t('training.labels.core')],
              equipment: t('training.labels.noEquipment'),
              cameraMode: 'pushup',
            },
            {
              name: t('training.general.full.sideBridgeLeft.title'),
              description: t('training.general.full.sideBridgeLeft.desc'),
              reps: '30 сек',
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('fullbody/bokovoy-mostik-levo.mp4'),
              muscles: [t('training.labels.core'), t('training.labels.obliques')],
              equipment: t('training.labels.mat'),
              cameraMode: 'plank',
            },
            {
              name: t('training.general.full.sideBridgeRight.title'),
              description: t('training.general.full.sideBridgeRight.desc'),
              reps: '30 сек',
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('fullbody/bokovoy-mostik-pravo.mp4'),
              muscles: [t('training.labels.core'), t('training.labels.obliques')],
              equipment: t('training.labels.mat'),
              cameraMode: 'plank',
            },
            {
              name: t('training.general.full.bicycle.title'),
              description: t('training.general.full.bicycle.desc'),
              reps: '16 reps',
              workSeconds: 40,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('fullbody/velosiped.mp4'),
              muscles: [t('training.labels.abs'), t('training.labels.obliques')],
              equipment: t('training.labels.mat'),
              cameraMode: 'crunch',
            },
            {
              name: t('training.general.full.childPose.title'),
              description: t('training.general.full.childPose.desc'),
              reps: '30 сек',
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('fullbody/poza-rebenka.mp4'),
              muscles: [t('training.labels.back'), t('training.labels.core')],
              equipment: t('training.labels.mat'),
            },
          ];
        }

        if (selectedBodyPart === 'chest') {
          prepared = [
            {
              name: t('training.general.chest.pushUps.title'),
              description: t('training.general.chest.pushUps.desc'),
              reps: '10 reps',
              workSeconds: 45,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('chest/otzhimaniya-ot-pola.mp4'),
              muscles: [t('training.labels.chest'), t('training.labels.triceps')],
              equipment: t('training.labels.noEquipment'),
              cameraMode: 'pushup',
            },
            {
              name: t('training.general.chest.widePushUps.title'),
              description: t('training.general.chest.widePushUps.desc'),
              reps: '10 reps',
              workSeconds: 45,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('chest/otzhimanie-shirokiy-upor.mp4'),
              muscles: [t('training.labels.chest'), t('training.labels.triceps')],
              equipment: t('training.labels.noEquipment'),
              cameraMode: 'pushup',
            },
            {
              name: t('training.general.chest.kneePushUps.title'),
              description: t('training.general.chest.kneePushUps.desc'),
              reps: '12 reps',
              workSeconds: 45,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('chest/otzhimanie-koleni.mp4'),
              muscles: [t('training.labels.chest'), t('training.labels.triceps')],
              equipment: t('training.labels.noEquipment'),
              cameraMode: 'pushup',
            },
            {
              name: t('training.general.chest.inclinePushUps.title'),
              description: t('training.general.chest.inclinePushUps.desc'),
              reps: '12 reps',
              workSeconds: 45,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('chest/otzhimanie-opora-vperedi.mp4'),
              muscles: [t('training.labels.chest'), t('training.labels.shoulders'), t('training.labels.triceps')],
              equipment: t('training.labels.support'),
              cameraMode: 'pushup',
            },
            {
              name: t('training.general.chest.chairDips.title'),
              description: t('training.general.chest.chairDips.desc'),
              reps: '30 сек',
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('chest/obratnye-otzhimaniya-stul.mp4'),
              muscles: [t('training.labels.triceps'), t('training.labels.chest')],
              equipment: t('training.labels.chair'),
            },
            {
              name: t('training.general.chest.chestStretch.title'),
              description: t('training.general.chest.chestStretch.desc'),
              reps: '30 сек',
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('chest/rastyazhka-grudi.mp4'),
              muscles: [t('training.labels.chest')],
              equipment: t('training.labels.noEquipment'),
            },
          ];
        }

        if (selectedBodyPart === 'abs') {
          prepared = [
            {
              name: t('training.general.abs.plankClassic.title'),
              description: t('training.general.abs.plankClassic.desc'),
              reps: '30 сек',
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('abs/planka-klassicheskaya.mp4'),
              muscles: [t('training.labels.core'), t('training.labels.abs')],
              equipment: t('training.labels.mat'),
              cameraMode: 'plank',
            },
            {
              name: t('training.general.abs.plankLeft.title'),
              description: t('training.general.abs.plankLeft.desc'),
              reps: '30 сек',
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('abs/planka-levyy-bok.mp4'),
              muscles: [t('training.labels.obliques'), t('training.labels.core')],
              equipment: t('training.labels.mat'),
              cameraMode: 'plank',
            },
            {
              name: t('training.general.abs.plankRight.title'),
              description: t('training.general.abs.plankRight.desc'),
              reps: '30 сек',
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('abs/planka-pravyy-bok.mp4'),
              muscles: [t('training.labels.obliques'), t('training.labels.core')],
              equipment: t('training.labels.mat'),
              cameraMode: 'plank',
            },
            {
              name: t('training.general.abs.crunches.title'),
              description: t('training.general.abs.crunches.desc'),
              reps: '15 reps',
              workSeconds: 40,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('abs/skruchivaniya.mp4'),
              muscles: [t('training.labels.abs')],
              equipment: t('training.labels.mat'),
              cameraMode: 'crunch',
            },
            {
              name: t('training.general.abs.reverseCrunch.title'),
              description: t('training.general.abs.reverseCrunch.desc'),
              reps: '12 reps',
              workSeconds: 40,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('abs/obratnye-skruchivaniya.mp4'),
              muscles: [t('training.labels.abs'), t('training.labels.core')],
              equipment: t('training.labels.mat'),
              cameraMode: 'crunch',
            },
            {
              name: t('training.general.abs.bicycle.title'),
              description: t('training.general.abs.bicycle.desc'),
              reps: '20 reps',
              workSeconds: 40,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('abs/velosiped.mp4'),
              muscles: [t('training.labels.abs'), t('training.labels.obliques')],
              equipment: t('training.labels.mat'),
              cameraMode: 'crunch',
            },
            {
              name: t('training.general.abs.cobraStretch.title'),
              description: t('training.general.abs.cobraStretch.desc'),
              reps: '30 сек',
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('abs/rastyazhka-kobra.mp4'),
              muscles: [t('training.labels.abs'), t('training.labels.back')],
              equipment: t('training.labels.mat'),
            },
          ];
        }

        if (selectedBodyPart === 'arms') {
          prepared = [
            {
              name: t('training.general.arms.armCirclesClockwise.title'),
              description: t('training.general.arms.armCirclesClockwise.desc'),
              reps: '30 сек',
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('arms/mahi-rukami-po-chasovoy.mp4'),
              muscles: [t('training.labels.shoulders')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              name: t('training.general.arms.armCirclesCounterclockwise.title'),
              description: t('training.general.arms.armCirclesCounterclockwise.desc'),
              reps: '30 сек',
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('arms/mahi-rukami-protiv-chasovoy.mp4'),
              muscles: [t('training.labels.shoulders')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              name: t('training.general.arms.kneePushUps.title'),
              description: t('training.general.arms.kneePushUps.desc'),
              reps: '12 reps',
              workSeconds: 45,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('arms/otzhimaniya-s-kolenei-s-zaderzhkoy.mp4'),
              muscles: [t('training.labels.triceps'), t('training.labels.chest')],
              equipment: t('training.labels.noEquipment'),
              cameraMode: 'pushup',
            },
            {
              name: t('training.general.arms.elbowSqueeze.title'),
              description: t('training.general.arms.elbowSqueeze.desc'),
              reps: '30 сек',
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('arms/svedenie-loktey.mp4'),
              muscles: [t('training.labels.arms'), t('training.labels.shoulders')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              name: t('training.general.arms.bicepsLeft.title'),
              description: t('training.general.arms.bicepsLeft.desc'),
              reps: '30 сек',
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('arms/podem-nogi-biceps-levo.mp4'),
              muscles: [t('training.labels.biceps')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              name: t('training.general.arms.bicepsRight.title'),
              description: t('training.general.arms.bicepsRight.desc'),
              reps: '30 сек',
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('arms/podem-nogi-biceps-pravo.mp4'),
              muscles: [t('training.labels.biceps')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              name: t('training.general.arms.tricepsStretch.title'),
              description: t('training.general.arms.tricepsStretch.desc'),
              reps: '30 сек',
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('arms/rastyazhka-triceps-levo.mp4'),
              muscles: [t('training.labels.triceps')],
              equipment: t('training.labels.noEquipment'),
            },
          ];
        }

        if (selectedBodyPart === 'legs') {
          prepared = [
            {
              name: t('training.general.legs.highKnees.title'),
              description: t('training.general.legs.highKnees.desc'),
              reps: '20 reps',
              workSeconds: 40,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('legs/beg-koleni-vverh.mp4'),
              muscles: [t('training.labels.legs'), t('training.labels.cardio')],
              equipment: t('training.labels.noEquipment'),
              cameraMode: 'high_knees',
            },
            {
              name: t('training.general.legs.shortSquats.title'),
              description: t('training.general.legs.shortSquats.desc'),
              reps: '12 reps',
              workSeconds: 45,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('legs/korotkie-prisedaniya.mp4'),
              muscles: [t('training.labels.quadriceps'), t('training.labels.glutes')],
              equipment: t('training.labels.noEquipment'),
              cameraMode: 'squat',
            },
            {
              name: t('training.general.legs.bridgeMarch.title'),
              description: t('training.general.legs.bridgeMarch.desc'),
              reps: '30 сек',
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('legs/podem-beder-marsh.mp4'),
              muscles: [t('training.labels.glutes'), t('training.labels.hamstrings')],
              equipment: t('training.labels.mat'),
            },
            {
              name: t('training.general.legs.reverseLunge.title'),
              description: t('training.general.legs.reverseLunge.desc'),
              reps: '10 reps',
              workSeconds: 45,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('legs/vypad-nazad.mp4'),
              muscles: [t('training.labels.quadriceps'), t('training.labels.glutes')],
              equipment: t('training.labels.noEquipment'),
              cameraMode: 'lunge',
            },
            {
              name: t('training.general.legs.sideLunges.title'),
              description: t('training.general.legs.sideLunges.desc'),
              reps: '10 reps',
              workSeconds: 45,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('legs/vypady-v-storonu.mp4'),
              muscles: [t('training.labels.legs'), t('training.labels.glutes')],
              equipment: t('training.labels.noEquipment'),
              cameraMode: 'lunge',
            },
            {
              name: t('training.general.legs.calfRaise.title'),
              description: t('training.general.legs.calfRaise.desc'),
              reps: '30 сек',
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('legs/podem-ikry-levo.mp4'),
              muscles: [t('training.labels.calves')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              name: t('training.general.legs.quadricepsStretch.title'),
              description: t('training.general.legs.quadricepsStretch.desc'),
              reps: '30 сек',
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl('legs/rastyazhka-kvadriceps-levo.mp4'),
              muscles: [t('training.labels.quadriceps')],
              equipment: t('training.labels.noEquipment'),
            },
          ];
        }

        setExercises(prepared);
      } catch (err) {
        console.error('Ошибка загрузки упражнений общей формы:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGeneralExercises();
  }, [selectedBodyPart, t]);

  const selectedBodyPartLabel = (id) => {
    if (id === 'full') return t('training.bodyParts.full');
    if (id === 'chest') return t('training.bodyParts.chest');
    if (id === 'abs') return t('training.bodyParts.abs');
    if (id === 'arms') return t('training.bodyParts.arms');
    if (id === 'legs') return t('training.bodyParts.legs');
    return '';
  };

  const bodyPartCards = [
    {
      id: 'full',
      icon: '💪',
      title: t('training.bodyParts.full'),
      image: fullImg,
      accent: 'cyan',
    },
    {
      id: 'chest',
      icon: '🏋️',
      title: t('training.bodyParts.chest'),
      image: chestImg,
      accent: 'purple',
    },
    {
      id: 'abs',
      icon: '🔥',
      title: t('training.bodyParts.abs'),
      image: absImg,
      accent: 'orange',
    },
    {
      id: 'arms',
      icon: '🦾',
      title: t('training.bodyParts.arms'),
      image: armsImg,
      accent: 'blue',
    },
    {
      id: 'legs',
      icon: '🦵',
      title: t('training.bodyParts.legs'),
      image: legsImg,
      accent: 'green',
    },
  ];

  if (!selectedBodyPart) {
    return (
      <div className="gw-page">
        <div className="gw-topbar">
          <button className="gw-back-btn" onClick={onBack}>
            <span>←</span> {t('common.back')}
          </button>
        </div>

        <div className="bodypart-container">
          <div className="gw-hero">
            <span className="gw-badge">General training</span>
            <h2>{t('training.generalSelectTitle')}</h2>
            <p>
              Выберите часть тела, а система откроет подходящий план с видео,
              таймером и AI camera coach.
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
                  <span className="bodypart-hint">Start plan ›</span>
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
      <div className="gw-page">
        <div className="gw-topbar">
          <button className="gw-back-btn" onClick={() => setSelectedBodyPart(null)}>
            <span>←</span> {t('common.back')}
          </button>
        </div>

        <div className="gw-loading-card">
          <div className="gw-loader"></div>
          <h3>{t('training.loadingTitle')}</h3>
          <p>{t('training.loadingSubtitle')}</p>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="gw-page gw-page--engine">
      <WorkoutEngine
        title={`${t('training.generalTitle')} • ${selectedBodyPartLabel(selectedBodyPart)}`}
        exercises={exercises}
        onComplete={onAllStepsComplete}
        onBack={() => setSelectedBodyPart(null)}
      />

      <style>{styles}</style>
    </div>
  );
};

const styles = `
.gw-page {
  width: 100%;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  box-sizing: border-box;
  color: #fff;
  background:
    radial-gradient(circle at top left, rgba(97, 218, 251, 0.08), transparent 28%),
    radial-gradient(circle at top right, rgba(198, 120, 221, 0.07), transparent 26%),
    #1c1f24;
  padding: 16px;
}

.gw-page--engine {
  padding: 0;
  background: transparent;
}

.gw-topbar {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
  width: 100%;
}

.gw-back-btn {
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

.gw-back-btn:hover {
  transform: translateY(-2px);
  background: rgba(97, 218, 251, 0.16);
  box-shadow: 0 10px 30px rgba(97, 218, 251, 0.18);
}

.bodypart-container {
  width: min(1180px, 100%);
  margin: 0 auto;
  padding: 4px 4px 40px;
  box-sizing: border-box;
}

.gw-hero {
  width: min(820px, 100%);
  margin: 0 auto 28px;
  text-align: center;
}

.gw-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(97, 218, 251, 0.10);
  border: 1px solid rgba(97, 218, 251, 0.24);
  color: #7ce3ff;
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 14px;
  letter-spacing: 0.04em;
}

.gw-hero h2 {
  margin: 0 0 12px;
  font-size: clamp(32px, 5vw, 50px);
  line-height: 1.05;
  font-weight: 950;
  letter-spacing: -0.03em;
}

.gw-hero p {
  margin: 0 auto;
  color: #aab3c2;
  font-size: 15px;
  line-height: 1.65;
  max-width: 680px;
}

.bodypart-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 18px;
  width: 100%;
  margin: 0 auto;
}

.bodypart-card {
  position: relative;
  grid-column: span 2;
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

.bodypart-card:nth-child(1),
.bodypart-card:nth-child(2) {
  grid-column: span 3;
}

.bodypart-card:hover {
  transform: translateY(-6px) scale(1.015);
  box-shadow: 0 28px 70px rgba(0,0,0,0.52);
  border-color: rgba(97, 218, 251, 0.42);
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
  opacity: 0.35;
  pointer-events: none;
}

.bodypart-card--cyan::after {
  background: linear-gradient(to top, rgba(97,218,251,0.44), transparent);
}

.bodypart-card--purple::after {
  background: linear-gradient(to top, rgba(198,120,221,0.44), transparent);
}

.bodypart-card--orange::after {
  background: linear-gradient(to top, rgba(255,151,73,0.44), transparent);
}

.bodypart-card--blue::after {
  background: linear-gradient(to top, rgba(78,143,255,0.44), transparent);
}

.bodypart-card--green::after {
  background: linear-gradient(to top, rgba(34,197,94,0.44), transparent);
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
  color: #dbefff;
  font-size: 14px;
  font-weight: 850;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.14);
  backdrop-filter: blur(10px);
}

.gw-loading-card {
  width: min(760px, 100%);
  margin: 0 auto;
  background:
    radial-gradient(circle at top, rgba(97,218,251,0.10), transparent 34%),
    linear-gradient(180deg, #232833 0%, #1b2029 100%);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 30px;
  padding: 48px 24px;
  text-align: center;
  box-shadow: 0 25px 60px rgba(0,0,0,0.35);
  box-sizing: border-box;
}

.gw-loading-card h3 {
  margin: 10px 0 8px;
  font-size: 24px;
  color: #fff;
  font-weight: 900;
}

.gw-loading-card p {
  margin: 0;
  color: #aab3c2;
  line-height: 1.6;
}

.gw-loader {
  width: 46px;
  height: 46px;
  border: 4px solid rgba(255,255,255,0.08);
  border-top-color: #61dafb;
  border-radius: 50%;
  animation: gw-spin 0.8s linear infinite;
  margin: 0 auto 18px;
}

@keyframes gw-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Tablet */
@media (max-width: 1024px) {
  .bodypart-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bodypart-card,
  .bodypart-card:nth-child(1),
  .bodypart-card:nth-child(2) {
    grid-column: auto;
    height: 230px;
  }
}

/* Phone */
@media (max-width: 768px) {
  .gw-page {
    min-height: 100dvh;
    padding: 10px 10px 100px;
    background:
      radial-gradient(circle at top, rgba(97,218,251,0.10), transparent 28%),
      #1c1f24;
  }

  .gw-page--engine {
    padding: 0;
    background: transparent;
  }

  .gw-topbar {
    position: sticky;
    top: 0;
    z-index: 10;
    margin-bottom: 14px;
    padding: 6px 0 10px;
    background: linear-gradient(180deg, rgba(28,31,36,0.98), rgba(28,31,36,0.82));
    backdrop-filter: blur(12px);
  }

  .gw-back-btn {
    min-height: 42px;
    padding: 10px 14px;
    font-size: 13px;
  }

  .bodypart-container {
    padding: 0 0 24px;
  }

  .gw-hero {
    text-align: left;
    margin: 6px 0 20px;
    padding: 0 4px;
  }

  .gw-badge {
    padding: 7px 12px;
    font-size: 11px;
    margin-bottom: 12px;
  }

  .gw-hero h2 {
    font-size: clamp(30px, 9vw, 40px);
    line-height: 1.08;
  }

  .gw-hero p {
    font-size: 14px;
    line-height: 1.55;
    max-width: 100%;
  }

  .bodypart-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .bodypart-card,
  .bodypart-card:nth-child(1),
  .bodypart-card:nth-child(2) {
    grid-column: auto;
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

  .gw-loading-card {
    margin-top: 16px;
    padding: 34px 18px;
    border-radius: 24px;
  }

  .gw-loading-card h3 {
    font-size: 22px;
  }
}

/* Small phone */
@media (max-width: 430px) {
  .gw-page {
    padding-left: 8px;
    padding-right: 8px;
  }

  .bodypart-card,
  .bodypart-card:nth-child(1),
  .bodypart-card:nth-child(2) {
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

export default GeneralWorkout;