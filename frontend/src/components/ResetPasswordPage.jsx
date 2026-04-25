import React from 'react';
import { useTranslation } from 'react-i18next';

const ResetPasswordPage = ({
  email,
  resetData,
  handleResetChange,
  handleResetPassword,
  setAuthMode,
  inputStyle,
  buttonStyle,
  formStyle
}) => {
  const { t } = useTranslation();

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#32363e',
    color: '#ccc',
    marginTop: '-5px',
    fontSize: '14px',
    fontWeight: 'normal'
  };

  return (
    <div className="auth-card">
      <h2 style={{ color: '#61dafb', marginBottom: '20px' }}>
        {t('auth.reset_title', 'Сброс пароля')}
      </h2>

      <p style={{ fontSize: '14px', color: '#abb2bf', marginBottom: '15px' }}>
        {t('auth.reset_description', 'Мы отправили код на')} <b>{email}</b>
      </p>

      <form onSubmit={handleResetPassword} style={formStyle}>
        <input
          name="code"
          type="text"
          placeholder={t('auth.reset_code_placeholder', 'Введите 6-значный код')}
          value={resetData.code}
          onChange={handleResetChange}
          style={{ ...inputStyle, textAlign: 'center', fontSize: '18px', letterSpacing: '3px' }}
          required
        />

        <input
          name="new_password"
          type="password"
          placeholder={t('auth.new_password_placeholder', 'Новый пароль')}
          value={resetData.new_password}
          onChange={handleResetChange}
          style={inputStyle}
          required
        />

        <input
          name="confirm_password"
          type="password"
          placeholder={t('auth.confirm_password_placeholder', 'Подтвердите пароль')}
          value={resetData.confirm_password}
          onChange={handleResetChange}
          style={inputStyle}
          required
        />

        <div style={{ fontSize: '12px', color: '#888', marginTop: '-5px', marginBottom: '5px', textAlign: 'left' }}>
          {t('auth.password_requirements', 'Минимум 8 символов, 1 цифра и 1 спецсимвол')}
        </div>

        <button type="submit" style={buttonStyle}>
          {t('auth.reset_submit', 'Сохранить новый пароль')}
        </button>

        <button
          type="button"
          onClick={() => setAuthMode('login')}
          style={secondaryButtonStyle}
        >
          {t('auth.back_to_login', 'Назад ко входу')}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;