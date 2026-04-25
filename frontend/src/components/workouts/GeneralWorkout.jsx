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

  if (!selectedBodyPart) {
    return (
      <div className="gw-page">
        <div className="gw-topbar">
          <button className="gw-back-btn" onClick={onBack}>
            <span>←</span> {t('common.back')}
          </button>
        </div>

        <div className="bodypart-container">
          <h2>{t('training.generalSelectTitle')}</h2>

          <div className="bodypart-grid">
            <div
              className="bodypart-card"
              style={{ backgroundImage: `url(${fullImg})` }}
              onClick={() => setSelectedBodyPart('full')}
            >
              <span>💪 {t('training.bodyParts.full')}</span>
            </div>

            <div
              className="bodypart-card"
              style={{ backgroundImage: `url(${chestImg})` }}
              onClick={() => setSelectedBodyPart('chest')}
            >
              <span>🏋️ {t('training.bodyParts.chest')}</span>
            </div>

            <div
              className="bodypart-card"
              style={{ backgroundImage: `url(${absImg})` }}
              onClick={() => setSelectedBodyPart('abs')}
            >
              <span>🔥 {t('training.bodyParts.abs')}</span>
            </div>

            <div
              className="bodypart-card"
              style={{ backgroundImage: `url(${armsImg})` }}
              onClick={() => setSelectedBodyPart('arms')}
            >
              <span>🦾 {t('training.bodyParts.arms')}</span>
            </div>

            <div
              className="bodypart-card"
              style={{ backgroundImage: `url(${legsImg})` }}
              onClick={() => setSelectedBodyPart('legs')}
            >
              <span>🦵 {t('training.bodyParts.legs')}</span>
            </div>
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
    <div className="gw-page">
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
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.gw-topbar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.gw-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(97, 218, 251, 0.08);
  border: 1px solid rgba(97, 218, 251, 0.35);
  color: #61dafb;
  padding: 12px 18px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.25s ease;
}

.gw-back-btn:hover {
  transform: translateY(-2px);
  background: rgba(97, 218, 251, 0.16);
  box-shadow: 0 10px 30px rgba(97, 218, 251, 0.18);
}

.gw-loading-card {
  max-width: 760px;
  margin: 0 auto;
  background: linear-gradient(180deg, #232833 0%, #1b2029 100%);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 30px;
  padding: 48px 24px;
  text-align: center;
  box-shadow: 0 25px 60px rgba(0,0,0,0.35);
}

.gw-loading-card h3 {
  margin: 10px 0 8px;
  font-size: 24px;
  color: #fff;
}

.gw-loading-card p {
  margin: 0;
  color: #aab3c2;
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

.bodypart-container {
  max-width: 980px;
  margin: 0 auto;
  padding: 0 10px;
  text-align: center;
}

.bodypart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.bodypart-card {
  position: relative;
  height: 240px;
  border-radius: 28px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  padding: 28px;
  font-weight: 900;
  font-size: 24px;
  color: #fff;
  background-size: cover;
  background-position: center;
  transition: all 0.35s ease;
}

.bodypart-card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 25px 60px rgba(0,0,0,0.5);
}

.bodypart-card span {
  position: relative;
  z-index: 2;
}

.bodypart-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0,0,0,0.85),
    rgba(0,0,0,0.4),
    rgba(0,0,0,0.1)
  );
}
`;

export default GeneralWorkout;
