import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import WorkoutEngine from './WorkoutEngine';
import { supabase } from '../../lib/supabaseClient';

import fullImg from './photo/full.jpg';
import absImg from './photo/abs.jpg';
import armsImg from './photo/arms.jpg';
import legsImg from './photo/legs.jpg';

const getVideoUrl = (path) =>
  supabase.storage.from('exercise-videos').getPublicUrl(path).data.publicUrl;

const LoseWeightWorkout = ({ onAllStepsComplete, onBack }) => {
  const { t } = useTranslation();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);

  const timedReps = (seconds = 30) => `${seconds} ${t('training.seconds')}`;

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

        setExercises(prepared);
      } catch (err) {
        console.error('Workout loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoseWeightExercises();
  }, [selectedBodyPart, t]);

  const selectedBodyPartLabel = (id) => {
    if (id === 'full') return t('training.bodyParts.full');
    if (id === 'abs') return t('training.bodyParts.abs');
    if (id === 'arms') return t('training.bodyParts.arms');
    if (id === 'legs') return t('training.bodyParts.legs');
    return '';
  };

  if (!selectedBodyPart) {
    return (
      <div className="lw-page">
        <div className="lw-topbar">
          <button className="lw-back-btn" onClick={onBack}>
            <span>←</span> {t('common.back')}
          </button>
        </div>

        <div className="bodypart-container">
          <h2>{t('training.loseSelectTitle')}</h2>

          <div className="bodypart-grid">
            <div
              className="bodypart-card"
              style={{ backgroundImage: `url(${fullImg})` }}
              onClick={() => setSelectedBodyPart('full')}
            >
              <span>🔥 {t('training.bodyParts.full')}</span>
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
              <span>⚡ {t('training.bodyParts.arms')}</span>
            </div>

            <div
              className="bodypart-card"
              style={{ backgroundImage: `url(${legsImg})` }}
              onClick={() => setSelectedBodyPart('legs')}
            >
              <span>🏃 {t('training.bodyParts.legs')}</span>
            </div>
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
    <div className="lw-page">
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
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.lw-topbar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.lw-back-btn {
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

.lw-back-btn:hover {
  transform: translateY(-2px);
  background: rgba(97, 218, 251, 0.16);
  box-shadow: 0 10px 30px rgba(97, 218, 251, 0.18);
}

.lw-loading-card {
  max-width: 760px;
  margin: 0 auto;
  background: linear-gradient(180deg, #232833 0%, #1b2029 100%);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 30px;
  padding: 48px 24px;
  text-align: center;
  box-shadow: 0 25px 60px rgba(0,0,0,0.35);
}

.lw-loading-card h3 {
  margin: 10px 0 8px;
  font-size: 24px;
  color: #fff;
}

.lw-loading-card p {
  margin: 0;
  color: #aab3c2;
}

.lw-loader {
  width: 46px;
  height: 46px;
  border: 4px solid rgba(255,255,255,0.08);
  border-top-color: #61dafb;
  border-radius: 50%;
  animation: lw-spin 0.8s linear infinite;
  margin: 0 auto 18px;
}

@keyframes lw-spin {
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

export default LoseWeightWorkout;
