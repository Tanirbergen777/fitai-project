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
    marginTop: '0',
    fontSize: '14px',
    fontWeight: 'normal'
  };

  return (
    <div className="forgot-responsive-page">
      <div className="auth-card forgot-auth-card">
        <div className="forgot-header">
          <h2 className="forgot-title">
            {t('auth.forgot_title', 'Восстановление пароля')}
          </h2>

          <p className="forgot-description">
            {t(
              'auth.forgot_description',
              'Введите email, и мы отправим код для сброса пароля.'
            )}
          </p>
        </div>

        <form
          onSubmit={handleForgotPassword}
          className="forgot-form"
          style={formStyle}
        >
          <input
            className="forgot-input"
            name="email"
            type="email"
            placeholder={t('auth.email_placeholder', 'Email')}
            onChange={handleChange}
            style={inputStyle}
            autoComplete="email"
            inputMode="email"
            required
          />

          <button
            type="submit"
            className="forgot-submit"
            style={buttonStyle}
          >
            {t('auth.send_code', 'Отправить код')}
          </button>

          <button
            type="button"
            className="forgot-secondary"
            onClick={() => setAuthMode('login')}
            style={secondaryButtonStyle}
          >
            {t('auth.back_to_login', 'Назад ко входу')}
          </button>
        </form>
      </div>

      <style>{`
.forgot-responsive-page {
  width: 100%;
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}

/* Desktop / notebook: бұрынғы auth-card стилін сақтаймыз */
.forgot-auth-card {
  width: 100%;
  max-width: 430px;
  box-sizing: border-box;
}

.forgot-header {
  text-align: center;
  margin-bottom: 20px;
}

.forgot-title {
  color: #61dafb;
  margin: 0 0 12px;
  font-size: 30px;
  font-weight: 900;
  line-height: 1.1;
}

.forgot-description {
  margin: 0;
  font-size: 14px;
  color: #abb2bf;
  line-height: 1.55;
}

.forgot-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.forgot-input {
  width: 100%;
  box-sizing: border-box;
}

.forgot-submit,
.forgot-secondary {
  width: 100%;
}

/* Phone UI + міндетті scroll */
@media (max-width: 768px) {
  .forgot-responsive-page {
    width: 100vw;
    max-width: 100vw;
    height: 100dvh;
    max-height: 100dvh;
    margin-left: calc(50% - 50vw);
    align-items: flex-start;
    justify-content: center;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    padding: 74px 12px 150px;
    background: #1c1f24;
  }

  .forgot-auth-card {
    width: 100% !important;
    max-width: 430px !important;
    margin: 0 auto !important;
    padding: 22px !important;
    border-radius: 24px !important;
    box-sizing: border-box !important;
  }

  .forgot-header {
    text-align: left;
    margin-bottom: 22px;
  }

  .forgot-title {
    font-size: clamp(28px, 8vw, 36px);
    margin-bottom: 10px;
  }

  .forgot-description {
    font-size: 14px;
    line-height: 1.55;
    color: rgba(255,255,255,0.72);
  }

  .forgot-form {
    gap: 14px !important;
  }

  .forgot-input {
    width: 100% !important;
    min-height: 54px !important;
    border-radius: 16px !important;
    font-size: 16px !important;
    padding: 0 16px !important;
    box-sizing: border-box !important;
  }

  .forgot-submit {
    width: 100% !important;
    min-height: 56px !important;
    border-radius: 16px !important;
    font-size: 16px !important;
    font-weight: 900 !important;
    margin-top: 4px !important;
  }

  .forgot-secondary {
    width: 100% !important;
    min-height: 52px !important;
    border-radius: 16px !important;
    font-size: 15px !important;
    margin-top: 0 !important;
  }
}

/* Small phone */
@media (max-width: 430px) {
  .forgot-responsive-page {
    padding-left: 8px;
    padding-right: 8px;
    padding-top: 72px;
    padding-bottom: 150px;
  }

  .forgot-auth-card {
    padding: 18px !important;
    border-radius: 22px !important;
  }

  .forgot-title {
    font-size: 30px;
  }

  .forgot-description {
    font-size: 13px;
  }
}
      `}</style>
    </div>
  );
};

export default ForgotPasswordPage;