import React from 'react';
import { useTranslation } from 'react-i18next';

const LandingPage = ({ onStart }) => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(circle, rgb(44, 49, 58) 0%, rgb(28, 30, 34) 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '20px'
      }}
    >
      <h1 style={{ fontSize: '64px', fontWeight: '800', marginBottom: '80px', letterSpacing: '2px' }}>
        Ab<span style={{ color: '#61dafb' }}>AI</span>
      </h1>

      <h2 style={{ fontSize: '72px', fontWeight: '800', lineHeight: '1.1', maxWidth: '1200px', marginBottom: '30px' }}>
        {t('landing.title', 'Твой персональный путь к идеальному телу')}
      </h2>


      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => onStart(false)}
          style={{
            padding: '18px 42px',
            borderRadius: '24px',
            border: 'none',
            backgroundColor: '#61dafb',
            color: '#1c1e22',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            minWidth: '290px',
            boxShadow: '0 0 25px rgba(97, 218, 251, 0.35)'
          }}
        >
          {t('landing.register_btn', 'Регистрация')}
        </button>

        <button
          onClick={() => onStart(true)}
          style={{
            padding: '18px 42px',
            borderRadius: '24px',
            border: '2px solid #61dafb',
            backgroundColor: 'transparent',
            color: '#61dafb',
            fontSize: '18px',
            fontWeight: '500',
            cursor: 'pointer',
            minWidth: '360px'
          }}
        >
          {t('landing.login_btn', 'У меня уже есть аккаунт')}
        </button>
      </div>

    </div>
  );
};

export default LandingPage;