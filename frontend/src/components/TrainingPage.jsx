import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Confetti from 'react-confetti';
import MassGainWorkout from './workouts/MassGainWorkout';
import LoseWeightWorkout from './workouts/LoseWeightWorkout';
import GeneralWorkout from './workouts/GeneralWorkout';

const TrainingPage = ({ onComplete, setActiveTab }) => {
  const { t } = useTranslation();
  const [isFinished, setIsFinished] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const hasAwardedRef = useRef(false);

  const handleWorkoutComplete = () => {
    if (!hasAwardedRef.current) {
      hasAwardedRef.current = true;
      setIsFinished(true);
      if (onComplete) onComplete(50);
    }
  };

  const renderAITraining = () => {
    return (
      <div className="training-ai-shell">
        <div className="training-ai-badge">{t('training.ai.badge')}</div>

        <h2 className="training-ai-title">{t('training.ai.title')}</h2>
        <p className="training-ai-text">{t('training.ai.subtitle')}</p>

        <div className="training-ai-grid">
          <div className="training-ai-card">
            <div className="training-ai-icon">🎯</div>
            <h3>{t('training.ai.cards.goal.title')}</h3>
            <p>{t('training.ai.cards.goal.text')}</p>
          </div>

          <div className="training-ai-card">
            <div className="training-ai-icon">📈</div>
            <h3>{t('training.ai.cards.level.title')}</h3>
            <p>{t('training.ai.cards.level.text')}</p>
          </div>

          <div className="training-ai-card">
            <div className="training-ai-icon">⏱️</div>
            <h3>{t('training.ai.cards.duration.title')}</h3>
            <p>{t('training.ai.cards.duration.text')}</p>
          </div>

          <div className="training-ai-card">
            <div className="training-ai-icon">🛡️</div>
            <h3>{t('training.ai.cards.limitations.title')}</h3>
            <p>{t('training.ai.cards.limitations.text')}</p>
          </div>
        </div>

        <div className="training-ai-note">
          <h3>{t('training.ai.futureTitle')}</h3>
          <p>{t('training.ai.futureText')}</p>
        </div>

        <div className="training-ai-actions">
          <button className="training-back-btn" onClick={() => setSelectedGoal(null)}>
            ← {t('common.back')}
          </button>
        </div>
      </div>
    );
  };

  const renderWorkout = () => {
    const props = {
      onAllStepsComplete: handleWorkoutComplete,
      isFinished,
      onBack: () => setSelectedGoal(null),
    };

    if (selectedGoal === 'gain') return <MassGainWorkout {...props} />;
    if (selectedGoal === 'lose') return <LoseWeightWorkout {...props} />;
    if (selectedGoal === 'general') return <GeneralWorkout {...props} />;
    if (selectedGoal === 'ai') return renderAITraining();

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
    <div
      className={`workout-page-container ${
        selectedGoal ? 'workout-page-container--session' : ''
      }`}
    >
      {isFinished && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
        />
      )}

      {!selectedGoal && (
        <div className="training-header">
          <div className="training-hero-badge">AI Fitness</div>
          <h1 className="workout-header">{t('menu.training')}</h1>
          <p className="training-subtitle">{t('training.heroSubtitle')}</p>
        </div>
      )}

      <div className={`training-body ${selectedGoal ? 'training-body--session' : ''}`}>
        {!selectedGoal ? (
          <div className="selection-grid">
            {selectionCards.map((card) => (
              <button
                type="button"
                key={card.key}
                className={`selection-card ${card.className}`}
                onClick={() => setSelectedGoal(card.key)}
              >
                <div className="selection-card-top">
                  <div className="selection-icon">{card.icon}</div>
                  <div className="selection-arrow">›</div>
                </div>

                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </button>
            ))}
          </div>
        ) : (
          renderWorkout()
        )}
      </div>

      {isFinished && (
        <div className="modal-overlay" onClick={() => setIsFinished(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="fire-circle">
              <span>🔥</span>
            </div>

            <h2>{t('training.finishModal.title')}</h2>

            <p>
              {t('training.finishModal.received')}{' '}
              <span className="modal-stars">+50 ⭐</span>
            </p>

            <button
              className="continue-button"
              onClick={() => {
                if (typeof setActiveTab === 'function') {
                  setActiveTab('main');
                } else {
                  setIsFinished(false);
                }
              }}
            >
              {t('training.finishModal.continue')}
            </button>
          </div>
        </div>
      )}

      <style>{`
.workout-page-container {
  width: 100%;
  min-width: 0;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  color: white;
  background:
    radial-gradient(circle at top left, rgba(97, 218, 251, 0.08), transparent 28%),
    radial-gradient(circle at top right, rgba(198, 120, 221, 0.08), transparent 26%),
    #1c1f24;
  padding: 24px;
  box-sizing: border-box;
  align-items: stretch;
  overflow-x: hidden;
  overflow-y: auto;
}

.workout-page-container--session {
  padding: 14px;
  background: transparent;
}

.training-header {
  width: 100%;
  text-align: center;
  margin: 8px auto 42px;
  max-width: 980px;
}

.training-hero-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(97, 218, 251, 0.1);
  border: 1px solid rgba(97, 218, 251, 0.25);
  color: #7ce3ff;
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 18px;
  letter-spacing: 0.04em;
}

.workout-header {
  font-size: clamp(42px, 5vw, 72px);
  line-height: 1.02;
  font-weight: 950;
  margin: 0 0 14px;
  letter-spacing: -0.04em;
  color: #61dafb;
  text-shadow: 0 18px 50px rgba(97, 218, 251, 0.18);
}

.training-subtitle {
  color: #b8c7df;
  font-size: 18px;
  line-height: 1.6;
  margin: 0 auto;
  max-width: 760px;
}

.training-body {
  width: 100%;
  display: block;
  min-width: 0;
}

.training-body--session {
  flex: 1;
  min-height: 0;
}

/* DESKTOP: ескі формат сияқты 4 карточка бір қатарда */
.selection-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
  width: min(1680px, 100%);
  margin: 0 auto;
  align-items: stretch;
}

.selection-card {
  width: 100%;
  min-width: 0;
  min-height: 320px;
  text-align: left;
  color: #fff;
  background:
    radial-gradient(circle at top right, rgba(97, 218, 251, 0.10), transparent 34%),
    linear-gradient(180deg, #252a35 0%, #1d222c 100%);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 28px;
  padding: 30px;
  cursor: pointer;
  transition:
    transform 0.25s ease,
    background 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
  box-shadow: 0 18px 42px rgba(0,0,0,0.28);
  font-family: inherit;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  touch-action: manipulation;
  overflow: hidden;
}

.selection-card:hover {
  transform: translateY(-6px);
  background:
    radial-gradient(circle at top right, rgba(97, 218, 251, 0.16), transparent 34%),
    linear-gradient(180deg, #2c313d 0%, #202630 100%);
  border-color: rgba(97, 218, 251, 0.42);
  box-shadow: 0 24px 54px rgba(0, 0, 0, 0.42);
}

.selection-card:active {
  transform: scale(0.985);
}

.selection-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 30px;
}

.selection-icon {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(97, 218, 251, 0.11);
  border: 1px solid rgba(97, 218, 251, 0.14);
  font-size: 32px;
  flex-shrink: 0;
  box-shadow: 0 14px 30px rgba(0,0,0,0.14);
}

.selection-arrow {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #61dafb;
  background: rgba(97, 218, 251, 0.08);
  border: 1px solid rgba(97, 218, 251, 0.15);
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
}

.selection-card h3 {
  margin: auto 0 14px 0;
  font-size: clamp(24px, 1.8vw, 34px);
  font-weight: 950;
  line-height: 1.16;
  word-break: normal;
  overflow-wrap: break-word;
  hyphens: none;
}

.selection-card p {
  margin: 0;
  color: #a5afbf;
  font-size: 16px;
  line-height: 1.55;
}

.selection-card.gain {
  background:
    radial-gradient(circle at top right, rgba(97, 218, 251, 0.13), transparent 34%),
    linear-gradient(180deg, #252a35 0%, #1d222c 100%);
}

.selection-card.lose {
  background:
    radial-gradient(circle at top right, rgba(255, 96, 96, 0.12), transparent 34%),
    linear-gradient(180deg, #252a35 0%, #1d222c 100%);
}

.selection-card.general {
  background:
    radial-gradient(circle at top right, rgba(255, 211, 105, 0.11), transparent 34%),
    linear-gradient(180deg, #252a35 0%, #1d222c 100%);
}

.selection-card.ai {
  border: 1px dashed rgba(198, 120, 221, 0.48);
  background:
    radial-gradient(circle at top right, rgba(198, 120, 221, 0.15), transparent 34%),
    linear-gradient(180deg, rgba(198, 120, 221, 0.08) 0%, #1d222c 100%);
}

.selection-card.ai:hover {
  border-color: #c678dd;
  box-shadow: 0 22px 52px rgba(198, 120, 221, 0.22);
}

.selection-card.ai .selection-icon {
  background: rgba(198, 120, 221, 0.12);
  border-color: rgba(198, 120, 221, 0.18);
}

.selection-card.ai .selection-arrow {
  color: #d8a8ea;
  background: rgba(198, 120, 221, 0.10);
  border-color: rgba(198, 120, 221, 0.18);
}

.training-ai-shell {
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

.training-ai-badge {
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

.training-ai-title {
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 950;
  line-height: 1.08;
  margin: 0 0 10px 0;
  letter-spacing: -0.02em;
}

.training-ai-text {
  color: #aab3c2;
  line-height: 1.7;
  font-size: 15px;
  margin: 0 0 26px;
  max-width: 860px;
}

.training-ai-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

.training-ai-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 22px;
  padding: 22px;
  min-width: 0;
}

.training-ai-icon {
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

.training-ai-card h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 900;
  line-height: 1.25;
}

.training-ai-card p {
  margin: 0;
  color: #c8d1df;
  line-height: 1.6;
  font-size: 14px;
}

.training-ai-note {
  margin-top: 10px;
  padding: 20px;
  border-radius: 20px;
  background: rgba(97, 218, 251, 0.08);
  border: 1px solid rgba(97, 218, 251, 0.18);
}

.training-ai-note h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 900;
}

.training-ai-note p {
  margin: 0;
  color: #c8d1df;
  line-height: 1.7;
  font-size: 14px;
}

.training-ai-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 24px;
}

.training-back-btn {
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

.training-back-btn:hover {
  transform: translateY(-2px);
  background: rgba(97, 218, 251, 0.16);
  box-shadow: 0 10px 30px rgba(97, 218, 251, 0.18);
}

.modal-overlay {
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

.modal-content {
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

.fire-circle {
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

.modal-content h2 {
  color: #fff;
  margin: 0 0 10px;
  font-size: 26px;
  font-weight: 950;
}

.modal-content p {
  color: #abb2bf;
  margin: 0 0 22px;
  line-height: 1.55;
}

.modal-stars {
  color: #ffd700;
  font-weight: 900;
}

.continue-button {
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

/* Smaller laptop: still desktop style, 4 cards */
@media (max-width: 1350px) {
  .workout-page-container {
    padding: 22px;
  }

  .selection-grid {
    width: min(1180px, 100%);
    gap: 20px;
  }

  .selection-card {
    min-height: 300px;
    padding: 26px;
  }

  .selection-card h3 {
    font-size: clamp(22px, 1.9vw, 30px);
  }

  .selection-card p {
    font-size: 15px;
  }
}

/* Small laptop: keep 4 cards, but make them compact */
@media (max-width: 1120px) {
  .selection-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    width: 100%;
  }

  .selection-card {
    min-height: 280px;
    padding: 22px;
    border-radius: 24px;
  }

  .selection-icon {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    font-size: 28px;
  }

  .selection-card h3 {
    font-size: clamp(20px, 2vw, 26px);
    line-height: 1.15;
  }

  .selection-card p {
    font-size: 14px;
  }
}

/* Tablet: 2 columns */
@media (max-width: 900px) {
  .workout-page-container {
    padding: 18px;
  }

  .workout-page-container--session {
    padding: 10px;
  }

  .selection-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
    gap: 16px;
  }

  .selection-card {
    min-height: 230px;
  }

  .training-ai-grid {
    grid-template-columns: 1fr;
  }
}

/* Phone: 1 column */
@media (max-width: 768px) {
  .workout-page-container {
    min-height: 100dvh;
    padding: 12px 10px 96px;
    background:
      radial-gradient(circle at top, rgba(97,218,251,0.10), transparent 28%),
      #1c1f24;
  }

  .workout-page-container--session {
    padding: 6px 6px 96px;
  }

  .training-header {
    text-align: left;
    margin: 10px 0 22px;
    padding: 0 4px;
  }

  .training-hero-badge {
    padding: 7px 12px;
    font-size: 11px;
    margin-bottom: 12px;
  }

  .workout-header {
    font-size: clamp(32px, 10vw, 42px);
    margin-bottom: 10px;
  }

  .training-subtitle {
    font-size: 14px;
    line-height: 1.55;
    max-width: 100%;
  }

  .selection-grid {
    width: 100%;
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .selection-card {
    min-width: 0;
    min-height: 152px;
    border-radius: 22px;
    padding: 18px;
  }

  .selection-card-top {
    margin-bottom: 16px;
  }

  .selection-icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    font-size: 27px;
  }

  .selection-arrow {
    width: 32px;
    height: 32px;
    font-size: 24px;
  }

  .selection-card h3 {
    font-size: 21px;
    line-height: 1.18;
    margin-bottom: 8px;
    word-break: normal;
    overflow-wrap: break-word;
  }

  .selection-card p {
    font-size: 13px;
    line-height: 1.5;
  }

  .training-ai-shell {
    border-radius: 22px;
    padding: 20px;
  }

  .training-ai-badge {
    padding: 7px 12px;
    font-size: 11px;
  }

  .training-ai-title {
    font-size: clamp(26px, 8vw, 34px);
  }

  .training-ai-text {
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 18px;
  }

  .training-ai-grid {
    gap: 12px;
  }

  .training-ai-card {
    border-radius: 18px;
    padding: 16px;
  }

  .training-ai-icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    font-size: 23px;
    margin-bottom: 12px;
  }

  .training-ai-card h3 {
    font-size: 17px;
  }

  .training-ai-card p {
    font-size: 13px;
  }

  .training-ai-note {
    padding: 16px;
    border-radius: 18px;
  }

  .training-back-btn {
    width: 100%;
    min-height: 50px;
  }

  .modal-content {
    border-radius: 24px;
    padding: 24px 18px;
  }

  .fire-circle {
    width: 74px;
    height: 74px;
    font-size: 34px;
  }

  .modal-content h2 {
    font-size: 24px;
  }
}

/* Small phone */
@media (max-width: 430px) {
  .workout-page-container {
    padding-left: 8px;
    padding-right: 8px;
  }

  .workout-page-container--session {
    padding-left: 4px;
    padding-right: 4px;
  }

  .selection-card {
    padding: 16px;
    border-radius: 20px;
    min-height: 146px;
  }

  .selection-card h3 {
    font-size: 20px;
  }

  .training-ai-shell {
    padding: 16px;
    border-radius: 20px;
  }
}
      `}</style>
    </div>
  );
};

export default TrainingPage;