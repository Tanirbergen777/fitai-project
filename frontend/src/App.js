import React, { useState, useEffect } from 'react';
import './App.css';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import OnboardingPage from './components/OnboardingPage';
import VerifyPage from './components/VerifyPage';
import LandingPage from './components/LandingPage';
import { useTranslation } from 'react-i18next'; // Импорт хука
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import { API_BASE_URL } from './config/api';

function App() {
  // Хук перевода должен быть здесь, на верхнем уровне
  const { t, i18n } = useTranslation();
const changeLanguage = (lng) => {
  i18n.changeLanguage(lng);
};
  const [userId, setUserId] = useState(() => localStorage.getItem('userId'));
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('userData');
    return saved ? JSON.parse(saved) : null;
  });



  const [showLanding, setShowLanding] = useState(true);
  const [authMode, setAuthMode] = useState('login');
  const [status, setStatus] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [formData, setFormData] = useState({
  username: '',
  last_name: '',
  email: '',
  password: '',
  confirm_password: '',
  gender: '',
  birth_day: '',
  birth_month: '',
  birth_year: ''
});
  const [resetData, setResetData] = useState({
  code: '',
  new_password: '',
  confirm_password: ''
});
  const [profileData, setProfileData] = useState({ age: '', weight: '', height: '', activity_level: '1', goal: 'Похудение' });

     const handleStart = (goToLogin) => {
      setAuthMode(goToLogin ? 'login' : 'register');
      setShowLanding(false);
    };
    const handleProfileUpdate = (updatedFields) => {
  setUserData(prev => {
    const newData = { ...prev, ...updatedFields };
    // Важно: обновляем и localStorage, чтобы после перезагрузки данные не "откатились"
    localStorage.setItem('userData', JSON.stringify(newData));
    return newData;
  });
};
  useEffect(() => {
    if (userId) {
      fetch(`${API_BASE_URL}/user-stats/${userId}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error("Сессия устарела");
        })
        .then(data => {
          setAiResult({ bmi: data.bmi || 24.0 });
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, [userId]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleResetChange = (e) => {
  setResetData({ ...resetData, [e.target.name]: e.target.value });
};
  const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
const switchAuthMode = (goToLogin) => {
  setAuthMode(goToLogin ? 'login' : 'register');
}
  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
    setUserId(null);
    setUserData(null);
    setAiResult(null);
    window.location.reload();
  };

const validatePassword = (password) => {
  if (password.length < 8) {
    return t('auth.password_error_short', 'Пароль должен быть не короче 8 символов');
  }

  if (!/[A-Za-zА-Яа-я]/.test(password)) {
    return t('auth.password_error_letter', 'Пароль должен содержать хотя бы одну букву');
  }

  if (!/\d/.test(password)) {
    return t('auth.password_error_digit', 'Пароль должен содержать хотя бы одну цифру');
  }

  if (!/[@$!%*#?&_\-]/.test(password)) {
    return t('auth.password_error_special', 'Пароль должен содержать хотя бы один спецсимвол');
  }

  return '';
};
  const handleLogin = async (e) => {
    e.preventDefault();
   setStatus(t('auth.status_signing_in', 'Вход...'));
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('userId', data.user_id);
        const userInfo = {
          username: data.username,
          rating: data.rating,
          streak_count: data.streak_count,
          birth_date: data.birth_date,
          gender: data.gender
        };
        localStorage.setItem('userData', JSON.stringify(userInfo));
        setUserId(data.user_id);
        setUserData(userInfo);
        if (data.has_profile) setAiResult({ bmi: data.bmi });
     setStatus(`✅ ${t('auth.welcome_back', 'С возвращением')}, ${data.username}!`);
      } else {
        setStatus(`❌ ${data.detail}`);
      }
    } catch (err) {  setStatus(`❌ ${t('auth.server_error', 'Ошибка связи с сервером')}`); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!formData.birth_day || !formData.birth_month || !formData.birth_year) {
      alert(t('auth.birth_date_required', 'Пожалуйста, выберите полную дату рождения'));
      return;
    }
    const passwordError = validatePassword(formData.password);
if (passwordError) {
  setStatus(`❌ ${passwordError}`);
  return;
}

if (formData.password !== formData.confirm_password) {
 setStatus(`❌ ${t('auth.password_mismatch', 'Пароли не совпадают')}`);
  return;
}
    const formattedDate = `${formData.birth_year}-${String(formData.birth_month).padStart(2, '0')}-${String(formData.birth_day).padStart(2, '0')}`;
    const dataToSend = {
      username: formData.username,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
      gender: formData.gender,
      birth_date: formattedDate
    };

    try {
      const response = await fetch(`${API_BASE_URL}/register`,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || t('auth.register_error', 'Ошибка регистрации'));
      setIsVerifying(true);alert(t('auth.code_sent_email', 'Код отправлен на почту!'));
    } catch (error) {
 setStatus(`❌ ${t('auth.error_prefix', 'Ошибка')}: ${error.message}`);
    }
  };

const handleForgotPassword = async (e) => {
  e.preventDefault();
  setStatus(t('auth.status_sending_code', 'Отправка кода...'));

  try {
    const res = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.email }),
    });

    const data = await res.json();

if (res.ok) {
  setStatus(`✅ ${data.message || t('auth.code_sent_email', 'Код отправлен на почту')}`);
  setAuthMode('reset');
} else {
      setStatus(`❌ ${data.detail || t('auth.send_code_error', 'Ошибка отправки кода')}`);
    }
  } catch (err) {
   setStatus(`❌ ${t('auth.server_error', 'Ошибка связи с сервером')}`);
  }
};
const handleResetPassword = async (e) => {
  e.preventDefault();

  if (resetData.new_password !== resetData.confirm_password) {
   setStatus(`❌ ${t('auth.password_mismatch', 'Пароли не совпадают')}`);
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        code: resetData.code,
        new_password: resetData.new_password
      }),
    });

    const data = await res.json();

    if (res.ok) {
     setStatus(`✅ ${data.message || t('auth.password_reset_success', 'Пароль успешно изменен')}`);
      setResetData({ code: '', new_password: '', confirm_password: '' });
      setAuthMode('login');
    } else {
      setStatus(`❌ ${data.detail || t('auth.reset_error', 'Ошибка сброса пароля')}`);
    }
  } catch (err) {
   setStatus(`❌ ${t('auth.server_error', 'Ошибка связи с сервером')}`);
  }
};

  const handleVerify = async (e) => {
    e.preventDefault();
    setStatus(t('auth.status_verifying', 'Проверка кода...'));
    try {
      const res = await fetch(`${API_BASE_URL}/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: otpCode }),
      });
      if (res.ok) {
       setStatus(`✅ ${t('auth.email_verified', 'Почта подтверждена! Войдите в аккаунт.')}`);
        setIsVerifying(false);
        setAuthMode('login');
      } else {
        const data = await res.json();
        setStatus(`❌ ${data.detail}`);
      }
    } catch (err) { setStatus(`❌ ${t('auth.verify_error', 'Ошибка верификации')}`); }
  };

