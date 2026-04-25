import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import WorkoutEngine from './WorkoutEngine';
import { supabase } from '../../lib/supabaseClient';
import fullImg from './photo/full.jpg';
import chestImg from './photo/chest.jpg';
import absImg from './photo/abs.jpg';
import armsImg from './photo/arms.jpg';
import legsImg from './photo/legs.jpg';
const MassGainWorkout = ({ onAllStepsComplete, onBack }) => {
  const { t } = useTranslation();
  const [randomExercises, setRandomExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);

  useEffect(() => {
    // Пока пользователь не выбрал зону — ничего не грузим
    if (!selectedBodyPart) return;

    const fetchMassExercises = async () => {
      setLoading(true);

      try {
        // Пример: для fullbody используем твое видео melnitsa.MP4
        const { data } = supabase.storage
          .from('exercise-videos')
          .getPublicUrl('melnitsa.MP4');

        const melnitsaUrl = data?.publicUrl;
        console.log('VIDEO URL:', melnitsaUrl);

        // --- Разные пулы под разные зоны ---
        let pool = [];

if (selectedBodyPart === 'full') {

  const getUrl = (path) =>
    supabase.storage
      .from('exercise-videos')
      .getPublicUrl(path).data.publicUrl;

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
    mediaUrl: getUrl(item.video),
    prepSeconds: 3,
    restSeconds: 10,
  }));

  setRandomExercises(pool);
  return;
}

if (selectedBodyPart === 'chest') {

  const getUrl = (path) =>
    supabase.storage
      .from('exercise-videos')
      .getPublicUrl(path).data.publicUrl;

  const baseExercises = [
    {
      key: 'pushUps',
      video: 'chest/otzhimaniya-ot-pola.mp4',
      repeat: 1,
     muscles: [t('training.labels.chest'), t('training.labels.triceps')],
equipment: t('training.labels.noEquipment')
    },
    {
      key: 'widePushUps',
      video: 'chest/otzhimanie-shirokiy-upor.mp4',
      repeat: 1,
muscles: [t('training.labels.chest'), t('training.labels.triceps')],
equipment: t('training.labels.noEquipment')
    },
    {
      key: 'kneePushUps',
      video: 'chest/otzhimanie-koleni.mp4',
      repeat: 2,
muscles: [t('training.labels.chest'), t('training.labels.triceps')],
equipment: t('training.labels.noEquipment')
    },
    {
      key: 'inclinePushUps',
      video: 'chest/otzhimanie-opora-vperedi.mp4',
      repeat: 2,
muscles: [t('training.labels.chest'), t('training.labels.triceps')],
equipment: t('training.labels.noEquipment')
    },
    {
      key: 'chairDips',
      video: 'chest/obratnye-otzhimaniya-stul.mp4',
      repeat: 2,
muscles: [t('training.labels.chest'), t('training.labels.triceps')],
equipment: t('training.labels.noEquipment')
    },
    {
      key: 'chestStretch',
      video: 'chest/rastyazhka-grudi.mp4',
      repeat: 1,
muscles: [t('training.labels.chest'), t('training.labels.triceps')],
equipment: t('training.labels.noEquipment')
    }
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
        mediaUrl: getUrl(exercise.video),
        muscles: exercise.muscles,
        equipment: exercise.equipment
      });
    }
  });

  setRandomExercises(expanded);
  return;
}

if (selectedBodyPart === 'abs') {

  const getUrl = (path) =>
    supabase.storage
      .from('exercise-videos')
      .getPublicUrl(path).data.publicUrl;

  const baseExercises = [
    {
      key: 'sitUps',
      video: 'abs/podem-korpusa-v-sed.mp4',
muscles: [t('training.labels.obliques')],
equipment: t('training.labels.noEquipment')
    },
    {
      key: 'sideBridgeLeft',
      video: 'abs/bokovoy-mostik-levo.mp4',
muscles: [t('training.labels.obliques')],
equipment: t('training.labels.noEquipment')
    },
    {
      key: 'sideBridgeRight',
      video: 'abs/bokovoy-mostik-pravo.mp4',
muscles: [t('training.labels.obliques')],
equipment: t('training.labels.noEquipment')
    },
    {
      key: 'plankClassic',
      video: 'abs/planka-klassicheskaya.mp4',
muscles: [t('training.labels.obliques')],
equipment: t('training.labels.noEquipment')
    },
    {
      key: 'plankLeft',
      video: 'abs/planka-levyy-bok.mp4',
muscles: [t('training.labels.obliques')],
equipment: t('training.labels.noEquipment')
    },
    {
      key: 'plankRight',
      video: 'abs/planka-pravyy-bok.mp4',
muscles: [t('training.labels.obliques')],
equipment: t('training.labels.noEquipment')
    },
    {
      key: 'bicycle',
      video: 'abs/velosiped.mp4',
muscles: [t('training.labels.obliques')],
equipment: t('training.labels.noEquipment')
    },
    {
      key: 'legRaise',
      video: 'abs/podem-nog-lezha.mp4',
muscles: [t('training.labels.obliques')],
equipment: t('training.labels.noEquipment')
    },
      {
  key: 'pushupRotation',
  video: 'abs/otjimanie-povorotom.mp4',
  muscles: [t('training.labels.abs'), t('training.labels.core')],
  equipment: t('training.labels.noEquipment')
},
    {
      key: 'reverseCrunch',
      video: 'abs/obratnye-skruchivaniya.mp4',
muscles: [t('training.labels.obliques')],
equipment: t('training.labels.noEquipment')
    },
      {
  key: 'crunches',
  video: 'abs/skruchivaniya.mp4',
  muscles: [t('training.labels.abs')],
  equipment: t('training.labels.noEquipment')
},
    {
      key: 'heelTouches',
      video: 'abs/kasanie-pyatok.mp4',
muscles: [t('training.labels.obliques')],
equipment: t('training.labels.noEquipment')
    },
    {
      key: 'hollowHold',
      video: 'abs/ugolok.mp4',
muscles: [t('training.labels.obliques')],
equipment: t('training.labels.noEquipment')
    },
    {
      key: 'mountainClimbers',
      video: 'abs/planka-s-podemom-nog.mp4',
muscles: [t('training.labels.obliques')],
equipment: t('training.labels.noEquipment')
    },
    {
      key: 'cobraStretch',
      video: 'abs/rastyazhka-kobra.mp4',
muscles: [t('training.labels.obliques')],
equipment: t('training.labels.noEquipment')
    },
    {
  key: 'lowerBackRight',
  video: 'abs/skruchivanie-poyasnica-pravo.mp4',
  muscles: [t('training.labels.obliques')],
  equipment: t('training.labels.noEquipment')
},
{
  key: 'lowerBackLeft',
  video: 'abs/skruchivanie-poyasnica-levo.mp4',
  muscles: [t('training.labels.obliques')],
  equipment: t('training.labels.noEquipment')
}
  ];

  const expanded = baseExercises.map((exercise) => ({
    name: t(`training.abs.${exercise.key}.title`),
    description: t(`training.abs.${exercise.key}.desc`),
    reps: '30 сек',
    workSeconds: 30,
    prepSeconds: 3,
    restSeconds: 10,
    mediaUrl: getUrl(exercise.video),
    muscles: exercise.muscles,
    equipment: exercise.equipment
  }));

  setRandomExercises(expanded);
  return;
}

