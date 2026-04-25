import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // Добавили импорт
import EditProfileModal from './EditProfileModal';
import Notification from './Notification';
import ImageProfilePage from './ImageProfilePage';
import { API_BASE_URL } from '../config/api';

const ProfilePage = ({ user, aiResult, onProfileUpdate }) => {
  const { t } = useTranslation(); // Инициализация хука
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customGoal, setCustomGoal] = useState(aiResult?.goal || user?.goal || 'Улучшение формы');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotify = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };
  const extractErrorText = (detail) => {
  if (!detail) return t('common.error');

  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item?.loc && item?.msg) return `${item.loc.join('.')} — ${item.msg}`;
        if (item?.msg) return item.msg;
        return JSON.stringify(item);
      })
      .join(' | ');
  }

  if (typeof detail === 'object') {
    if (detail.msg) return detail.msg;
    return JSON.stringify(detail);
  }

  return t('common.error');
};

  const closeNotify = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return t('profile.age_not_specified'); // Изменили текст
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return `${age} ${t('profile.years_count')}`; // Изменили "лет" на ключ
  };

  const handleImageUpload = async (file) => {
    const currentId = user?.id || localStorage.getItem('userId');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload-avatar/${currentId}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        showNotify(t('profile.photo_updated') || "Фото обновлено! 📸", "success");
      } else {
        showNotify(t('common.error'), "error");
      }
    } catch (err) {
      showNotify(t('auth.status_error'), "error");
    }
  };