const handleOnboarding = async (e) => {
  e.preventDefault();
  setStatus(t('onboarding.status_analyzing', 'AI анализирует параметры...'));

  const cleanData = {
    weight: parseFloat(profileData.weight),
    height: parseFloat(profileData.height),
    activity_level: parseInt(profileData.activity_level),
    goal: profileData.goal
  };

  console.log("SUPABASE URL:", process.env.REACT_APP_SUPABASE_URL);
  console.log("SUPABASE KEY exists:", !!process.env.REACT_APP_SUPABASE_ANON_KEY);

  try {
    const res = await fetch(`${API_BASE_URL}/onboarding/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanData),
    });

    const data = await res.json();

    if (res.ok) {
      setAiResult({
        bmi: data.bmi,
        ai_recommendation: data.ai_recommendation,
        status: data.status
      });
      setStatus(`✅ ${t('onboarding.profile_created', 'Профиль создан!')}`);
    } else {
      setStatus(`❌ ${data.detail}`);
    }
  } catch (err) {
    setStatus(`❌ ${t('auth.server_error', 'Ошибка связи с сервером')}`);
  }
};

 return (
    <div className="App">
      {/* Переключатель языков */}


      {userId && aiResult?.bmi ? (
      <HomePage
        aiResult={aiResult}
        userId={userId}
        user={userData}
        handleLogout={handleLogout}
        onProfileUpdate={handleProfileUpdate} // ПЕРЕДАЕМ ФУНКЦИЮ ТУТ
      />
      ) : (
showLanding && !userId ? (
  <div style={{ position: 'relative' }}>
    <div style={authLangContainerStyle}>
      <button onClick={() => changeLanguage('ru')} style={authLangButtonStyle(i18n.language === 'ru')}>
        RU
      </button>
      <button onClick={() => changeLanguage('en')} style={authLangButtonStyle(i18n.language === 'en')}>
        EN
      </button>
      <button onClick={() => changeLanguage('kaz')} style={authLangButtonStyle(i18n.language === 'kaz')}>
        KZ
      </button>
    </div>

    <LandingPage onStart={handleStart} />
  </div>
) : (

  <div className="auth-wrapper"> {/* Это обеспечит центрирование по всему экрану */}
      <div style={authLangContainerStyle}>
    <button onClick={() => changeLanguage('ru')} style={authLangButtonStyle(i18n.language === 'ru')}>RU</button>
    <button onClick={() => changeLanguage('en')} style={authLangButtonStyle(i18n.language === 'en')}>EN</button>
    <button onClick={() => changeLanguage('kaz')} style={authLangButtonStyle(i18n.language === 'kaz')}>KZ</button>
  </div>
    <div className="auth-container">
      {!userId && (
        <div
          onClick={() => setShowLanding(true)}
          className="back-link"
        >
          ← {t('auth.back_to_main', 'На главную')}
        </div>
      )}

{!userId ? (
  isVerifying ? (
    <VerifyPage
      email={formData.email}
      otpCode={otpCode}
      setOtpCode={setOtpCode}
      handleVerify={handleVerify}
      inputStyle={inputStyle}
      buttonStyle={buttonStyle}
      formStyle={formStyle}
    />
  ) : authMode === 'login' ? (
    <LoginPage
      handleChange={handleChange}
      handleLogin={handleLogin}
      setIsLogin={switchAuthMode}
      setAuthMode={setAuthMode}
      inputStyle={inputStyle}
      buttonStyle={buttonStyle}
      formStyle={formStyle}
    />
  ) : authMode === 'register' ? (
    <RegisterPage
      handleChange={handleChange}
      handleRegister={handleRegister}
      setIsLogin={switchAuthMode}
      inputStyle={inputStyle}
      buttonStyle={buttonStyle}
      formStyle={formStyle}
    />
  ) : authMode === 'forgot' ? (
    <ForgotPasswordPage
      handleChange={handleChange}
      handleForgotPassword={handleForgotPassword}
      setAuthMode={setAuthMode}
      inputStyle={inputStyle}
      buttonStyle={buttonStyle}
      formStyle={formStyle}
    />
  ) : (
    <ResetPasswordPage
      email={formData.email}
      resetData={resetData}
      handleResetChange={handleResetChange}
      handleResetPassword={handleResetPassword}
      setAuthMode={setAuthMode}
      inputStyle={inputStyle}
      buttonStyle={buttonStyle}
      formStyle={formStyle}
    />
  )
) : (
  <OnboardingPage
    handleProfileChange={handleProfileChange}
    handleOnboarding={handleOnboarding}
    inputStyle={inputStyle}
    buttonStyle={buttonStyle}
    formStyle={formStyle}
  />
)}

      {status && <p className="auth-status">{status}</p>}
    </div>
  </div>
)

      )}
    </div>
  );
}

// Новые стили для языков
// Контейнер теперь не перекрывает элементы, а аккуратно располагается

// Стили (константы)
const containerStyle = { background: '#282c34', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Arial' };
const cardStyle = { background: '#20232a', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', textAlign: 'center', width: '400px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' };
const inputStyle = { padding: '12px', borderRadius: '6px', border: 'none', fontSize: '16px' };
const buttonStyle = { padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#61dafb', color: '#282c34', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' };
const authLangContainerStyle = {
  position: 'absolute',
  top: '30px',
  right: '30px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  zIndex: 20
};

const authLangButtonStyle = (isActive) => ({
  background: isActive ? '#61dafb' : 'transparent',
  color: isActive ? '#1c1e22' : '#abb2bf',
  border: '1px solid rgba(97, 218, 251, 0.5)',
  padding: '6px 12px',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 'bold'
});
export default App;