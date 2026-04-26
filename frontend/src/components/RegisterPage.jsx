import React from 'react';
import { useTranslation } from 'react-i18next';

const RegisterPage = ({
  handleChange,
  handleRegister,
  setIsLogin,
  inputStyle,
  buttonStyle,
  formStyle
}) => {
  const { t } = useTranslation();

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const months = [
    t('auth.month_january', 'Январь'),
    t('auth.month_february', 'Февраль'),
    t('auth.month_march', 'Март'),
    t('auth.month_april', 'Апрель'),
    t('auth.month_may', 'Май'),
    t('auth.month_june', 'Июнь'),
    t('auth.month_july', 'Июль'),
    t('auth.month_august', 'Август'),
    t('auth.month_september', 'Сентябрь'),
    t('auth.month_october', 'Октябрь'),
    t('auth.month_november', 'Ноябрь'),
    t('auth.month_december', 'Декабрь')
  ];

  const years = Array.from(
    { length: 80 },
    (_, i) => new Date().getFullYear() - 14 - i
  );

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#32363e',
    color: '#ccc',
    fontSize: '14px',
    fontWeight: 'normal'
  };

  return (
    <div className="register-responsive-page">
      <div className="auth-card register-auth-card">
        <div className="register-header">
          <h2 className="register-title">
            {t('auth.register_title', 'Регистрация')}
          </h2>

          <p className="register-subtitle">
            {t(
              'auth.register_subtitle',
              'Создайте аккаунт, чтобы сохранить прогресс, питание и тренировки'
            )}
          </p>
        </div>

        <form onSubmit={handleRegister} className="register-form" style={formStyle}>
          <div className="register-name-row">
            <input
              className="register-input"
              name="username"
              placeholder={t('auth.first_name_placeholder', 'Имя')}
              onChange={handleChange}
              style={{ ...inputStyle, flex: 1, minWidth: 0 }}
              autoComplete="given-name"
              required
            />

            <input
              className="register-input"
              name="last_name"
              placeholder={t('auth.last_name_placeholder', 'Фамилия')}
              onChange={handleChange}
              style={{ ...inputStyle, flex: 1, minWidth: 0 }}
              autoComplete="family-name"
              required
            />
          </div>

          <div className="register-label">
            {t('auth.email_label', 'Email')}:
          </div>

          <input
            className="register-input"
            name="email"
            type="email"
            placeholder={t('auth.email_placeholder', 'Email')}
            onChange={handleChange}
            style={inputStyle}
            autoComplete="email"
            inputMode="email"
            required
          />

          <div className="register-label">
            {t('auth.birth_date_label', 'Дата рождения')}:
          </div>

          <div className="register-birth-row">
            <select
              name="birth_day"
              onChange={handleChange}
              className="custom-select register-select"
              required
            >
              <option value="">{t('auth.day_placeholder', 'День')}</option>
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              name="birth_month"
              onChange={handleChange}
              className="custom-select register-select register-select-month"
              required
            >
              <option value="">{t('auth.month_placeholder', 'Месяц')}</option>
              {months.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>

            <select
              name="birth_year"
              onChange={handleChange}
              className="custom-select register-select"
              required
            >
              <option value="">{t('auth.year_placeholder', 'Год')}</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="register-label">
            {t('auth.gender_label', 'Пол')}:
          </div>

          <select
            name="gender"
            onChange={handleChange}
            className="custom-select register-select register-select-full"
            required
          >
            <option value="">{t('auth.gender_select', 'Выберите пол')}</option>
            <option value="male">{t('auth.gender_male', 'Мужской')}</option>
            <option value="female">{t('auth.gender_female', 'Женский')}</option>
          </select>

          <div className="register-label">
            {t('auth.password_label', 'Пароль')}:
          </div>

          <input
            className="register-input"
            name="password"
            type="password"
            placeholder={t('auth.password_placeholder', 'Пароль')}
            onChange={handleChange}
            style={inputStyle}
            autoComplete="new-password"
            required
          />

          <div className="register-help">
            {t(
              'auth.password_requirements',
              'Минимум 8 символов, 1 цифра и 1 спецсимвол'
            )}
          </div>

          <div className="register-label">
            {t('auth.confirm_password_label', 'Подтвердите пароль')}:
          </div>

          <input
            className="register-input"
            name="confirm_password"
            type="password"
            placeholder={t('auth.confirm_password_placeholder', 'Повторите пароль')}
            onChange={handleChange}
            style={inputStyle}
            autoComplete="new-password"
            required
          />

          <button
            type="submit"
            className="register-submit"
            style={buttonStyle}
          >
            {t('auth.register_submit', 'Создать аккаунт')}
          </button>

          <button
            type="button"
            className="register-secondary"
            onClick={() => setIsLogin(true)}
            style={secondaryButtonStyle}
          >
            {t('auth.have_account', 'У меня уже есть аккаунт')}
          </button>
        </form>
      </div>

      <style>{`
.register-responsive-page {
  width: 100%;
  min-width: 0;
  height: 100dvh;
  max-height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding: 28px 0 70px;
}

.register-auth-card {
  width: 100%;
  max-width: 520px;
  box-sizing: border-box;
  margin: 0 auto;
}

.register-header {
  text-align: center;
  margin-bottom: 20px;
}

.register-title {
  color: #61dafb;
  margin: 0 0 8px;
  font-size: 30px;
  font-weight: 900;
  line-height: 1.1;
}

.register-subtitle {
  margin: 0;
  color: rgba(255,255,255,0.68);
  font-size: 14px;
  line-height: 1.5;
}

.register-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.register-name-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.register-birth-row {
  display: flex;
  gap: 8px;
  width: 100%;
}

.register-label {
  text-align: left;
  font-size: 13px;
  color: #888;
  margin-bottom: -10px;
}

.register-help {
  font-size: 12px;
  color: #888;
  margin-top: -8px;
  margin-bottom: -5px;
  text-align: left;
  line-height: 1.45;
}

.register-input {
  width: 100%;
  box-sizing: border-box;
}

.register-select {
  min-width: 0;
}

.register-birth-row .register-select:nth-child(1) {
  flex: 1;
}

.register-birth-row .register-select:nth-child(2) {
  flex: 2;
}

.register-birth-row .register-select:nth-child(3) {
  flex: 1.5;
}

.register-select-full {
  width: 100%;
}

.register-submit,
.register-secondary {
  width: 100%;
}

/* Phone UI */
@media (max-width: 768px) {
  .register-responsive-page {
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
    padding: 74px 16px 150px;
    background: #1c1f24;
  }

  .register-auth-card {
    width: 100% !important;
    max-width: 430px !important;
    margin: 0 auto !important;
    padding: 20px !important;
    border-radius: 24px !important;
    box-sizing: border-box !important;
  }

  .register-header {
    text-align: left;
    margin-bottom: 18px;
  }

  .register-title {
    font-size: clamp(28px, 8vw, 36px);
    margin-bottom: 8px;
  }

  .register-subtitle {
    font-size: 13px;
    line-height: 1.5;
    color: rgba(255,255,255,0.72);
  }

  .register-form {
    gap: 12px !important;
  }

  .register-name-row {
    flex-direction: column;
    gap: 12px;
  }

  .register-birth-row {
    display: grid;
    grid-template-columns: 0.85fr 1.35fr 0.95fr;
    gap: 8px;
  }

  .register-label {
    font-size: 12px;
    color: rgba(255,255,255,0.62);
    margin-bottom: -7px;
  }

  .register-help {
    font-size: 11px;
    color: rgba(255,255,255,0.58);
    margin-top: -5px;
    margin-bottom: -3px;
  }

  .register-input {
    width: 100% !important;
    min-height: 50px !important;
    border-radius: 15px !important;
    font-size: 16px !important;
    padding: 0 14px !important;
    box-sizing: border-box !important;
  }

  .register-select {
    width: 100% !important;
    min-width: 0 !important;
    min-height: 42px !important;
    border-radius: 14px !important;
    font-size: 14px !important;
    padding: 0 10px !important;
    box-sizing: border-box !important;
  }

  .register-select-full {
    min-height: 46px !important;
  }

  .register-submit {
    width: 100% !important;
    min-height: 54px !important;
    border-radius: 16px !important;
    font-size: 16px !important;
    font-weight: 900 !important;
    margin-top: 4px !important;
  }

  .register-secondary {
    width: 100% !important;
    min-height: 50px !important;
    border-radius: 16px !important;
    font-size: 14px !important;
    margin-top: 0 !important;
  }
}

/* Small phone */
@media (max-width: 430px) {
  .register-responsive-page {
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 72px;
    padding-bottom: 150px;
  }

  .register-auth-card {
    padding: 18px !important;
    border-radius: 22px !important;
  }

  .register-title {
    font-size: 30px;
  }

  .register-subtitle {
    font-size: 12px;
  }

  .register-birth-row {
    grid-template-columns: 0.82fr 1.35fr 0.95fr;
    gap: 6px;
  }

  .register-select {
    font-size: 13px !important;
    padding: 0 8px !important;
  }
}
      `}</style>
    </div>
  );
};

export default RegisterPage;