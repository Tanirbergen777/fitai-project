import React from 'react';
import { useTranslation } from 'react-i18next';

const RegisterPage = ({ handleChange, handleRegister, setIsLogin, inputStyle, buttonStyle, formStyle }) => {
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
  const years = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 14 - i);

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
        {t('auth.register_title', 'Регистрация')}
      </h2>

      <form onSubmit={handleRegister} style={formStyle}>
        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <input
            name="username"
            placeholder={t('auth.first_name_placeholder', 'Имя')}
            onChange={handleChange}
            style={{ ...inputStyle, flex: 1, minWidth: 0 }}
            required
          />
          <input
            name="last_name"
            placeholder={t('auth.last_name_placeholder', 'Фамилия')}
            onChange={handleChange}
            style={{ ...inputStyle, flex: 1, minWidth: 0 }}
            required
          />
        </div>

        <div style={{ textAlign: 'left', fontSize: '13px', color: '#888', marginBottom: '-10px' }}>
          {t('auth.email_label', 'Email')}:
        </div>
        <input
          name="email"
          type="email"
          placeholder={t('auth.email_placeholder', 'Email')}
          onChange={handleChange}
          style={inputStyle}
          required
        />

        <div style={{ textAlign: 'left', fontSize: '13px', color: '#888', marginBottom: '-10px' }}>
          {t('auth.birth_date_label', 'Дата рождения')}:
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <select name="birth_day" onChange={handleChange} className="custom-select" style={{ flex: 1 }} required>
            <option value="">{t('auth.day_placeholder', 'День')}</option>
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select name="birth_month" onChange={handleChange} className="custom-select" style={{ flex: 2 }} required>
            <option value="">{t('auth.month_placeholder', 'Месяц')}</option>
            {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>

          <select name="birth_year" onChange={handleChange} className="custom-select" style={{ flex: 1.5 }} required>
            <option value="">{t('auth.year_placeholder', 'Год')}</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ textAlign: 'left', fontSize: '13px', color: '#888', marginBottom: '-10px' }}>
          {t('auth.gender_label', 'Пол')}:
        </div>
        <select name="gender" onChange={handleChange} className="custom-select" required>
          <option value="">{t('auth.gender_select', 'Выберите пол')}</option>
          <option value="male">{t('auth.gender_male', 'Мужской')}</option>
          <option value="female">{t('auth.gender_female', 'Женский')}</option>
        </select>

        <div style={{ textAlign: 'left', fontSize: '13px', color: '#888', marginBottom: '-10px' }}>
          {t('auth.password_label', 'Пароль')}:
        </div>
        <input
          name="password"
          type="password"
          placeholder={t('auth.password_placeholder', 'Пароль')}
          onChange={handleChange}
          style={inputStyle}
          required
        />

        <div style={{ fontSize: '12px', color: '#888', marginTop: '-8px', marginBottom: '-5px', textAlign: 'left' }}>
          {t('auth.password_requirements', 'Минимум 8 символов, 1 цифра и 1 спецсимвол')}
        </div>

        <div style={{ textAlign: 'left', fontSize: '13px', color: '#888', marginBottom: '-10px' }}>
          {t('auth.confirm_password_label', 'Подтвердите пароль')}:
        </div>
        <input
          name="confirm_password"
          type="password"
          placeholder={t('auth.confirm_password_placeholder', 'Повторите пароль')}
          onChange={handleChange}
          style={inputStyle}
          required
        />

        <button type="submit" style={buttonStyle}>
          {t('auth.register_submit', 'Создать аккаунт')}
        </button>

        <button
          type="button"
          onClick={() => setIsLogin(true)}
          style={secondaryButtonStyle}
        >
          {t('auth.have_account', 'У меня уже есть аккаунт')}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;