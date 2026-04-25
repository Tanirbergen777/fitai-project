import React from 'react';

const OnboardingPage = ({ handleProfileChange, handleOnboarding, inputStyle, buttonStyle, formStyle }) => (
  <div style={{ textAlign: 'center' }}>
    <h2 style={{ color: '#61dafb' }}>Почти готово!</h2>
    <p style={{ color: '#abb2bf', fontSize: '14px', marginBottom: '20px' }}>
      Заполни параметры для настройки AI-плана
    </p>

    <form onSubmit={handleOnboarding} style={formStyle}>
      <input
        name="weight"
        type="number"
        placeholder="Ваш вес (кг)"
        onChange={handleProfileChange}
        style={inputStyle}
        required
      />
      <input
        name="height"
        type="number"
        placeholder="Ваш рост (см)"
        onChange={handleProfileChange}
        style={inputStyle}
        required
      />

      <select name="activity_level" onChange={handleProfileChange} className="custom-select" style={inputStyle} required>
        <option value="">Уровень активности</option>
        <option value="1">Сидячий (минимум движений)</option>
        <option value="2">Легкий (1-2 тренировки)</option>
        <option value="3">Средний (3-5 тренировок)</option>
        <option value="4">Высокий (6-7 тренировок)</option>
      </select>

      <select name="goal" className="custom-select" onChange={handleProfileChange} style={inputStyle} required>
        <option value="">Ваша цель</option>
        <option value="Похудение">Похудение</option>
        <option value="Поддержание">Поддержание формы</option>
        <option value="Набор массы">Набор массы</option>
      </select>

      <button type="submit" style={buttonStyle}>Сгенерировать план</button>
    </form>
  </div>
);

export default OnboardingPage;