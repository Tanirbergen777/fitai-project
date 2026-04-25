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
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={modalHeaderStyle}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Редактировать профиль</h2>
          <button onClick={onClose} style={closeButtonStyle}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <label style={labelStyle}>Имя пользователя</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            style={inputStyle}
            placeholder="Введите имя"
            required
          />

          <label style={labelStyle}>Дата рождения</label>
          <input
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          {/* Исправленный блок Вес и Рост */}
          <div style={rowContainerStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Вес (кг)</label>
              <input
                type="number"
                step="0.1"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                style={inputStyle}
                placeholder="70"
                required
              />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Рост (см)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                style={inputStyle}
                placeholder="170"
                required
              />
            </div>
          </div>

          <label style={labelStyle}>Цель</label>
          <select name="goal" value={formData.goal} onChange={handleChange} style={inputStyle}>
            <option value="Похудение">Похудение</option>
            <option value="Набор массы">Набор массы</option>
            <option value="Улучшение формы">Улучшение формы</option>
            {!["Похудение", "Набор массы", "Улучшение формы"].includes(formData.goal) && (
                <option value={formData.goal}>{formData.goal}</option>
            )}
          </select>

          <button type="submit" style={saveButtonStyle}>
            СОХРАНИТЬ ИЗМЕНЕНИЯ
          </button>
        </form>
      </div>
    </div>
  );
};

// --- СТИЛИ ---

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center',
  alignItems: 'center', zIndex: 1000
};

const modalContentStyle = {
  background: '#20232a', padding: '30px', borderRadius: '20px',
  width: '100%', maxWidth: '400px', // Добавил maxWidth для адаптивности
  border: '1px solid #3e4451', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
  boxSizing: 'border-box'
};

const modalHeaderStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  marginBottom: '25px', color: 'white'
};

const closeButtonStyle = {
  background: 'none', border: 'none', color: '#abb2bf',
  fontSize: '28px', cursor: 'pointer', lineHeight: '1'
};

const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };

const labelStyle = {
  color: '#abb2bf', fontSize: '11px', textAlign: 'left',
  fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px'
};

// Исправленный стиль инпута
const inputStyle = {
  width: '100%', // Теперь точно не вылезет
  padding: '12px',
  borderRadius: '10px',
  border: '1px solid #3e4451',
  background: '#1c1e22',
  color: 'white',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box' // ГЛАВНОЕ ИСПРАВЛЕНИЕ
};

// Новые стили для ряда (Вес + Рост)
const rowContainerStyle = {
  display: 'flex',
  gap: '15px',
  width: '100%'
};

const inputGroupStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0 // Чтобы flex-элементы могли сжиматься правильно
};

const saveButtonStyle = {
  padding: '14px', borderRadius: '12px', border: 'none',
  background: '#61dafb', color: '#282c34', fontWeight: 'bold',
  cursor: 'pointer', marginTop: '10px', fontSize: '16px'
};

export default EditProfileModal;