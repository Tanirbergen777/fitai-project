import React from 'react';
import { useTranslation } from 'react-i18next';

const ForgotPasswordPage = ({
  handleChange,
  handleForgotPassword,
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
        {t('auth.forgot_title', 'Восстановление пароля')}
      </h2>

      <p style={{ fontSize: '14px', color: '#abb2bf', marginBottom: '15px' }}>
        {t('auth.forgot_description', 'Введите email, и мы отправим код для сброса пароля.')}
      </p>

      <form onSubmit={handleForgotPassword} style={formStyle}>
        <input
          name="email"
          type="email"
          placeholder={t('auth.email_placeholder', 'Email')}
          onChange={handleChange}
          style={inputStyle}
          required
        />

        <button type="submit" style={buttonStyle}>
          {t('auth.send_code', 'Отправить код')}
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

export default ForgotPasswordPage;