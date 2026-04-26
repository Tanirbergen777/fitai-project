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
    <div className="login-page">
      <div className="login-bg login-bg--one" />
      <div className="login-bg login-bg--two" />

      <div className="auth-card login-card">
        <div className="login-header">
          <div className="login-logo">🔥</div>

          <div className="login-title-block">
            <span className="login-badge">FitAI</span>

            <h2 className="login-title">
              {t('auth.login_title', 'Вход')}
            </h2>

            <p className="login-subtitle">
              {t(
                'auth.login_subtitle',
                'Войдите в аккаунт, чтобы продолжить тренировки, питание и работу с AI.'
              )}
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="login-form" style={formStyle}>
          <label className="login-field">
            <span>{t('auth.email_label', 'Email')}</span>

            <input
              className="login-input"
              name="email"
              type="email"
              placeholder={t('auth.email_placeholder', 'Email')}
              onChange={handleChange}
              style={inputStyle}
              autoComplete="email"
              inputMode="email"
              required
            />
          </label>

          <label className="login-field">
            <span>{t('auth.password_label', 'Пароль')}</span>

            <input
              className="login-input"
              name="password"
              type="password"
              placeholder={t('auth.password_placeholder', 'Пароль')}
              onChange={handleChange}
              style={inputStyle}
              autoComplete="current-password"
              required
            />
          </label>

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

          <div className="login-divider" />

          <button
            type="button"
            className="login-link login-link--strong"
            onClick={() => setIsLogin(false)}
          >
            {t('auth.no_account', 'Нет аккаунта? Зарегистрируйся')}
          </button>
        </div>
      </div>

      <style>{`
.login-page {
  width: 100%;
  min-height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 34px 24px;
  overflow: hidden;
  color: #ffffff;
}

.login-bg {
  position: absolute;
  border-radius: 999px;
  filter: blur(42px);
  opacity: 0.5;
  pointer-events: none;
}

.login-bg--one {
  width: 280px;
  height: 280px;
  top: -90px;
  right: -70px;
  background: rgba(97, 218, 251, 0.20);
}

.login-bg--two {
  width: 260px;
  height: 260px;
  bottom: -100px;
  left: -70px;
  background: rgba(198, 120, 221, 0.16);
}

.login-card {
  position: relative;
  z-index: 1;
  width: min(460px, 100%) !important;
  max-width: 460px !important;
  margin: 0 auto !important;
  padding: 32px !important;
  border-radius: 30px !important;
  background:
    radial-gradient(circle at top right, rgba(97, 218, 251, 0.12), transparent 34%),
    linear-gradient(180deg, rgba(35, 40, 51, 0.96) 0%, rgba(27, 32, 41, 0.96) 100%) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  box-shadow: 0 28px 80px rgba(0,0,0,0.42) !important;
  box-sizing: border-box !important;
  backdrop-filter: blur(16px);
  text-align: left !important;
}

.login-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.login-logo {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: rgba(97, 218, 251, 0.12);
  border: 1px solid rgba(97, 218, 251, 0.20);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
  box-shadow: 0 14px 34px rgba(97, 218, 251, 0.12);
}

.login-title-block {
  min-width: 0;
}

.login-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(97, 218, 251, 0.10);
  border: 1px solid rgba(97, 218, 251, 0.22);
  color: #7ce3ff;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
}

.login-title {
  margin: 0 !important;
  color: #ffffff !important;
  font-size: clamp(30px, 4vw, 40px) !important;
  line-height: 1.05 !important;
  font-weight: 950 !important;
  letter-spacing: -0.03em;
}

.login-subtitle {
  margin: 10px 0 0 !important;
  color: #aab3c2 !important;
  line-height: 1.55 !important;
  font-size: 14px !important;
}

.login-form {
  width: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 14px !important;
  margin: 0 !important;
}

.login-field {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.login-field span {
  color: #c8d1df;
  font-size: 13px;
  font-weight: 800;
}

.login-input {
  width: 100% !important;
  min-height: 54px !important;
  box-sizing: border-box !important;
  border-radius: 16px !important;
  border: 1px solid rgba(255,255,255,0.10) !important;
  background: rgba(255,255,255,0.06) !important;
  color: #ffffff !important;
  padding: 0 16px !important;
  font-size: 15px !important;
  outline: none !important;
  transition: border-color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease !important;
}

.login-input::placeholder {
  color: rgba(210, 220, 235, 0.48);
}

.login-input:focus {
  border-color: rgba(97, 218, 251, 0.62) !important;
  background: rgba(255,255,255,0.08) !important;
  box-shadow: 0 0 0 4px rgba(97, 218, 251, 0.10) !important;
}

.login-submit {
  width: 100% !important;
  min-height: 56px !important;
  border: none !important;
  border-radius: 18px !important;
  margin-top: 6px !important;
  background: linear-gradient(135deg, #63e0ff 0%, #4e8fff 100%) !important;
  color: #0f1720 !important;
  font-size: 16px !important;
  font-weight: 950 !important;
  cursor: pointer !important;
  box-shadow: 0 16px 34px rgba(97,218,251,0.24) !important;
  transition: transform 0.22s ease, box-shadow 0.22s ease !important;
  touch-action: manipulation;
}

.login-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 42px rgba(97,218,251,0.32) !important;
}

.login-submit:active {
  transform: scale(0.985);
}

.login-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
  align-items: center;
}

.login-link {
  border: none;
  background: transparent;
  color: #61dafb;
  cursor: pointer;
  font-size: 14px;
  font-weight: 750;
  padding: 8px 10px;
  border-radius: 999px;
  transition: background 0.22s ease, color 0.22s ease;
  touch-action: manipulation;
  text-align: center;
}

.login-link:hover {
  background: rgba(97, 218, 251, 0.10);
  color: #8be8ff;
}

.login-link--strong {
  color: #d8a8ea;
}

.login-link--strong:hover {
  background: rgba(198, 120, 221, 0.10);
  color: #efc4ff;
}

.login-divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0),
    rgba(255,255,255,0.12),
    rgba(255,255,255,0)
  );
}

/* Notebook */
@media (max-width: 1200px) {
  .login-page {
    padding: 28px 20px;
  }

  .login-card {
    max-width: 440px !important;
    padding: 30px !important;
  }
}

/* Phone */
@media (max-width: 768px) {
  .login-page {
    min-height: 100dvh;
    padding: 18px 12px 96px;
    align-items: flex-start;
  }

  .login-card {
    width: 100% !important;
    max-width: 100% !important;
    margin-top: 18px !important;
    padding: 22px !important;
    border-radius: 24px !important;
  }

  .login-header {
    gap: 14px;
    margin-bottom: 22px;
  }

  .login-logo {
    width: 50px;
    height: 50px;
    border-radius: 16px;
    font-size: 25px;
  }

  .login-title {
    font-size: clamp(30px, 9vw, 38px) !important;
  }

  .login-subtitle {
    font-size: 13px !important;
  }

  .login-input {
    min-height: 54px !important;
    font-size: 16px !important;
    border-radius: 16px !important;
  }

  .login-submit {
    min-height: 56px !important;
    font-size: 15px !important;
  }

  .login-links {
    margin-top: 18px;
  }

  .login-link {
    width: 100%;
    min-height: 42px;
  }
}

/* Small phone */
@media (max-width: 430px) {
  .login-page {
    padding-left: 8px;
    padding-right: 8px;
  }

  .login-card {
    padding: 18px !important;
    border-radius: 22px !important;
  }

  .login-header {
    flex-direction: column;
  }

  .login-logo {
    width: 48px;
    height: 48px;
  }
}
      `}</style>
    </div>
  );
};

export default LoginPage;