if (selectedBodyPart === 'legs') {
  const getUrl = (path) =>
    supabase.storage
      .from('exercise-videos')
      .getPublicUrl(path).data.publicUrl;

  const baseExercises = [
    // warmup
    { key: 'jump2', video: 'legs/prizhki.mp4', phase: 'warmup' },
    { key: 'run', video: 'legs/beg-koleni-vverh.mp4', phase: 'warmup' },
    { key: 'heel', video: 'legs/zahlyost-goleni.mp4', phase: 'warmup' },

    // main
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

    // stretch
    { key: 'stretch1', video: 'legs/rastyazhka-vypad-levo.mp4', phase: 'stretch' },
    { key: 'stretch2', video: 'legs/rastyazhka-vypad-pravo.mp4', phase: 'stretch' },
    { key: 'quad1', video: 'legs/rastyazhka-kvadriceps-levo.mp4', phase: 'stretch' },
    { key: 'quad2', video: 'legs/rastyazhka-kvadriceps-pravo.mp4', phase: 'stretch' },
    { key: 'calfstretch1', video: 'legs/rastyazhka-ikry-levo.mp4', phase: 'stretch' },
  ];

  const phaseOrder = {
    warmup: 0,
    main: 1,
    stretch: 2
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
          t('training.labels.core')
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
          t('training.labels.quadriceps')
        ];
        break;

      case 'squat1':
      case 'squat2':
        muscles = [
          t('training.labels.quadriceps'),
          t('training.labels.glutes')
        ];
        break;

      case 'bridge':
        muscles = [
          t('training.labels.glutes'),
          t('training.labels.hamstrings')
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
          t('training.labels.core')
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
      mediaUrl: getUrl(item.video),
      muscles,
      equipment
    };
  });

  setRandomExercises(expanded);
  return;
}

if (selectedBodyPart === 'arms') {
  const getUrl = (path) =>
    supabase.storage
      .from('exercise-videos')
      .getPublicUrl(path).data.publicUrl;

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
          t('training.labels.forearms')
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
          t('training.labels.shoulders')
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
      mediaUrl: getUrl(item.video),
      muscles,
      equipment
    };
  });

  setRandomExercises(expanded);
  return;
}

        // Выбираем 3 (если pool больше)
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

  // --- Экран выбора зоны ---
  if (!selectedBodyPart) {
    return (
      <div className="mg-page">
        <div className="mg-topbar">
          <button className="mg-back-btn" onClick={onBack}>
            <span>←</span> {t('common.back')}
          </button>
        </div>

        <div className="bodypart-container">
<h2>{t('training.bodyParts.select')}</h2>

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

  // --- Лоадер ---
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

  // --- Тренировка ---
  return (
    <div className="mg-page">
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
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mg-topbar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.mg-back-btn {
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

.mg-back-btn:hover {
  transform: translateY(-2px);
  background: rgba(97, 218, 251, 0.16);
  box-shadow: 0 10px 30px rgba(97, 218, 251, 0.18);
}

.mg-loading-card {
  max-width: 760px;
  margin: 0 auto;
  background: linear-gradient(180deg, #232833 0%, #1b2029 100%);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 30px;
  padding: 48px 24px;
  text-align: center;
  box-shadow: 0 25px 60px rgba(0,0,0,0.35);
}

.mg-loading-card h3 {
  margin: 10px 0 8px;
  font-size: 24px;
  color: #fff;
}

.mg-loading-card p {
  margin: 0;
  color: #aab3c2;
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

/* --- новый UI выбора зоны (не трогаем старый дизайн, просто добавляем) --- */
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

export default MassGainWorkout;