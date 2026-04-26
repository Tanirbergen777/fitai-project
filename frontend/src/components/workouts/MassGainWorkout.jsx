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

const MassGainWorkout = ({ onAllStepsComplete, onBack }) => {
  const { t } = useTranslation();
  const [randomExercises, setRandomExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);

  useEffect(() => {
    if (!selectedBodyPart) return;

    const fetchMassExercises = async () => {
      setLoading(true);

      try {
        const { data } = supabase.storage
          .from('exercise-videos')
          .getPublicUrl('melnitsa.MP4');

        const melnitsaUrl = data?.publicUrl;
        console.log('VIDEO URL:', melnitsaUrl);

        let pool = [];

        if (selectedBodyPart === 'full') {
          pool = [
            { key: 'armCircles', video: 'fullbody/krug-rukami.mp4' },
            { key: 'jumpingJacks', video: 'fullbody/pryzhki-jumping-jacks.mp4' },
            { key: 'torsoRotation', video: 'fullbody/vrashchenie-korpusom.mp4' },
            { key: 'squatJumps', video: 'fullbody/pryzhki-na-korotchkah.mp4' },
            { key: 'lungeTwist', video: 'fullbody/vypad-so-skruchivaniem.mp4' },
            { key: 'squatLegRaise', video: 'fullbody/prisedanie-podem-nog.mp4' },
            { key: 'highKnees', video: 'fullbody/beg-koleni-vverh.mp4' },
            { key: 'pushupRotation', video: 'fullbody/otzhimanie-povorot-gusenica.mp4' },
            { key: 'inchwormDiamond', video: 'fullbody/otzhimanie-gusenica.mp4' },
            { key: 'sideBridgeLeft', video: 'fullbody/bokovoy-mostik-levo.mp4' },
            { key: 'sideBridgeRight', video: 'fullbody/bokovoy-mostik-pravo.mp4' },
            { key: 'bicycle', video: 'fullbody/velosiped.mp4' },
            { key: 'reverseCrunch', video: 'fullbody/obratnye-skruchivaniya.mp4' },
            { key: 'butterflyBridge', video: 'fullbody/mostik-babochka.mp4' },
            { key: 'heelTouches', video: 'fullbody/kasanie-pyatok.mp4' },
            { key: 'plankJacks', video: 'fullbody/pryzhki-v-planke.mp4' },
            { key: 'supermanSwimmer', video: 'fullbody/supermen-plovec.mp4' },
            { key: 'modifiedBurpees', video: 'fullbody/izmenennye-berpi.mp4' },
            { key: 'reverseSnowAngel', video: 'fullbody/obratnyy-snezhnyy-angel.mp4' },
            { key: 'cobraStretch', video: 'fullbody/rastyazhka-kobra.mp4' },
            { key: 'childPose', video: 'fullbody/poza-rebenka.mp4' },
            { key: 'lowerBackLeft', video: 'fullbody/skruchivanie-poyasnica-levo.mp4' },
            { key: 'lowerBackRight', video: 'fullbody/skruchivanie-poyasnica-pravo.mp4' },
          ].map((item) => ({
            name: t(`training.fullbody.${item.key}.title`),
            description: t(`training.fullbody.${item.key}.desc`),
            reps: '30 сек',
            workSeconds: 30,
            mediaUrl: getVideoUrl(item.video),
            prepSeconds: 3,
            restSeconds: 10,
          }));

          setRandomExercises(pool);
          return;
        }

        if (selectedBodyPart === 'chest') {
          const baseExercises = [
            {
              key: 'pushUps',
              video: 'chest/otzhimaniya-ot-pola.mp4',
              repeat: 1,
              muscles: [t('training.labels.chest'), t('training.labels.triceps')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'widePushUps',
              video: 'chest/otzhimanie-shirokiy-upor.mp4',
              repeat: 1,
              muscles: [t('training.labels.chest'), t('training.labels.triceps')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'kneePushUps',
              video: 'chest/otzhimanie-koleni.mp4',
              repeat: 2,
              muscles: [t('training.labels.chest'), t('training.labels.triceps')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'inclinePushUps',
              video: 'chest/otzhimanie-opora-vperedi.mp4',
              repeat: 2,
              muscles: [t('training.labels.chest'), t('training.labels.triceps')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'chairDips',
              video: 'chest/obratnye-otzhimaniya-stul.mp4',
              repeat: 2,
              muscles: [t('training.labels.chest'), t('training.labels.triceps')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'chestStretch',
              video: 'chest/rastyazhka-grudi.mp4',
              repeat: 1,
              muscles: [t('training.labels.chest'), t('training.labels.triceps')],
              equipment: t('training.labels.noEquipment'),
            },
          ];

          const expanded = [];

          baseExercises.forEach((exercise) => {
            for (let i = 0; i < exercise.repeat; i++) {
              expanded.push({
                name: t(`training.chest.${exercise.key}.title`),
                description: t(`training.chest.${exercise.key}.desc`),
                reps: '30 сек',
                workSeconds: 30,
                prepSeconds: 3,
                restSeconds: 10,
                mediaUrl: getVideoUrl(exercise.video),
                muscles: exercise.muscles,
                equipment: exercise.equipment,
              });
            }
          });

          setRandomExercises(expanded);
          return;
        }

        if (selectedBodyPart === 'abs') {
          const baseExercises = [
            {
              key: 'sitUps',
              video: 'abs/podem-korpusa-v-sed.mp4',
              muscles: [t('training.labels.obliques')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'sideBridgeLeft',
              video: 'abs/bokovoy-mostik-levo.mp4',
              muscles: [t('training.labels.obliques')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'sideBridgeRight',
              video: 'abs/bokovoy-mostik-pravo.mp4',
              muscles: [t('training.labels.obliques')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'plankClassic',
              video: 'abs/planka-klassicheskaya.mp4',
              muscles: [t('training.labels.obliques')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'plankLeft',
              video: 'abs/planka-levyy-bok.mp4',
              muscles: [t('training.labels.obliques')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'plankRight',
              video: 'abs/planka-pravyy-bok.mp4',
              muscles: [t('training.labels.obliques')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'bicycle',
              video: 'abs/velosiped.mp4',
              muscles: [t('training.labels.obliques')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'legRaise',
              video: 'abs/podem-nog-lezha.mp4',
              muscles: [t('training.labels.obliques')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'pushupRotation',
              video: 'abs/otjimanie-povorotom.mp4',
              muscles: [t('training.labels.abs'), t('training.labels.core')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'reverseCrunch',
              video: 'abs/obratnye-skruchivaniya.mp4',
              muscles: [t('training.labels.obliques')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'crunches',
              video: 'abs/skruchivaniya.mp4',
              muscles: [t('training.labels.abs')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'heelTouches',
              video: 'abs/kasanie-pyatok.mp4',
              muscles: [t('training.labels.obliques')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'hollowHold',
              video: 'abs/ugolok.mp4',
              muscles: [t('training.labels.obliques')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'mountainClimbers',
              video: 'abs/planka-s-podemom-nog.mp4',
              muscles: [t('training.labels.obliques')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'cobraStretch',
              video: 'abs/rastyazhka-kobra.mp4',
              muscles: [t('training.labels.obliques')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'lowerBackRight',
              video: 'abs/skruchivanie-poyasnica-pravo.mp4',
              muscles: [t('training.labels.obliques')],
              equipment: t('training.labels.noEquipment'),
            },
            {
              key: 'lowerBackLeft',
              video: 'abs/skruchivanie-poyasnica-levo.mp4',
              muscles: [t('training.labels.obliques')],
              equipment: t('training.labels.noEquipment'),
            },
          ];

          const expanded = baseExercises.map((exercise) => ({
            name: t(`training.abs.${exercise.key}.title`),
            description: t(`training.abs.${exercise.key}.desc`),
            reps: '30 сек',
            workSeconds: 30,
            prepSeconds: 3,
            restSeconds: 10,
            mediaUrl: getVideoUrl(exercise.video),
            muscles: exercise.muscles,
            equipment: exercise.equipment,
          }));

          setRandomExercises(expanded);
          return;
        }

        if (selectedBodyPart === 'legs') {
          const baseExercises = [
            { key: 'jump2', video: 'legs/prizhki.mp4', phase: 'warmup' },
            { key: 'run', video: 'legs/beg-koleni-vverh.mp4', phase: 'warmup' },
            { key: 'heel', video: 'legs/zahlyost-goleni.mp4', phase: 'warmup' },

            { key: 'jump1', video: 'legs/prizhki-iz-planki.mp4', phase: 'main' },
            { key: 'kick1', video: 'legs/tolchki-nogoy-vverh-levo.mp4', phase: 'main' },
            { key: 'kick2', video: 'legs/tolchki-nogoy-vverh-pravo.mp4', phase: 'main' },
            { key: 'burpee', video: 'legs/burpi.mp4', phase: 'main' },
            { key: 'lunge1', video: 'legs/vypad-nazad.mp4', phase: 'main' },
            { key: 'lunge2', video: 'legs/vypady-v-storonu.mp4', phase: 'main' },
            { key: 'squat1', video: 'legs/korotkie-prisedaniya.mp4', phase: 'main' },
            { key: 'squat2', video: 'legs/vprisyadku.mp4', phase: 'main' },
            { key: 'bridge', video: 'legs/podem-beder-marsh.mp4', phase: 'main' },
            { key: 'legraise', video: 'legs/podem-nog-lezha-na-zhivote.mp4', phase: 'main' },
            { key: 'calf1', video: 'legs/podem-ikry-levo.mp4', phase: 'main' },
            { key: 'calf2', video: 'legs/podem-ikry-pravo.mp4', phase: 'main' },

            { key: 'stretch1', video: 'legs/rastyazhka-vypad-levo.mp4', phase: 'stretch' },
            { key: 'stretch2', video: 'legs/rastyazhka-vypad-pravo.mp4', phase: 'stretch' },
            { key: 'quad1', video: 'legs/rastyazhka-kvadriceps-levo.mp4', phase: 'stretch' },
            { key: 'quad2', video: 'legs/rastyazhka-kvadriceps-pravo.mp4', phase: 'stretch' },
            { key: 'calfstretch1', video: 'legs/rastyazhka-ikry-levo.mp4', phase: 'stretch' },
          ];

          const phaseOrder = {
            warmup: 0,
            main: 1,
            stretch: 2,
          };

          const sortedExercises = [...baseExercises].sort(
            (a, b) => phaseOrder[a.phase] - phaseOrder[b.phase]
          );

          const expanded = sortedExercises.map((item) => {
            let muscles = [];
            let equipment = t('training.labels.noEquipment');

            switch (item.key) {
              case 'jump1':
              case 'jump2':
              case 'burpee':
                muscles = [
                  t('training.labels.legs'),
                  t('training.labels.glutes'),
                  t('training.labels.core'),
                ];
                break;

              case 'kick1':
              case 'kick2':
                muscles = [t('training.labels.glutes')];
                equipment = t('training.labels.mat');
                break;

              case 'lunge1':
              case 'lunge2':
                muscles = [
                  t('training.labels.glutes'),
                  t('training.labels.quadriceps'),
                ];
                break;

              case 'squat1':
              case 'squat2':
                muscles = [
                  t('training.labels.quadriceps'),
                  t('training.labels.glutes'),
                ];
                break;

              case 'bridge':
                muscles = [
                  t('training.labels.glutes'),
                  t('training.labels.hamstrings'),
                ];
                equipment = t('training.labels.mat');
                break;

              case 'legraise':
                muscles = [t('training.labels.glutes')];
                equipment = t('training.labels.mat');
                break;

              case 'calf1':
              case 'calf2':
                muscles = [t('training.labels.calves')];
                break;

              case 'run':
              case 'heel':
                muscles = [
                  t('training.labels.legs'),
                  t('training.labels.core'),
                ];
                break;

              case 'stretch1':
              case 'stretch2':
                muscles = [t('training.labels.glutes')];
                break;

              case 'quad1':
              case 'quad2':
                muscles = [t('training.labels.quadriceps')];
                break;

              case 'calfstretch1':
                muscles = [t('training.labels.calves')];
                break;

              default:
                muscles = [t('training.labels.legs')];
                break;
            }

            return {
              name: t(`training.legs.${item.key}.title`),
              description: t(`training.legs.${item.key}.desc`),
              reps: '30 сек',
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl(item.video),
              muscles,
              equipment,
            };
          });

          setRandomExercises(expanded);
          return;
        }

        if (selectedBodyPart === 'arms') {
          const baseExercises = [
            { key: 'warmup1', video: 'arms/mahi-rukami-po-chasovoy.mp4' },
            { key: 'warmup2', video: 'arms/mahi-rukami-protiv-chasovoy.mp4' },
            { key: 'warmup3', video: 'arms/prizhki-bez-skakalki.mp4' },

            { key: 'push1', video: 'arms/otzhimaniya-s-kolenei-s-zaderzhkoy.mp4' },
            { key: 'push2', video: 'arms/voennye-otzhimaniya.mp4' },
            { key: 'push3', video: 'arms/otzhimaniya-s-povorotom.mp4' },
            { key: 'push4', video: 'arms/otzhimaniya-sidya-na-polu.mp4' },

            { key: 'arms1', video: 'arms/svedenie-loktey.mp4' },
            { key: 'arms2', video: 'arms/dvizheniya-vverh-vniz-lokti.mp4' },

            { key: 'twist1', video: 'arms/skruchivaniya-v-proeme-levo.mp4' },
            { key: 'twist2', video: 'arms/skruchivaniya-v-proeme-pravo.mp4' },

            { key: 'floor1', video: 'arms/skruchivaniya-lezha-levo.mp4' },
            { key: 'floor2', video: 'arms/skruchivaniya-lezha-pravo.MP4' },

            { key: 'box', video: 'arms/bokovye-udary.mp4' },

            { key: 'biceps1', video: 'arms/podem-nogi-biceps-levo.mp4' },
            { key: 'biceps2', video: 'arms/podem-nogi-biceps-pravo.mp4' },

            { key: 'burpee', video: 'arms/burpi.mp4' },

            { key: 'stretch1', video: 'arms/rastyazhka-triceps-levo.mp4' },
            { key: 'stretch2', video: 'arms/rastyazhka-triceps-pravo.mp4' },
            { key: 'stretch3', video: 'arms/rastyazhka-biceps.mp4' },
          ];

          const expanded = baseExercises.map((item) => {
            let muscles = [];
            let equipment = t('training.labels.noEquipment');

            switch (item.key) {
              case 'warmup1':
              case 'warmup2':
                muscles = [t('training.labels.shoulders')];
                break;

              case 'warmup3':
                muscles = [t('training.labels.core')];
                break;

              case 'push1':
                muscles = [t('training.labels.triceps'), t('training.labels.chest')];
                break;

              case 'push2':
                muscles = [t('training.labels.triceps'), t('training.labels.shoulders')];
                break;

              case 'push3':
                muscles = [t('training.labels.triceps'), t('training.labels.core')];
                break;

              case 'push4':
                muscles = [t('training.labels.triceps')];
                equipment = t('training.labels.chair');
                break;

              case 'arms1':
                muscles = [t('training.labels.biceps')];
                break;

              case 'arms2':
                muscles = [t('training.labels.shoulders')];
                break;

              case 'twist1':
              case 'twist2':
                muscles = [t('training.labels.core')];
                break;

              case 'floor1':
              case 'floor2':
                muscles = [t('training.labels.core')];
                equipment = t('training.labels.mat');
                break;

              case 'box':
                muscles = [
                  t('training.labels.shoulders'),
                  t('training.labels.forearms'),
                ];
                break;

              case 'biceps1':
              case 'biceps2':
                muscles = [t('training.labels.biceps')];
                break;

              case 'burpee':
                muscles = [
                  t('training.labels.core'),
                  t('training.labels.chest'),
                  t('training.labels.shoulders'),
                ];
                break;

              case 'stretch1':
              case 'stretch2':
                muscles = [t('training.labels.triceps')];
                break;

              case 'stretch3':
                muscles = [t('training.labels.biceps')];
                break;

              default:
                muscles = [t('training.labels.shoulders')];
                break;
            }

            return {
              name: t(`training.arms.${item.key}.title`),
              description: t(`training.arms.${item.key}.desc`),
              reps: '30 сек',
              workSeconds: 30,
              prepSeconds: 3,
              restSeconds: 10,
              mediaUrl: getVideoUrl(item.video),
              muscles,
              equipment,
            };
          });

          setRandomExercises(expanded);
          return;
        }

        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        setRandomExercises(shuffled.slice(0, 3));
      } catch (err) {
        console.error('Ошибка загрузки упражнений:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMassExercises();
  }, [t, selectedBodyPart]);

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
      <div className="mg-page">
        <div className="mg-topbar">
          <button className="mg-back-btn" onClick={onBack}>
            <span>←</span> {t('common.back')}
          </button>
        </div>

        <div className="bodypart-container">
          <div className="mg-hero">
           <span className="mg-badge">{t('training.massGainPage.badge')}</span>
            <h2>{t('training.bodyParts.select')}</h2>
            <p>{t('training.massGainPage.subtitle')}</p>
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
                  <span className="bodypart-hint">{t('training.massGainPage.startButton')} ›</span>
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
      <div className="mg-page">
        <div className="mg-topbar">
          <button className="mg-back-btn" onClick={() => setSelectedBodyPart(null)}>
            <span>←</span> {t('common.back')}
          </button>
        </div>

        <div className="mg-loading-card">
          <div className="mg-loader"></div>
          <h3>{t('training.loadingTitle')}</h3>
          <p>{t('training.loadingSubtitle')}</p>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="mg-page mg-page--engine">
      <WorkoutEngine
        title={`${t('training.massGainTitle')} • ${t(`training.bodyParts.${selectedBodyPart}`)}`}
        exercises={randomExercises}
        onComplete={onAllStepsComplete}
        onBack={() => setSelectedBodyPart(null)}
      />

      <style>{styles}</style>
    </div>
  );
};

const styles = `
.mg-page {
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

.mg-page--engine {
  padding: 0;
  background: transparent;
}

.mg-topbar {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
  width: 100%;
}

.mg-back-btn {
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

.mg-back-btn:hover {
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

.mg-hero {
  width: min(820px, 100%);
  margin: 0 auto 28px;
  text-align: center;
}

.mg-badge {
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

.mg-hero h2 {
  margin: 0 0 12px;
  font-size: clamp(32px, 5vw, 50px);
  line-height: 1.05;
  font-weight: 950;
  letter-spacing: -0.03em;
}

.mg-hero p {
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

.mg-loading-card {
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

.mg-loading-card h3 {
  margin: 10px 0 8px;
  font-size: 24px;
  color: #fff;
  font-weight: 900;
}

.mg-loading-card p {
  margin: 0;
  color: #aab3c2;
  line-height: 1.6;
}

.mg-loader {
  width: 46px;
  height: 46px;
  border: 4px solid rgba(255,255,255,0.08);
  border-top-color: #61dafb;
  border-radius: 50%;
  animation: mg-spin 0.8s linear infinite;
  margin: 0 auto 18px;
}

@keyframes mg-spin {
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
  .mg-page {
    min-height: 100dvh;
    padding: 10px 10px 100px;
    background:
      radial-gradient(circle at top, rgba(97,218,251,0.10), transparent 28%),
      #1c1f24;
  }

  .mg-page--engine {
    padding: 0;
    background: transparent;
  }

  .mg-topbar {
    position: sticky;
    top: 0;
    z-index: 10;
    margin-bottom: 14px;
    padding: 6px 0 10px;
    background: linear-gradient(180deg, rgba(28,31,36,0.98), rgba(28,31,36,0.82));
    backdrop-filter: blur(12px);
  }

  .mg-back-btn {
    min-height: 42px;
    padding: 10px 14px;
    font-size: 13px;
  }

  .bodypart-container {
    padding: 0 0 24px;
  }

  .mg-hero {
    text-align: left;
    margin: 6px 0 20px;
    padding: 0 4px;
  }

  .mg-badge {
    padding: 7px 12px;
    font-size: 11px;
    margin-bottom: 12px;
  }

  .mg-hero h2 {
    font-size: clamp(30px, 9vw, 40px);
    line-height: 1.08;
  }

  .mg-hero p {
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

  .mg-loading-card {
    margin-top: 16px;
    padding: 34px 18px;
    border-radius: 24px;
  }

  .mg-loading-card h3 {
    font-size: 22px;
  }
}

/* Small phone */
@media (max-width: 430px) {
  .mg-page {
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

export default MassGainWorkout;