const handleSaveProfile = async (updatedData) => {
  const currentId = user?.id || user?.user_id || localStorage.getItem('userId');
  if (!currentId || currentId === 'undefined') {
    showNotify(t('common.error'), "error");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/update-profile/${currentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });

    const data = await response.json();

    if (response.ok) {
      showNotify(t('common.success'), "success");
      if (onProfileUpdate) onProfileUpdate(updatedData);
      setTimeout(() => setIsModalOpen(false), 800);
    } else {
      showNotify(extractErrorText(data?.detail || data), "error");
    }
  } catch (err) {
    showNotify(t('auth.status_error'), "error");
  }
};

  const getGenderText = (gender) => {
    const g = gender?.toLowerCase();
    if (g === 'male' || g === 'm' || g === 'мужской') return t('profile.gender_male');
    if (g === 'female' || g === 'f' || g === 'женский') return t('profile.gender_female');
    return t('profile.gender_not_specified');
  };

  const handleGoalKeyDown = async (e) => {
    if (e.key === 'Enter') {
      try {
        const response = await fetch(`${API_BASE_URL}/onboarding/${user.id || localStorage.getItem('userId')}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weight: aiResult?.weight || user?.weight || 70,
            height: aiResult?.height || user?.height || 170,
            activity_level: 1,
            goal: customGoal
          }),
        });
        if (response.ok) showNotify(t('common.success'), "success");
      } catch (err) {
        showNotify(t('common.error'), "error");
      }
    }
  };

  return (
    <div style={duoPageStyle}>
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotify}
        />
      )}

      <div style={duoContainerStyle}>
        <div style={leftColStyle}>
          <div style={headerSectionStyle}>
            <div style={duoAvatarStyle}>
              <div style={initialsStyle}>
                <ImageProfilePage user={user} onImageUpload={handleImageUpload} />
              </div>
              <button style={editAvatarButtonStyle}>✎</button>
            </div>

            <div style={mainInfoStyle}>
              <h1 style={userNameStyle}>{user.username}</h1>

              <div style={detailsRowStyle}>
                <span style={detailItemStyle}>🎂 {calculateAge(user.birth_date)}</span>
                <span style={detailDividerStyle}>|</span>
                <span style={detailItemStyle}>👤 {getGenderText(user.gender)}</span>
              </div>

              <div style={goalSectionWrapper}>
                <label style={goalLabelHintStyle}>{t('profile.your_current_goal')}</label>
                <div style={inputGoalWrapper}>
                   <span style={goalIconStyle}>🎯</span>
                   <input
                      type="text"
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      onKeyDown={handleGoalKeyDown}
                      style={duoInputStyle}
                      placeholder={t('onboarding.goal')}
                    />
                </div>
              </div>

              <div style={duoSocialLinks}>
                <span style={socialLink}><b>0</b> {t('profile.followings')}</span>
                <span style={socialLink}><b>0</b> {t('profile.followers')}</span>
              </div>

              <button style={editProfileButtonStyle} onClick={() => setIsModalOpen(true)}>
                {t('profile.edit_profile')}
              </button>

              {isModalOpen && (
                <EditProfileModal
                  user={user}
                  aiResult={aiResult}
                  onClose={() => setIsModalOpen(false)}
                  onSave={handleSaveProfile}
                />
              )}
            </div>
          </div>

          <div style={separatorStyle} />

          <h2 style={sectionTitleStyle}>{t('profile.stats')}</h2>
          <div style={statsGridStyle}>
            <div style={duoStatCardStyle}>
              <span style={statIconStyle}>🔥</span>
              <div>
                <div style={statValueStyle}>{user.streak_count || 0}</div>
                <div style={statLabelStyle}>{t('profile.streak')}</div>
              </div>
            </div>
            <div style={duoStatCardStyle}>
              <span style={statIconStyle}>⚡</span>
              <div>
                <div style={statValueStyle}>{user.rating || 0}</div>
                <div style={statLabelStyle}>{t('profile.rating')}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={rightColStyle}>
          <div style={duoTabsCardStyle}>
            <div style={tabsHeaderStyle}>
              <div style={activeTabStyle}>{t('profile.followings').toUpperCase()}</div>
              <div style={inactiveTabStyle}>{t('profile.followers').toUpperCase()}</div>
            </div>
            <div style={tabsContentStyle}>
              <div style={emptyFriendsStyle}>👥</div>
              <p style={tabsTextStyle}>{t('profile.add_friends_desc')}</p>
            </div>
          </div>

          <div style={duoFriendsCardStyle}>
            <h3 style={friendsTitleStyle}>{t('profile.add_friends_title')}</h3>
            <div style={friendOptionStyle}>
               <span>🔍 {t('profile.find_friends')}</span>
               <span>❯</span>
            </div>
            <div style={friendOptionStyle}>
               <span>✉️ {t('profile.invite_friends')}</span>
               <span>❯</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Стили остаются такими же...
const duoPageStyle = { display: 'flex', justifyContent: 'center', padding: '60px 20px', background: '#1c1e22', minHeight: '100vh' };
const duoContainerStyle = { display: 'flex', gap: '50px', width: '100%', maxWidth: '1100px' };
const leftColStyle = { flex: 2, display: 'flex', flexDirection: 'column' };
const rightColStyle = { flex: 1, display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '20px' };
const headerSectionStyle = { display: 'flex', gap: '40px', alignItems: 'flex-start', marginBottom: '30px' };
const mainInfoStyle = { display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 };
const userNameStyle = { fontSize: '38px', margin: 0, fontWeight: 'bold', color: 'white', letterSpacing: '-0.5px' };
const goalSectionWrapper = { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '5px' };
const goalLabelHintStyle = { fontSize: '13px', color: '#61dafb', fontWeight: 'bold', letterSpacing: '1.5px', marginLeft: '5px', textTransform: 'uppercase' };
const inputGoalWrapper = { display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(97, 218, 251, 0.03)', padding: '12px 18px', borderRadius: '16px', border: '1px solid #3e4451', maxWidth: '320px', transition: 'border-color 0.3s' };
const duoInputStyle = { background: 'transparent', border: 'none', color: '#61dafb', fontSize: '18px', fontWeight: '600', outline: 'none', width: '100%' };
const editProfileButtonStyle = { marginTop: '15px', padding: '14px 28px', borderRadius: '14px', border: '1.5px solid #3e4451', background: 'transparent', color: '#61dafb', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', width: 'fit-content', letterSpacing: '1px', textTransform: 'uppercase' };
const duoAvatarStyle = { width: '160px', height: '160px', borderRadius: '50%', background: '#282c34', border: '2px solid #3e4451', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' };
const initialsStyle = { fontSize: '54px', color: '#61dafb', fontWeight: 'bold' };
const editAvatarButtonStyle = { position: 'absolute', bottom: '8px', right: '8px', background: '#61dafb', border: 'none', borderRadius: '50%', width: '38px', height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' };
const detailsRowStyle = { display: 'flex', alignItems: 'center', gap: '20px', color: '#abb2bf', fontSize: '16px', marginBottom: '5px' };
const duoSocialLinks = { display: 'flex', gap: '25px', marginTop: '5px' };
const socialLink = { color: '#abb2bf', fontSize: '14px', cursor: 'pointer' };
const separatorStyle = { height: '1px', background: 'linear-gradient(90deg, #3e4451 0%, rgba(62,68,81,0) 100%)', margin: '40px 0' };
const sectionTitleStyle = { fontSize: '24px', marginBottom: '25px', color: 'white', fontWeight: 'bold' };
const statsGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const duoStatCardStyle = { border: '1px solid #3e4451', borderRadius: '20px', padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', background: '#21252b' };
const statIconStyle = { fontSize: '34px' };
const statValueStyle = { fontSize: '32px', fontWeight: 'bold', color: 'white' };
const statLabelStyle = { color: '#abb2bf', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' };
const duoTabsCardStyle = { border: '1px solid #3e4451', borderRadius: '20px', overflow: 'hidden', background: '#21252b' };
const tabsHeaderStyle = { display: 'flex', borderBottom: '1px solid #3e4451' };
const activeTabStyle = { flex: 1, padding: '15px', textAlign: 'center', color: '#61dafb', borderBottom: '2px solid #61dafb', fontWeight: 'bold', fontSize: '13px' };
const inactiveTabStyle = { flex: 1, padding: '15px', textAlign: 'center', color: '#abb2bf', fontSize: '13px' };
const tabsContentStyle = { padding: '50px 20px', textAlign: 'center' };
const emptyFriendsStyle = { fontSize: '44px', marginBottom: '15px', opacity: 0.5 };
const tabsTextStyle = { fontSize: '14px', color: '#abb2bf', lineHeight: '1.5' };
const duoFriendsCardStyle = { border: '1px solid #3e4451', borderRadius: '20px', padding: '25px', background: '#21252b' };
const friendsTitleStyle = { margin: '0 0 20px 0', fontSize: '18px', color: 'white', fontWeight: 'bold' };
const friendOptionStyle = { display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #3e4451', color: '#61dafb', cursor: 'pointer', fontSize: '14px', fontWeight: '500' };
const detailItemStyle = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', color: '#abb2bf' };
const detailDividerStyle = { color: '#3e4451', padding: '0 10px', fontSize: '18px' };
const goalIconStyle = { fontSize: '22px', display: 'flex', alignItems: 'center' };

export default ProfilePage;