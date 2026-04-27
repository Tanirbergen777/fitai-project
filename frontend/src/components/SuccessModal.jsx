import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';

const SuccessModal = ({ isOpen, points = 0, report = null, onClose }) => {
  const { t } = useTranslation();

  const finalScore = useMemo(() => {
    const value = Number(report?.score ?? points ?? 0);
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(100, Math.round(value)));
  }, [points, report]);

  const completedText = report
    ? `${report.completedCount ?? 0}/${report.totalExercises ?? 0}`
    : '—';

  const performanceScore = report?.performanceScore ?? null;
  const skippedCount = report?.skippedCount ?? null;
  const checklistItems = Array.isArray(report?.results) ? report.results.slice(0, 4) : [];

  useEffect(() => {
    if (!isOpen) return undefined;

    const duration = 1800;
    const animationEnd = Date.now() + duration;
    let animationFrameId;

    const fire = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.85 },
        shapes: ['circle'],
        colors: ['#ff6b35', '#ffb703', '#ffd166'],
        scalar: 0.9,
      });

      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.85 },
        shapes: ['circle'],
        colors: ['#ff6b35', '#ffb703', '#ffd166'],
        scalar: 0.9,
      });

      if (Date.now() < animationEnd) {
        animationFrameId = requestAnimationFrame(fire);
      }
    };

    fire();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div
        className="success-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="success-modal-fire-circle">
          <span>🔥</span>
        </div>

        <div className="success-modal-badge">
          {t('training.report.saved', 'Workout report')}
        </div>

        <h2 id="success-modal-title">
          {t('training.finishModal.title', 'Жаттығу аяқталды!')}
        </h2>

        <p className="success-modal-subtitle">
          {report?.summary ||
            t(
              'training.finishModal.defaultSummary',
              'Жақсы жұмыс! Жаттығу нәтижесі сақталды.'
            )}
        </p>

        <div className="success-modal-score">
          <strong>+{finalScore}</strong>
          <span>⭐</span>
        </div>

        {report && (
          <div className="success-modal-stats">
            <div>
              <span>{t('training.report.completed', 'Аяқталған')}</span>
              <strong>{completedText}</strong>
            </div>

            <div>
              <span>{t('training.report.performance', 'Орындау сапасы')}</span>
              <strong>{performanceScore !== null ? `${performanceScore}%` : '—'}</strong>
            </div>

            <div>
              <span>{t('training.report.skipped', 'Өткізілген')}</span>
              <strong>{skippedCount ?? 0}</strong>
            </div>
          </div>
        )}

        {checklistItems.length > 0 && (
          <div className="success-modal-checklist">
            <h3>{t('training.report.shortChecklist', 'Қысқаша чек-лист')}</h3>

            {checklistItems.map((item) => (
              <div
                key={item.id || item.exerciseName}
                className={`success-modal-check-item ${item.status === 'completed' ? 'done' : 'skipped'}`}
              >
                <span>{item.status === 'completed' ? '✅' : '⏭'}</span>

                <div>
                  <strong>{item.exerciseName}</strong>
                  <p>
                    {item.status === 'completed'
                      ? `${t('training.report.donePercent', 'Орындалуы')}: ${item.performancePercent ?? 0}%`
                      : `${t('training.report.skipReason', 'Себебі')}: ${item.reasonLabel || '-'}`}
                  </p>

                  {item.status === 'completed' &&
                    item.cameraSummary &&
                    ((item.totalAttempts ?? 0) > 0 || typeof item.techniqueScore === 'number') && (
                      <div className="success-modal-camera-details">
                        {typeof item.techniqueScore === 'number' && (
                          <span>Technique: {item.techniqueScore}%</span>
                        )}

                        {(item.totalAttempts ?? 0) > 0 && typeof item.correctReps === 'number' && (
                          <span>Correct: {item.correctReps}</span>
                        )}

                        {(item.totalAttempts ?? 0) > 0 && typeof item.incorrectReps === 'number' && (
                          <span>Incorrect: {item.incorrectReps}</span>
                        )}

                        {(item.totalAttempts ?? 0) > 0 && item.labelSource && (
                          <span>{item.labelSource}</span>
                        )}
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}

        <button type="button" className="success-modal-button" onClick={onClose}>
          {t('training.finishModal.continue', 'Жалғастыру')}
        </button>
      </div>

      <style>{`
.success-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 12000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  box-sizing: border-box;
  background: rgba(7, 10, 16, 0.78);
  backdrop-filter: blur(16px);
  overflow-y: auto;
}

.success-modal-card {
  width: min(520px, 100%);
  max-height: calc(100dvh - 36px);
  overflow-y: auto;
  padding: 28px;
  border-radius: 30px;
  text-align: center;
  color: #fff;
  background:
    radial-gradient(circle at top, rgba(255, 107, 53, 0.16), transparent 34%),
    radial-gradient(circle at bottom right, rgba(97, 218, 251, 0.10), transparent 30%),
    linear-gradient(180deg, #252a35 0%, #1b2029 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.55);
  animation: successModalPop 0.26s ease-out;
  box-sizing: border-box;
}

.success-modal-fire-circle {
  width: 86px;
  height: 86px;
  margin: 0 auto 16px;
  border-radius: 999px;
  background: rgba(255, 107, 53, 0.12);
  border: 1px solid rgba(255, 107, 53, 0.26);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 40px rgba(255, 107, 53, 0.14);
}

.success-modal-fire-circle span {
  font-size: 40px;
}

.success-modal-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(97, 218, 251, 0.09);
  border: 1px solid rgba(97, 218, 251, 0.22);
  color: #7ce3ff;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.success-modal-card h2 {
  margin: 0 0 10px;
  font-size: clamp(25px, 5vw, 34px);
  font-weight: 950;
  line-height: 1.1;
}

.success-modal-subtitle {
  margin: 0 auto 18px;
  max-width: 420px;
  color: #b8c7df;
  font-size: 15px;
  line-height: 1.6;
}

.success-modal-score {
  width: fit-content;
  min-width: 150px;
  margin: 0 auto 18px;
  padding: 14px 20px;
  border-radius: 22px;
  background: rgba(255, 215, 0, 0.10);
  border: 1px solid rgba(255, 215, 0, 0.22);
  color: #ffd700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.success-modal-score strong {
  font-size: 34px;
  line-height: 1;
  font-weight: 950;
}

.success-modal-score span {
  font-size: 24px;
}

.success-modal-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 0 0 18px;
}

.success-modal-stats div {
  padding: 12px 10px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.success-modal-stats span {
  display: block;
  color: #9ea8b8;
  font-size: 11px;
  margin-bottom: 5px;
}

.success-modal-stats strong {
  color: #61dafb;
  font-size: 18px;
  font-weight: 950;
}

.success-modal-checklist {
  margin: 0 0 18px;
  text-align: left;
}

.success-modal-checklist h3 {
  margin: 0 0 10px;
  color: #fff;
  font-size: 16px;
  font-weight: 900;
}

.success-modal-check-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 11px 12px;
  border-radius: 15px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.success-modal-check-item.done {
  border-color: rgba(34, 197, 94, 0.18);
}

.success-modal-check-item.skipped {
  border-color: rgba(245, 158, 11, 0.22);
}

.success-modal-check-item > span {
  flex-shrink: 0;
  margin-top: 1px;
}

.success-modal-check-item strong {
  display: block;
  color: #fff;
  font-size: 14px;
  margin-bottom: 3px;
}

.success-modal-check-item p {
  margin: 0;
  color: #aab3c2;
  font-size: 12.5px;
  line-height: 1.45;
}

.success-modal-camera-details {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.success-modal-camera-details span {
  display: inline-flex;
  align-items: center;
  padding: 4px 7px;
  border-radius: 999px;
  background: rgba(97, 218, 251, 0.09);
  border: 1px solid rgba(97, 218, 251, 0.18);
  color: #7ce3ff;
  font-size: 11px;
  font-weight: 850;
}


.success-modal-button {
  width: 100%;
  min-height: 54px;
  border: none;
  border-radius: 18px;
  background: linear-gradient(135deg, #63e0ff 0%, #4e8fff 100%);
  color: #0f1720;
  font-size: 16px;
  font-weight: 950;
  cursor: pointer;
  box-shadow: 0 16px 34px rgba(97, 218, 251, 0.24);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.success-modal-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 20px 42px rgba(97, 218, 251, 0.30);
}

@keyframes successModalPop {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 520px) {
  .success-modal-overlay {
    align-items: flex-end;
    padding: 10px;
  }

  .success-modal-card {
    width: 100%;
    max-height: calc(100dvh - 20px);
    padding: 22px 16px 16px;
    border-radius: 26px;
  }

  .success-modal-fire-circle {
    width: 74px;
    height: 74px;
  }

  .success-modal-fire-circle span {
    font-size: 34px;
  }

  .success-modal-stats {
    grid-template-columns: 1fr;
  }

  .success-modal-score {
    width: 100%;
    box-sizing: border-box;
  }
}
      `}</style>
    </div>
  );
};

export default SuccessModal;
