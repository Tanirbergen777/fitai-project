import React from 'react';
import { useTranslation } from 'react-i18next';

const VerifyPage = ({ email, otpCode, setOtpCode, handleVerify, inputStyle, buttonStyle, formStyle }) => {
  const { t } = useTranslation();

  return (
    <div>
      <h2 style={{ color: '#61dafb' }}>
        {t('auth.verify_title', 'Подтверждение')}
      </h2>

      <p style={{ fontSize: '14px', color: '#abb2bf' }}>
        {t('auth.verify_description', 'Мы отправили код на')} <b>{email}</b>
      </p>

      <form onSubmit={handleVerify} style={formStyle}>
        <input
          placeholder={t('auth.verify_code_placeholder', 'Введите 6-значный код')}
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
          style={{ ...inputStyle, textAlign: 'center', fontSize: '20px', letterSpacing: '4px' }}
          required
        />
        <button type="submit" style={buttonStyle}>
          {t('auth.verify_submit', 'Подтвердить почту')}
        </button>
      </form>

      <p style={{ marginTop: '15px', color: '#888', fontSize: '12px' }}>
        {t('auth.spam_hint', 'Не пришло письмо? Проверьте папку Спам.')}
      </p>
    </div>
  );
};

export default VerifyPage;