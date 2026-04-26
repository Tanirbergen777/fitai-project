import React from 'react';
import { useTranslation } from 'react-i18next';

const LoginPage = ({
  formData,
  handleChange,
  handleLogin,
  setIsLogin,
  setAuthMode,
  inputStyle,
  buttonStyle,
  formStyle
}) => {
  const { t } = useTranslation();

  return (
    <div className="auth-card">
      <h2 style={{ color: '#61dafb', marginBottom: '20px' }}>
        {t('auth.login_title', 'Вход')}
      </h2>

      <form onSubmit={handleLogin} style={formStyle}>
        <input
          name="email"
          type="email"
          placeholder={t('auth.email_placeholder', 'Email')}
          onChange={handleChange}
          style={inputStyle}
          required
        />

        <input
          name="password"
          type="password"
          placeholder={t('auth.password_placeholder', 'Пароль')}
          onChange={handleChange}
          style={inputStyle}
          required
        />

        <button type="submit" style={buttonStyle}>
          {t('auth.login_submit', 'Войти')}
        </button>
      </form>

      <p
        onClick={() => setAuthMode('forgot')}
        style={{
          cursor: 'pointer',
          color: '#61dafb',
          marginTop: '12px',
          fontSize: '14px'
        }}
      >
        {t('auth.forgot_password', 'Забыли пароль?')}
      </p>

      <p
        onClick={() => setIsLogin(false)}
        style={{
          cursor: 'pointer',
          color: '#61dafb',
          marginTop: '15px',
          fontSize: '14px'
        }}
      >
        {t('auth.no_account', 'Нет аккаунта? Зарегистрируйся')}
      </p>
    </div>
  );
};

export default LoginPage;