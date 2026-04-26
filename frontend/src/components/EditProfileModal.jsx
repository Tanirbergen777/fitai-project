import React, { useState } from 'react';

const EditProfileModal = ({ user, aiResult, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    birth_date: user?.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : '',
    weight: aiResult?.weight || user?.weight || '',
    height: aiResult?.height || user?.height || '',
    activity_level: aiResult?.activity_level || user?.activity_level || 1,
    goal: aiResult?.goal || user?.goal || 'Улучшение формы',
  });

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
    };

    onSave(cleanedData);
  };

  return (
    <div className="edit-profile-overlay" style={modalOverlayStyle}>
      <div className="edit-profile-modal" style={modalContentStyle}>
        <div className="edit-profile-header" style={modalHeaderStyle}>
          <h2 className="edit-profile-title" style={{ margin: 0, fontSize: '20px' }}>
            Редактировать профиль
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
            Имя пользователя
          </label>

          <input
            className="edit-profile-input"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            style={inputStyle}
            placeholder="Введите имя"
            autoComplete="name"
            required
          />

          <label className="edit-profile-label" style={labelStyle}>
            Дата рождения
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
                Вес (кг)
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
                Рост (см)
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

          <label className="edit-profile-label" style={labelStyle}>
            Цель
          </label>

          <select
            className="edit-profile-input edit-profile-select"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="Похудение">Похудение</option>
            <option value="Набор массы">Набор массы</option>
            <option value="Улучшение формы">Улучшение формы</option>

            {!['Похудение', 'Набор массы', 'Улучшение формы'].includes(formData.goal) && (
              <option value={formData.goal}>{formData.goal}</option>
            )}
          </select>

          <button
            type="submit"
            className="edit-profile-save"
            style={saveButtonStyle}
          >
            СОХРАНИТЬ ИЗМЕНЕНИЯ
          </button>
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
    color: #ffffff !important;
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
  background: '#20232a',
  padding: '30px',
  borderRadius: '20px',
  width: '100%',
  maxWidth: '400px',
  border: '1px solid #3e4451',
  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
  boxSizing: 'border-box'
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '25px',
  color: 'white'
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#abb2bf',
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
  color: '#abb2bf',
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
  border: '1px solid #3e4451',
  background: '#1c1e22',
  color: 'white',
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