import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Confetti from 'react-confetti';
import MassGainWorkout from './workouts/MassGainWorkout';
import LoseWeightWorkout from './workouts/LoseWeightWorkout';
import GeneralWorkout from './workouts/GeneralWorkout';
import AITrainingWorkout from './workouts/AITrainingWorkout';

const TrainingPage = ({ onComplete, setActiveTab }) => {
  const { t } = useTranslation();
  const [isFinished, setIsFinished] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [finishReport, setFinishReport] = useState(null);
  const hasAwardedRef = useRef(false);

  const handleWorkoutComplete = (report = null) => {
    if (!hasAwardedRef.current) {
      const score = report?.score || 50;

      hasAwardedRef.current = true;
      setFinishReport(report);
      setIsFinished(true);

      if (onComplete) onComplete(score);
    }
  };

  const resetWorkoutAwardState = () => {
    hasAwardedRef.current = false;
    setFinishReport(null);
    setIsFinished(false);
  };

  const handleSelectGoal = (goalKey) => {
    resetWorkoutAwardState();
    setSelectedGoal(goalKey);
  };

  const handleBackToSelection = () => {
    resetWorkoutAwardState();
    setSelectedGoal(null);
  };

  const handleFinishContinue = () => {
    resetWorkoutAwardState();
    setSelectedGoal(null);

    if (typeof setActiveTab === 'function') {
      setActiveTab('main');
    }
  };

  const renderWorkout = () => {
    const props = {
      onAllStepsComplete: handleWorkoutComplete,
      isFinished,
      onBack: handleBackToSelection,
    };

    if (selectedGoal === 'gain') return <MassGainWorkout {...props} />;
    if (selectedGoal === 'lose') return <LoseWeightWorkout {...props} />;
    if (selectedGoal === 'general') return <GeneralWorkout {...props} />;
    if (selectedGoal === 'ai') {
      return (
        <AITrainingWorkout
          onAllStepsComplete={handleWorkoutComplete}
          onBack={handleBackToSelection}
        />
      );
    }

    return null;
  };

  const selectionCards = [
    {
      key: 'gain',
      className: 'gain',
      icon: '🚀',
      title: t('training.selection.gain.title'),
      desc: t('training.selection.gain.desc'),
    },
    {
      key: 'lose',
      className: 'lose',
      icon: '🔥',
      title: t('training.selection.lose.title'),
      desc: t('training.selection.lose.desc'),
    },
    {
      key: 'general',
      className: 'general',
      icon: '☀️',
      title: t('training.selection.general.title'),
      desc: t('training.selection.general.desc'),
    },
    {
      key: 'ai',
      className: 'ai',
      icon: '🤖',
      title: t('training.selection.ai.title'),
      desc: t('training.selection.ai.desc'),
    },
  ];

  return (
    <div className={`training-page ${selectedGoal ? 'training-page--session' : ''}`}>
      {isFinished && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
        />
      )}

      {!selectedGoal && (
        <>
          <div className="tp-header">
            <h1 className="tp-title">{t('menu.training')}</h1>
            <p className="tp-subtitle">{t('training.heroSubtitle')}</p>
          </div>

          <div className="tp-grid">
            {selectionCards.map((card) => (
              <button
                type="button"
                key={card.key}
                className={`tp-card tp-card--${card.className}`}
                onClick={() => handleSelectGoal(card.key)}
              >
                <div className="tp-card-icon">{card.icon}</div>

                <div className="tp-card-content">
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {selectedGoal && renderWorkout()}

      {isFinished && (
        <div className="tp-modal-overlay" onClick={handleFinishContinue}>
          <div className="tp-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="tp-fire-circle">
              <span>🔥</span>
            </div>

            <h2>{t('training.finishModal.title')}</h2>

            <p>
              {t('training.finishModal.received')}{' '}
              <span className="tp-modal-stars">+{finishReport?.score || 50} ⭐</span>
            </p>

            {finishReport && (
              <div className="tp-finish-mini-report">
                <div>
                  <span>Аяқталған</span>
                  <strong>
                    {finishReport.completedCount}/{finishReport.totalExercises}
                  </strong>
                </div>

                <div>
                  <span>Орындау сапасы</span>
                  <strong>{finishReport.performanceScore}%</strong>
                </div>

                <div>
                  <span>Өткізілген</span>
                  <strong>{finishReport.skippedCount}</strong>
                </div>
              </div>
            )}

            {finishReport?.summary && (
              <p className="tp-finish-summary">
                {finishReport.summary}
              </p>
            )}

            <button
              className="tp-continue-button"
              onClick={handleFinishContinue}
            >
              {t('training.finishModal.continue')}
            </button>
          </div>
        </div>
      )}

      <style>{`
.training-page {
  width: 100%;
  min-width: 0;
  min-height: 100dvh;
  box-sizing: border-box;
  color: #ffffff;
  background: #1c1f24;
  padding: 52px 70px 70px;
  overflow-x: hidden;
  overflow-y: auto;
}

.training-page--session {
  min-height: 100%;
  padding: 0;
  background: transparent;
  overflow: visible;
}

.tp-header {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto 60px;
  text-align: center;
}

.tp-title {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 900;
  margin-bottom: 10px;
}

.tp-subtitle {
  margin: 0 auto;
  max-width: 900px;
  color: #b8c7df;
  font-size: 19px;
  line-height: 1.55;
}

.tp-grid {
  width: 100%;
  max-width: 1780px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28px;
}

.tp-card {
  width: 100%;
  min-width: 0;
  height: 305px;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 30px;
  background:
    radial-gradient(circle at top left, rgba(97,218,251,0.045), transparent 34%),
    linear-gradient(180deg, #22272f 0%, #20242c 100%);
  color: #ffffff;
  padding: 34px 32px 32px;
  box-sizing: border-box;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
  box-shadow: 0 18px 44px rgba(0,0,0,0.18);
  transition:
    transform 0.24s ease,
    border-color 0.24s ease,
    box-shadow 0.24s ease,
    background 0.24s ease;
  touch-action: manipulation;
  overflow: hidden;
}

.tp-card:hover {
  transform: translateY(-6px);
  border-color: rgba(97,218,251,0.32);
  box-shadow: 0 28px 70px rgba(0,0,0,0.34);
  background:
    radial-gradient(circle at top left, rgba(97,218,251,0.08), transparent 34%),
    linear-gradient(180deg, #252b35 0%, #20242c 100%);
}

.tp-card:active {
  transform: scale(0.985);
}

.tp-card--ai {
  border: 1px dashed rgba(198,120,221,0.50);
  background:
    radial-gradient(circle at top left, rgba(198,120,221,0.07), transparent 35%),
    linear-gradient(180deg, #24242d 0%, #20202a 100%);
}

.tp-card--ai:hover {
  border-color: rgba(198,120,221,0.75);
  box-shadow: 0 28px 70px rgba(198,120,221,0.12);
}

.tp-card-icon {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background: rgba(97,218,251,0.09);
  border: 1px solid rgba(97,218,251,0.11);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 31px;
  flex-shrink: 0;
}

.tp-card--lose .tp-card-icon {
  background: rgba(255,100,100,0.09);
  border-color: rgba(255,100,100,0.12);
}

.tp-card--general .tp-card-icon {
  background: rgba(255,212,80,0.09);
  border-color: rgba(255,212,80,0.12);
}

.tp-card--ai .tp-card-icon {
  background: rgba(198,120,221,0.12);
  border-color: rgba(198,120,221,0.14);
}

.tp-card-content h3 {
  margin: 0 0 16px;
  color: #ffffff;
  font-size: clamp(24px, 1.55vw, 31px);
  line-height: 1.14;
  font-weight: 950;
  letter-spacing: -0.02em;
  word-break: normal;
  overflow-wrap: break-word;
  hyphens: none;
}

.tp-card-content p {
  margin: 0;
  color: #b8c7df;
  font-size: 17px;
  line-height: 1.55;
}

.tp-ai-shell {
  width: min(1200px, 100%);
  margin: 0 auto;
  background:
    radial-gradient(circle at top right, rgba(198, 120, 221, 0.12), transparent 30%),
    linear-gradient(180deg, #232833 0%, #1b2029 100%);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 28px;
  padding: 32px;
  box-sizing: border-box;
  box-shadow: 0 25px 60px rgba(0,0,0,0.35);
}

.tp-ai-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(198, 120, 221, 0.10);
  border: 1px solid rgba(198, 120, 221, 0.25);
  color: #d8a8ea;
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 16px;
}

.tp-ai-title {
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 950;
  line-height: 1.08;
  margin: 0 0 10px 0;
  letter-spacing: -0.02em;
}

.tp-ai-text {
  color: #aab3c2;
  line-height: 1.7;
  font-size: 15px;
  margin: 0 0 26px;
  max-width: 860px;
}

.tp-ai-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

.tp-ai-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 22px;
  padding: 22px;
  min-width: 0;
}

.tp-ai-icon {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  background: rgba(97, 218, 251, 0.09);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin-bottom: 14px;
}

.tp-ai-card h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 900;
  line-height: 1.25;
}

.tp-ai-card p {
  margin: 0;
  color: #c8d1df;
  line-height: 1.6;
  font-size: 14px;
}

.tp-ai-note {
  margin-top: 10px;
  padding: 20px;
  border-radius: 20px;
  background: rgba(97, 218, 251, 0.08);
  border: 1px solid rgba(97, 218, 251, 0.18);
}

.tp-ai-note h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 900;
}

.tp-ai-note p {
  margin: 0;
  color: #c8d1df;
  line-height: 1.7;
  font-size: 14px;
}

.tp-ai-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 24px;
}

.tp-back-btn {
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
}

.tp-back-btn:hover {
  transform: translateY(-2px);
  background: rgba(97, 218, 251, 0.16);
  box-shadow: 0 10px 30px rgba(97, 218, 251, 0.18);
}

.tp-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(7, 10, 16, 0.76);
  backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  box-sizing: border-box;
}

.tp-modal-content {
  width: min(420px, 100%);
  background:
    radial-gradient(circle at top, rgba(97,218,251,0.10), transparent 34%),
    linear-gradient(180deg, #252a35 0%, #1b2029 100%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 28px;
  padding: 28px;
  text-align: center;
  box-shadow: 0 28px 80px rgba(0,0,0,0.48);
}

.tp-fire-circle {
  width: 82px;
  height: 82px;
  border-radius: 999px;
  margin: 0 auto 18px;
  background: rgba(255, 126, 64, 0.12);
  border: 1px solid rgba(255, 126, 64, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38px;
}

.tp-modal-content h2 {
  color: #fff;
  margin: 0 0 10px;
  font-size: 26px;
  font-weight: 950;
}

.tp-modal-content p {
  color: #abb2bf;
  margin: 0 0 22px;
  line-height: 1.55;
}

.tp-modal-stars {
  color: #ffd700;
  font-weight: 900;
}

.tp-finish-mini-report {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 0 0 18px;
}

.tp-finish-mini-report div {
  padding: 10px;
  border-radius: 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
}

.tp-finish-mini-report span {
  display: block;
  color: #aab3c2;
  font-size: 11px;
  margin-bottom: 4px;
}

.tp-finish-mini-report strong {
  color: #61dafb;
  font-size: 16px;
}

.tp-finish-summary {
  margin: 0 0 20px !important;
  padding: 12px;
  border-radius: 16px;
  background: rgba(97,218,251,0.07);
  border: 1px solid rgba(97,218,251,0.15);
  color: #c8d1df !important;
  font-size: 13px;
  line-height: 1.55 !important;
}

.tp-continue-button {
  width: 100%;
  min-height: 54px;
  border: none;
  border-radius: 18px;
  background: linear-gradient(135deg, #63e0ff 0%, #4e8fff 100%);
  color: #0f1720;
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 16px 34px rgba(97,218,251,0.24);
}

/* ноут / desktop */
@media (max-width: 1400px) {
  .training-page {
    padding: 52px 70px 70px;
  }

  .tp-grid {
    gap: 26px;
  }

  .tp-card {
    height: 305px;
    padding: 34px 30px 30px;
  }

  .tp-card-content h3 {
    font-size: clamp(23px, 1.55vw, 30px);
  }

  .tp-card-content p {
    font-size: 16px;
  }
}

/* кіші ноут / планшет */
@media (max-width: 1100px) {
  .training-page {
    padding: 20px;
  }

  .tp-header {
    margin-bottom: 42px;
  }

  .tp-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tp-card {
    height: auto;
    min-height: 245px;
  }
}

/* телефон */
@media (max-width: 768px) {
  .training-page {
    min-height: 100dvh;
    padding: 24px 12px 96px;
  }

  .training-page--session {
    padding: 0 0 96px;
  }

  .tp-header {
    text-align: left;
    margin: 0 0 24px;
    padding: 0 4px;
  }

  .tp-title {
    font-size: clamp(34px, 10vw, 46px);
    margin-bottom: 10px;
  }

  .tp-subtitle {
    font-size: 14px;
    line-height: 1.55;
    max-width: 100%;
  }

  .tp-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .tp-card {
    height: auto;
    min-height: 158px;
    border-radius: 22px;
    padding: 18px;
    gap: 20px;
  }

  .tp-card-icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    font-size: 27px;
  }

  .tp-card-content h3 {
    font-size: 22px;
    line-height: 1.18;
    margin-bottom: 8px;
  }

  .tp-card-content p {
    font-size: 13px;
    line-height: 1.5;
  }

  .tp-ai-shell {
    border-radius: 22px;
    padding: 20px;
  }

  .tp-ai-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .tp-back-btn {
    width: 100%;
    min-height: 50px;
  }

  .tp-modal-content {
    border-radius: 24px;
    padding: 24px 18px;
  }
}

@media (max-width: 430px) {
  .tp-finish-mini-report {
    grid-template-columns: 1fr;
  }

  .training-page {
    padding-left: 8px;
    padding-right: 8px;
  }

  .tp-card {
    padding: 16px;
    border-radius: 20px;
    min-height: 150px;
  }

  .tp-card-content h3 {
    font-size: 20px;
  }

  .tp-ai-shell {
    padding: 16px;
    border-radius: 20px;
  }
}
      `}</style>
    </div>
  );
};

export default TrainingPage;