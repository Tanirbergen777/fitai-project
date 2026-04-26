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
    <div className="login-responsive-page">
      <div className="auth-card login-auth-card">
        <div className="login-header">
          <h2 className="login-title">
            {t('auth.login_title', 'Вход')}
          </h2>

          <p className="login-subtitle">
            {t(
              'auth.login_subtitle',
              'Войдите в аккаунт, чтобы продолжить работу с FitAI'
            )}
          </p>
        </div>

        <form onSubmit={handleLogin} className="login-form" style={formStyle}>
          <input
            className="login-input"
            name="email"
            type="email"
            value={formData?.email || ''}
            placeholder={t('auth.email_placeholder', 'Email')}
            onChange={handleChange}
            style={inputStyle}
            autoComplete="email"
            inputMode="email"
            required
          />

          <input
            className="login-input"
            name="password"
            type="password"
            value={formData?.password || ''}
            placeholder={t('auth.password_placeholder', 'Пароль')}
            onChange={handleChange}
            style={inputStyle}
            autoComplete="current-password"
            required
          />

          <button type="submit" className="login-submit" style={buttonStyle}>
            {t('auth.login_submit', 'Войти')}
          </button>
        </form>

        <div className="login-links">
          <button
            type="button"
            className="login-link"
            onClick={() => setAuthMode('forgot')}
          >
            {t('auth.forgot_password', 'Забыли пароль?')}
          </button>

          <button
            type="button"
            className="login-link login-link-register"
            onClick={() => setIsLogin(false)}
          >
            {t('auth.no_account', 'Нет аккаунта? Зарегистрируйся')}
          </button>
        </div>
      </div>

      <style>{`
.login-responsive-page {
  width: 100%;
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}

/* Desktop / notebook: current UI сақталады */
.login-auth-card {
  width: 100%;
  max-width: 430px;
  box-sizing: border-box;
}

.login-header {
  text-align: center;
  margin-bottom: 20px;
}

.login-title {
  color: #61dafb;
  margin: 0 0 8px;
  font-size: 30px;
  font-weight: 900;
  line-height: 1.1;
}

.login-subtitle {
  margin: 0;
  color: rgba(255,255,255,0.68);
  font-size: 14px;
  line-height: 1.5;
}

.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-input {
  width: 100%;
  box-sizing: border-box;
}

.login-submit {
  width: 100%;
}

.login-links {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.login-link {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #61dafb;
  font-size: 14px;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 999px;
  transition: background 0.2s ease, color 0.2s ease;
}

.login-link:hover {
  background: rgba(97, 218, 251, 0.1);
  color: #8be8ff;
}

.login-link-register {
  margin-top: 2px;
}

/* Phone UI */
@media (max-width: 768px) {
  .login-responsive-page {
    min-height: 100dvh;
    align-items: flex-start;
    padding: 18px 12px 96px;
  }

  .login-auth-card {
    width: 100% !important;
    max-width: 100% !important;
    margin: 12px auto 0 !important;
    padding: 22px !important;
    border-radius: 24px !important;
    box-sizing: border-box !important;
  }

  .login-header {
    text-align: left;
    margin-bottom: 22px;
  }

  .login-title {
    font-size: clamp(30px, 9vw, 40px);
    margin-bottom: 10px;
  }

  .login-subtitle {
    font-size: 14px;
    line-height: 1.55;
    color: rgba(255,255,255,0.72);
  }

  .login-form {
    gap: 14px !important;
  }

  .login-input {
    width: 100% !important;
    min-height: 54px !important;
    border-radius: 16px !important;
    font-size: 16px !important;
    padding: 0 16px !important;
    box-sizing: border-box !important;
  }

  .login-submit {
    width: 100% !important;
    min-height: 56px !important;
    border-radius: 16px !important;
    font-size: 16px !important;
    font-weight: 900 !important;
    margin-top: 4px !important;
  }

  .login-links {
    margin-top: 18px;
    gap: 8px;
  }

  .login-link {
    width: 100%;
    min-height: 44px;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/* Small phone */
@media (max-width: 430px) {
  .login-responsive-page {
    padding-left: 8px;
    padding-right: 8px;
  }

  .login-auth-card {
    padding: 18px !important;
    border-radius: 22px !important;
  }

  .login-title {
    font-size: 32px;
  }

  .login-subtitle {
    font-size: 13px;
  }
}
      `}</style>
    </div>
  );
};

export default LoginPage;