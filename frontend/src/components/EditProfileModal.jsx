import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { useTranslation } from 'react-i18next';

const EditProfileModal = ({ user, aiResult, onClose, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    birth_date: user?.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : '',
    weight: aiResult?.weight || user?.weight || '',
    height: aiResult?.height || user?.height || '',
    activity_level: aiResult?.activity_level || user?.activity_level || 1,
    goal: aiResult?.goal || user?.goal || 'Улучшение формы',
    target_weight: aiResult?.target_weight || user?.target_weight || '',
    requested_weeks: aiResult?.target_timeframe_weeks || user?.target_timeframe_weeks || 12,
  });

  const [warningData, setWarningData] = useState(null);
  const [mlVerdict, setMlVerdict] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);

  useEffect(() => {
    const checkTimeframe = async () => {
      const { weight, height, goal, target_weight, requested_weeks, birth_date } = formData;
      if (!['Похудение', 'Набор массы'].includes(goal) || !target_weight || !requested_weeks || !weight || !height) {
        setMlVerdict(null);
        return;
      }
      
      const targetW = parseFloat(target_weight);
      const currentW = parseFloat(weight);
      const reqDays = parseInt(requested_weeks) * 7;
      
      if (goal === 'Похудение' && targetW >= currentW) return;
      if (goal === 'Набор массы' && targetW <= currentW) return;

      setMlLoading(true);
      try {
        const age = birth_date ? new Date().getFullYear() - new Date(birth_date).getFullYear() : 30;
        const response = await fetch(`${API_BASE_URL}/predict-goal-timeframe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            age,
            height: parseFloat(height),
            weight: currentW,
            target_weight: targetW,
            goal: goal,
            requested_days: reqDays
          })
        });
        if (response.ok) {
            const data = await response.json();
            setMlVerdict(data);
        } else {
            setMlVerdict(null);
        }
      } catch (err) {
        console.error("ML timeframe error:", err);
        setMlVerdict(null);
      } finally {
        setMlLoading(false);
      }
    };
    
    const timeoutId = setTimeout(checkTimeframe, 800);
    return () => clearTimeout(timeoutId);
  }, [formData.weight, formData.height, formData.goal, formData.target_weight, formData.requested_weeks, formData.birth_date]);

  const calculateBmi = (weight, height) => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h) return { bmi: 0, category: '', color: '' };
    const heightM = h / 100;
    const bmi = w / (heightM * heightM);
    
    let category = '';
    let color = '';
    if (bmi < 18.5) { category = t('profile.editModal.bmiCategories.underweight'); color = '#ffb703'; }
    else if (bmi < 25) { category = t('profile.editModal.bmiCategories.normal'); color = '#22c55e'; }
    else if (bmi < 30) { category = t('profile.editModal.bmiCategories.overweight'); color = '#f59e0b'; }
    else if (bmi < 35) { category = t('profile.editModal.bmiCategories.obese1'); color = '#ef4444'; }
    else if (bmi < 40) { category = t('profile.editModal.bmiCategories.obese2'); color = '#dc2626'; }
    else { category = t('profile.editModal.bmiCategories.obese3'); color = '#991b1b'; }
    
    return { bmi, category, color };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanedData = {
      username: String(formData.username).trim(),
      birth_date: formData.birth_date,
      weight: parseFloat(formData.weight) || 0,
      height: parseFloat(formData.height) || 0,
      activity_level: Number(formData.activity_level) || 1,
      goal: formData.goal,
      target_weight: ['Похудение', 'Набор массы'].includes(formData.goal) 
        ? parseFloat(formData.target_weight) || null 
        : null,
      target_timeframe_weeks: ['Похудение', 'Набор массы'].includes(formData.goal) 
        ? parseInt(formData.requested_weeks) || null 
        : null,
      target_workouts_per_week: mlVerdict?.workouts_per_week || null,
      target_calories_per_workout: mlVerdict?.calories_per_workout || null,
      target_duration_per_workout: mlVerdict?.duration_per_workout || null,
    };

    if (cleanedData.target_weight) {
      if (cleanedData.goal === 'Похудение' && cleanedData.target_weight >= cleanedData.weight) {
        setWarningData({
          show: true,
          isError: true,
          message: t('profile.editModal.errors.weightLossRule'),
          data: null,
        });
        return;
      }
      
      if (cleanedData.goal === 'Набор массы' && cleanedData.target_weight <= cleanedData.weight) {
        setWarningData({
          show: true,
          isError: true,
          message: t('profile.editModal.errors.muscleGainRule'),
          data: null,
        });
        return;
      }

      const { bmi, category } = calculateBmi(cleanedData.target_weight, cleanedData.height);
      if (bmi > 0 && (bmi < 18.5 || bmi >= 30)) {
        setWarningData({
          show: true,
          message: t('profile.editModal.errors.bmiWarning', { bmi: bmi.toFixed(1), category: category }),
          data: cleanedData,
        });
        return;
      }
    }

    onSave(cleanedData);
  };

  return (
    <div className="edit-profile-overlay" style={modalOverlayStyle}>
      <div className="edit-profile-modal" style={modalContentStyle}>
        <div className="edit-profile-header" style={modalHeaderStyle}>
          <h2 className="edit-profile-title" style={{ margin: 0, fontSize: '20px' }}>
            {t('profile.editModal.title')}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="edit-profile-close"
            style={closeButtonStyle}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form" style={formStyle}>
          <label className="edit-profile-label" style={labelStyle}>
            {t('profile.editModal.username')}
          </label>

          <input
            className="edit-profile-input"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            style={inputStyle}
            placeholder={t('profile.editModal.usernamePlaceholder')}
            autoComplete="name"
            required
          />

          <label className="edit-profile-label" style={labelStyle}>
            {t('profile.editModal.birthDate')}
          </label>

          <input
            className="edit-profile-input"
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          <div className="edit-profile-row" style={rowContainerStyle}>
            <div className="edit-profile-group" style={inputGroupStyle}>
              <label className="edit-profile-label" style={labelStyle}>
                {t('profile.editModal.weight')}
              </label>

              <input
                className="edit-profile-input"
                type="number"
                step="0.1"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                style={inputStyle}
                placeholder="70"
                inputMode="decimal"
                required
              />
            </div>

            <div className="edit-profile-group" style={inputGroupStyle}>
              <label className="edit-profile-label" style={labelStyle}>
                {t('profile.editModal.height')}
              </label>

              <input
                className="edit-profile-input"
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                style={inputStyle}
                placeholder="170"
                inputMode="numeric"
                required
              />
            </div>
          </div>

          {(() => {
            const { bmi, category, color } = calculateBmi(formData.weight, formData.height);
            if (!bmi) return null;

            return (
              <div style={{ marginBottom: '20px', fontSize: '14px', color: '#aab3c2', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>{t('profile.editModal.bmiLabel')}</span>
                <strong style={{ color }}>{bmi.toFixed(1)} - {category}</strong>
              </div>
            );
          })()}

          <label className="edit-profile-label" style={labelStyle}>
            {t('profile.editModal.goal')}
          </label>

          <select
            className="edit-profile-input edit-profile-select"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            style={{ ...inputStyle, marginBottom: ['Похудение', 'Набор массы'].includes(formData.goal) ? '12px' : '24px' }}
          >
            <option value="Похудение">{t("profile.editModal.goalOptions.weightLoss")}</option>
            <option value="Набор массы">{t("profile.editModal.goalOptions.muscleGain")}</option>
            <option value="Улучшение формы">{t("profile.editModal.goalOptions.maintain")}</option>

            {!['Похудение', 'Набор массы', 'Улучшение формы'].includes(formData.goal) && (
              <option value={formData.goal}>{formData.goal}</option>
            )}
          </select>

          {['Похудение', 'Набор массы'].includes(formData.goal) && (
            <div style={{ marginBottom: '24px' }}>
              <label className="edit-profile-label" style={labelStyle}>
                {t('profile.editModal.targetWeight')}
              </label>

              <input
                className="edit-profile-input"
                type="number"
                step="0.1"
                name="target_weight"
                value={formData.target_weight || ''}
                onChange={handleChange}
                style={inputStyle}
                placeholder={t('profile.editModal.targetWeightPlaceholder')}
                inputMode="decimal"
                required
              />

              {(() => {
                const { bmi: targetBmi, category, color } = calculateBmi(formData.target_weight, formData.height);
                if (!targetBmi) return null;

                return (
                  <div style={{ marginTop: '8px', fontSize: '13px', color: '#aab3c2' }}>
                    {t('profile.editModal.targetBmiLabel')} <strong style={{ color }}>{targetBmi.toFixed(1)} - {category}</strong>
                  </div>
                );
              })()}

              <label className="edit-profile-label" style={{...labelStyle, marginTop: '16px', display: 'block'}}>
                {t('profile.editModal.targetWeeks')}
              </label>

              <input
                className="edit-profile-input"
                type="number"
                name="requested_weeks"
                value={formData.requested_weeks || ''}
                onChange={handleChange}
                style={inputStyle}
                placeholder={t('profile.editModal.targetWeeksPlaceholder')}
                required
              />

              {mlLoading && (
                <div style={{ marginTop: '8px', fontSize: '13px', color: '#aab3c2' }}>
                  {t('profile.editModal.mlLoading')}
                </div>
              )}

              {mlVerdict && !mlLoading && (
                <div style={{ 
                  marginTop: '12px', 
                  padding: '12px', 
                  borderRadius: '10px', 
                  background: mlVerdict.is_realistic ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${mlVerdict.is_realistic ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                }}>
                  {mlVerdict.is_realistic ? (
                    <>
                      <span style={{ color: '#4ade80', fontSize: '13px', fontWeight: 'bold', display: 'block' }}>
                        {t('profile.editModal.mlGoodVerdict')}
                      </span>
                      {mlVerdict.workouts_per_week && (
                        <span style={{ color: '#aab3c2', fontSize: '12px', display: 'block', marginTop: '6px', lineHeight: '1.6' }}>
                          🏋️ {t('profile.editModal.mlOptimalPlan')} <strong>{mlVerdict.workouts_per_week} {t('profile.editModal.timesPerWeek')}</strong><br/>
                          ⏱️ {t('profile.editModal.perWorkout')} <strong>~{mlVerdict.duration_per_workout} {t('profile.editModal.min')}</strong> {t('profile.editModal.burnAbout')} <strong>{mlVerdict.calories_per_workout} {t('profile.editModal.kcal')}</strong>
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span style={{ color: '#fca5a5', fontSize: '13px', fontWeight: 'bold', display: 'block' }}>
                        {t('profile.editModal.mlBadVerdict', { weeks: Math.ceil(mlVerdict.recommended_days / 7) })}
                      </span>
                      {mlVerdict.workouts_per_week && (
                        <span style={{ color: '#aab3c2', fontSize: '12px', display: 'block', marginTop: '6px', lineHeight: '1.6' }}>
                          🏋️ {t('profile.editModal.mlHeavyPlan')} <strong>{mlVerdict.workouts_per_week} {t('profile.editModal.heavyWorkouts')}</strong><br/>
                          ⏱️ {t('profile.editModal.perWorkout')} <strong>~{mlVerdict.duration_per_workout} {t('profile.editModal.min')}</strong> {t('profile.editModal.burnAbout')} <strong>{mlVerdict.calories_per_workout} {t('profile.editModal.kcal')}</strong>
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {warningData?.show ? (
            <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <p style={{ margin: '0 0 12px', color: '#fca5a5', fontSize: '14px', lineHeight: '1.5' }}>
                ⚠️ <strong>{t('profile.editModal.errors.attention')}</strong> {warningData.message}
              </p>
              {warningData.isError ? (
                <button
                  type="button"
                  onClick={() => setWarningData(null)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #4b5563', background: 'transparent', color: '#e5e7eb', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                >
                  {t('profile.editModal.errors.gotIt')}
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => onSave(warningData.data)}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                  >
                    {t('profile.editModal.errors.yesSave')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWarningData(null)}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #4b5563', background: 'transparent', color: '#e5e7eb', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                  >
                    {t('profile.editModal.errors.cancel')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="submit"
              className="edit-profile-save"
              style={saveButtonStyle}
            >
              {t('profile.editModal.save')}
            </button>
          )}
        </form>
      </div>

      <style>{`
/* Desktop: бұрынғы inline style сақталады */

.edit-profile-overlay,
.edit-profile-modal,
.edit-profile-form,
.edit-profile-input,
.edit-profile-save,
.edit-profile-close {
  pointer-events: auto;
}

.edit-profile-input {
  user-select: text;
}

/* Phone UI + scroll */
@media (max-width: 768px) {
  .edit-profile-overlay {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    align-items: flex-start !important;
    justify-content: center !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
    touch-action: pan-y;
    padding: 72px 12px 150px !important;
    box-sizing: border-box !important;
  }

  .edit-profile-modal {
    width: 100% !important;
    max-width: 430px !important;
    margin: 0 auto !important;
    padding: 22px !important;
    border-radius: 24px !important;
    box-sizing: border-box !important;
    flex-shrink: 0 !important;
  }

  .edit-profile-header {
    margin-bottom: 22px !important;
    align-items: flex-start !important;
    gap: 12px !important;
  }

  .edit-profile-title {
    font-size: clamp(22px, 7vw, 30px) !important;
    line-height: 1.15 !important;
    color: var(--text-primary) !important;
  }

  .edit-profile-close {
    width: 42px !important;
    height: 42px !important;
    border-radius: 14px !important;
    background: rgba(255,255,255,0.06) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
  }

  .edit-profile-form {
    gap: 13px !important;
  }

  .edit-profile-label {
    font-size: 12px !important;
    color: rgba(255,255,255,0.64) !important;
    margin-bottom: -6px !important;
  }

  .edit-profile-input {
    width: 100% !important;
    min-height: 52px !important;
    border-radius: 16px !important;
    font-size: 16px !important;
    padding: 0 14px !important;
    box-sizing: border-box !important;
  }

  .edit-profile-select {
    padding-right: 36px !important;
  }

  .edit-profile-row {
    gap: 10px !important;
  }

  .edit-profile-group {
    min-width: 0 !important;
  }

  .edit-profile-save {
    width: 100% !important;
    min-height: 56px !important;
    border-radius: 18px !important;
    font-size: 15px !important;
    font-weight: 900 !important;
    margin-top: 8px !important;
    touch-action: manipulation;
  }
}

/* Small phone */
@media (max-width: 430px) {
  .edit-profile-overlay {
    padding-left: 8px !important;
    padding-right: 8px !important;
    padding-top: 70px !important;
    padding-bottom: 155px !important;
  }

  .edit-profile-modal {
    padding: 18px !important;
    border-radius: 22px !important;
  }

  .edit-profile-row {
    flex-direction: column !important;
    gap: 13px !important;
  }

  .edit-profile-input {
    min-height: 50px !important;
  }

  .edit-profile-save {
    min-height: 54px !important;
  }
}
      `}</style>
    </div>
  );
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0,0,0,0.85)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalContentStyle = {
  background: 'var(--card-bg)',
  padding: '30px',
  borderRadius: '20px',
  width: '100%',
  maxWidth: '400px',
  maxHeight: '90vh',
  overflowY: 'auto',
  border: '1px solid var(--border-color)',
  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
  boxSizing: 'border-box'
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '25px',
  color: 'var(--text-primary)'
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  fontSize: '28px',
  cursor: 'pointer',
  lineHeight: '1'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px'
};

const labelStyle = {
  color: 'var(--text-secondary)',
  fontSize: '11px',
  textAlign: 'left',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  marginBottom: '2px'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '10px',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-sidebar)',
  color: 'var(--text-primary)',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box'
};

const rowContainerStyle = {
  display: 'flex',
  gap: '15px',
  width: '100%'
};

const inputGroupStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0
};

const saveButtonStyle = {
  padding: '14px',
  borderRadius: '12px',
  border: 'none',
  background: '#61dafb',
  color: '#282c34',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '10px',
  fontSize: '16px'
};

export default EditProfileModal;