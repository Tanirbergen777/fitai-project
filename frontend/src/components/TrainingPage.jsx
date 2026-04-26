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
            {t('common.back')}
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
    <div className="workout-page-container">
      {isFinished && (
        <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />
      )}

      {!selectedGoal && (
        <div className="training-header">
          <h1 className="workout-header">{t('menu.training')}</h1>
          <p className="training-subtitle">{t('training.heroSubtitle')}</p>
        </div>
      )}

      <div className="training-body tr-bd">
        {!selectedGoal ? (
          <div className="selection-grid">
            {selectionCards.map((card) => (
              <div
                key={card.key}
                className={`selection-card ${card.className}`}
                onClick={() => setSelectedGoal(card.key)}
              >
                <div className="selection-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            ))}
          </div>
        ) : (
          renderWorkout()
        )}
      </div>

      {isFinished && (
        <div className="modal-overlay" onClick={() => setIsFinished(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="fire-circle"><span>🔥</span></div>
            <h2 style={{ color: 'white' }}>{t('training.finishModal.title')}</h2>
            <p style={{ color: '#abb2bf' }}>
              {t('training.finishModal.received')} <span style={{ color: '#ffd700' }}>+50 ⭐</span>
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
  display: flex;
  flex-direction: column;
  min-width: 100%;
  min-height: 100vh;
  color: white;
  background-color: #1c1f24;
  padding: 20px;
  box-sizing: border-box;
  align-items: stretch;
}

.training-header {
  text-align: center;
  margin-bottom: 40px;
}

.workout-header {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 900;
  margin-bottom: 10px;
}

.training-subtitle {
  color: #aab3c2;
  font-size: 16px;
}

.training-body {
  width: 100%;
  display: block;
}

.selection-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  gap: 20px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.selection-card {
  flex: 1;
  min-width: 260px;
  max-width: 360px;
  background: #232833;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 24px;
  padding: 28px;
  cursor: pointer;
  transition: 0.25s ease;
  box-shadow: 0 15px 35px rgba(0,0,0,0.25);
}

.selection-card:hover {
  transform: translateY(-6px);
  background: #2c313a;
  border-color: rgba(97, 218, 251, 0.4);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
}

.selection-card.ai {
  border: 1px dashed rgba(198, 120, 221, 0.45);
  background: rgba(198, 120, 221, 0.04);
}

.selection-card.ai:hover {
  border-color: #c678dd;
  box-shadow: 0 15px 35px rgba(198, 120, 221, 0.22);
}

.selection-icon {
  font-size: 40px;
  margin-bottom: 20px;
}

.selection-card h3 {
  margin: 0 0 12px 0;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
}

.selection-card p {
  margin: 0;
  color: #9da5b4;
  font-size: 14px;
  line-height: 1.5;
}

.training-ai-shell {
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(180deg, #232833 0%, #1b2029 100%);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 28px;
  padding: 32px;
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
  font-weight: 800;
  margin-bottom: 16px;
}

.training-ai-title {
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 900;
  margin: 0 0 10px 0;
}

.training-ai-text {
  color: #aab3c2;
  line-height: 1.7;
  font-size: 15px;
  margin-bottom: 26px;
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
}

.training-ai-icon {
  font-size: 30px;
  margin-bottom: 12px;
}

.training-ai-card h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 800;
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
  font-weight: 800;
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

.training-back-btn:hover {
  transform: translateY(-2px);
  background: rgba(97, 218, 251, 0.16);
  box-shadow: 0 10px 30px rgba(97, 218, 251, 0.18);
}

@media (max-width: 1100px) {
  .selection-grid {
    flex-wrap: wrap;
  }
}

@media (max-width: 900px) {
  .training-ai-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .selection-grid {
    flex-direction: column;
    align-items: center;
  }

  .selection-card {
    width: 100%;
    max-width: 400px;
  }

  .training-ai-shell {
    padding: 22px;
  }
}
      `}</style>
    </div>
  );
};

export default TrainingPage;
