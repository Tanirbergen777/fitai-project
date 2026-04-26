import React from 'react';
import { useTranslation } from 'react-i18next';

const LandingPage = ({ onStart }) => {
  const { t } = useTranslation();

  return (
    <div className="landing-page">
      <h1 className="landing-logo">
        Ab<span>AI</span>
      </h1>

      <h2 className="landing-title">
        {t('landing.title', 'Твой персональный путь к идеальному телу')}
      </h2>

      <div className="landing-actions">
        <button
          type="button"
          onClick={() => onStart(false)}
          className="landing-btn landing-btn-primary"
        >
          {t('landing.register_btn', 'Регистрация')}
        </button>

        <button
          type="button"
          onClick={() => onStart(true)}
          className="landing-btn landing-btn-secondary"
        >
          {t('landing.login_btn', 'У меня уже есть аккаунт')}
        </button>
      </div>

      <style>{`
.landing-page {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle, rgb(44, 49, 58) 0%, rgb(28, 30, 34) 100%);
  color: white;
  text-align: center;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

.landing-logo {
  font-size: 64px;
  font-weight: 800;
  margin: 0 0 80px;
  letter-spacing: 2px;
  line-height: 1;
}

.landing-logo span {
  color: #61dafb;
}

.landing-title {
  font-size: 72px;
  font-weight: 800;
  line-height: 1.1;
  max-width: 1200px;
  margin: 0 0 30px;
}

.landing-actions {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.landing-btn {
  padding: 18px 42px;
  border-radius: 24px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
  touch-action: manipulation;
}

.landing-btn:hover {
  transform: translateY(-2px);
}

.landing-btn:active {
  transform: scale(0.985);
}

.landing-btn-primary {
  border: none;
  background-color: #61dafb;
  color: #1c1e22;
  min-width: 290px;
  box-shadow: 0 0 25px rgba(97, 218, 251, 0.35);
}

.landing-btn-secondary {
  border: 2px solid #61dafb;
  background-color: transparent;
  color: #61dafb;
  min-width: 360px;
  font-weight: 500;
}

/* Phone UI only */
@media (max-width: 768px) {
  .landing-page {
    min-height: 100dvh;
    height: auto;
    width: 100%;
    justify-content: center;
    padding: 24px 16px 34px;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .landing-logo {
    font-size: clamp(38px, 13vw, 52px);
    margin-bottom: 34px;
    letter-spacing: 1px;
  }

  .landing-title {
    font-size: clamp(34px, 10vw, 48px);
    line-height: 1.12;
    max-width: 100%;
    margin-bottom: 30px;
  }

  .landing-actions {
    width: 100%;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .landing-btn {
    width: 100%;
    min-width: 0;
    min-height: 58px;
    padding: 16px 18px;
    border-radius: 18px;
    font-size: 16px;
  }

  .landing-btn-primary {
    min-width: 0;
  }

  .landing-btn-secondary {
    min-width: 0;
    font-weight: 700;
  }
}

/* Small phone */
@media (max-width: 430px) {
  .landing-page {
    padding: 22px 12px 30px;
  }

  .landing-logo {
    margin-bottom: 28px;
  }

  .landing-title {
    font-size: clamp(31px, 10vw, 40px);
    margin-bottom: 26px;
  }

  .landing-actions {
    gap: 12px;
  }

  .landing-btn {
    min-height: 56px;
    border-radius: 16px;
    font-size: 15px;
  }
}
      `}</style>
    </div>
  );
};

export default LandingPage;