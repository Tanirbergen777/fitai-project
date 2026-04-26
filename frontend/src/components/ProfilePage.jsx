import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import EditProfileModal from './EditProfileModal';
import Notification from './Notification';
import ImageProfilePage from './ImageProfilePage';
import { API_BASE_URL } from '../config/api';

const ProfilePage = ({ user, aiResult, onProfileUpdate }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customGoal, setCustomGoal] = useState(
    aiResult?.goal || user?.goal || 'Улучшение формы'
  );
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: ''
  });

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
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return t('profile.age_not_specified');

    const birth = new Date(birthDate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

    return `${age} ${t('profile.years_count')}`;
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
        showNotify(t('profile.photo_updated') || 'Фото обновлено! 📸', 'success');
      } else {
        showNotify(t('common.error'), 'error');
      }
    } catch (err) {
      showNotify(t('auth.status_error'), 'error');
    }
  };

  const handleSaveProfile = async (updatedData) => {
    const currentId = user?.id || user?.user_id || localStorage.getItem('userId');

    if (!currentId || currentId === 'undefined') {
      showNotify(t('common.error'), 'error');
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
        showNotify(t('common.success'), 'success');
        if (onProfileUpdate) onProfileUpdate(updatedData);
        setTimeout(() => setIsModalOpen(false), 800);
      } else {
        showNotify(extractErrorText(data?.detail || data), 'error');
      }
    } catch (err) {
      showNotify(t('auth.status_error'), 'error');
    }
  };

  const getGenderText = (gender) => {
    const g = gender?.toLowerCase();

    if (g === 'male' || g === 'm' || g === 'мужской') {
      return t('profile.gender_male');
    }

    if (g === 'female' || g === 'f' || g === 'женский') {
      return t('profile.gender_female');
    }

    return t('profile.gender_not_specified');
  };

  const handleGoalKeyDown = async (e) => {
    if (e.key === 'Enter') {
      try {
        const response = await fetch(
          `${API_BASE_URL}/onboarding/${user.id || localStorage.getItem('userId')}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              weight: aiResult?.weight || user?.weight || 70,
              height: aiResult?.height || user?.height || 170,
              activity_level: 1,
              goal: customGoal
            }),
          }
        );

        if (response.ok) showNotify(t('common.success'), 'success');
      } catch (err) {
        showNotify(t('common.error'), 'error');
      }
    }
  };

  return (
    <div className="profile-page" style={duoPageStyle}>
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotify}
        />
      )}

      <div className="profile-container" style={duoContainerStyle}>
        <div className="profile-left-col" style={leftColStyle}>
          <div className="profile-header-section" style={headerSectionStyle}>
            <div className="profile-avatar" style={duoAvatarStyle}>
              <div className="profile-avatar-inner" style={initialsStyle}>
                <ImageProfilePage user={user} onImageUpload={handleImageUpload} />
              </div>

              <button
                type="button"
                className="profile-avatar-edit"
                style={editAvatarButtonStyle}
              >
                ✎
              </button>
            </div>

            <div className="profile-main-info" style={mainInfoStyle}>
              <h1 className="profile-username" style={userNameStyle}>
                {user?.username || t('profile.user', 'Пользователь')}
              </h1>

              <div className="profile-details-row" style={detailsRowStyle}>
                <span className="profile-detail-item" style={detailItemStyle}>
                  🎂 {calculateAge(user?.birth_date)}
                </span>

                <span className="profile-detail-divider" style={detailDividerStyle}>
                  |
                </span>

                <span className="profile-detail-item" style={detailItemStyle}>
                  👤 {getGenderText(user?.gender)}
                </span>
              </div>

              <div className="profile-goal-section" style={goalSectionWrapper}>
                <label className="profile-goal-label" style={goalLabelHintStyle}>
                  {t('profile.your_current_goal')}
                </label>

                <div className="profile-goal-input-wrap" style={inputGoalWrapper}>
                  <span className="profile-goal-icon" style={goalIconStyle}>
                    🎯
                  </span>

                  <input
                    type="text"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    onKeyDown={handleGoalKeyDown}
                    style={duoInputStyle}
                    className="profile-goal-input"
                    placeholder={t('onboarding.goal')}
                  />
                </div>
              </div>

              <div className="profile-social-links" style={duoSocialLinks}>
                <span style={socialLink}>
                  <b>0</b> {t('profile.followings')}
                </span>

                <span style={socialLink}>
                  <b>0</b> {t('profile.followers')}
                </span>
              </div>

              <button
                type="button"
                className="profile-edit-btn"
                style={editProfileButtonStyle}
                onClick={() => setIsModalOpen(true)}
              >
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

          <div className="profile-separator" style={separatorStyle} />

          <h2 className="profile-section-title" style={sectionTitleStyle}>
            {t('profile.stats')}
          </h2>

          <div className="profile-stats-grid" style={statsGridStyle}>
            <div className="profile-stat-card" style={duoStatCardStyle}>
              <span style={statIconStyle}>🔥</span>

              <div>
                <div style={statValueStyle}>{user?.streak_count || 0}</div>
                <div style={statLabelStyle}>{t('profile.streak')}</div>
              </div>
            </div>

            <div className="profile-stat-card" style={duoStatCardStyle}>
              <span style={statIconStyle}>⚡</span>

              <div>
                <div style={statValueStyle}>{user?.rating || 0}</div>
                <div style={statLabelStyle}>{t('profile.rating')}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-right-col" style={rightColStyle}>
          <div className="profile-tabs-card" style={duoTabsCardStyle}>
            <div className="profile-tabs-header" style={tabsHeaderStyle}>
              <div style={activeTabStyle}>{t('profile.followings').toUpperCase()}</div>
              <div style={inactiveTabStyle}>{t('profile.followers').toUpperCase()}</div>
            </div>

            <div className="profile-tabs-content" style={tabsContentStyle}>
              <div style={emptyFriendsStyle}>👥</div>
              <p style={tabsTextStyle}>{t('profile.add_friends_desc')}</p>
            </div>
          </div>

          <div className="profile-friends-card" style={duoFriendsCardStyle}>
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

      <style>{`
/* Desktop: inline-style сақталады */

/* Tablet */
@media (max-width: 900px) {
  .profile-page {
    padding: 32px 14px 110px !important;
    min-height: auto !important;
    display: block !important;
    overflow: visible !important;
    box-sizing: border-box !important;
  }

  .profile-container {
    max-width: 720px !important;
    flex-direction: column !important;
    gap: 28px !important;
    margin: 0 auto !important;
  }

  .profile-right-col {
    margin-top: 0 !important;
  }
}

/* Phone UI */
@media (max-width: 768px) {
  .profile-page {
    width: 100% !important;
    min-height: auto !important;
    padding: 18px 8px 104px !important;
    background: #1c1e22 !important;
    overflow: visible !important;
    box-sizing: border-box !important;
  }

  .profile-container {
    width: 100% !important;
    max-width: 100% !important;
    flex-direction: column !important;
    gap: 18px !important;
  }

  .profile-left-col,
  .profile-right-col {
    width: 100% !important;
    flex: none !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 16px !important;
    margin-top: 0 !important;
  }

  .profile-header-section {
    width: 100% !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 18px !important;
    margin-bottom: 14px !important;
    padding: 20px 16px !important;
    border: 1px solid rgba(255,255,255,0.07) !important;
    border-radius: 24px !important;
    background: #21252b !important;
    box-sizing: border-box !important;
  }

  .profile-avatar {
    width: 124px !important;
    height: 124px !important;
    flex-shrink: 0 !important;
  }

  .profile-avatar-inner {
    font-size: 42px !important;
  }

  .profile-avatar-edit {
    width: 34px !important;
    height: 34px !important;
    right: 4px !important;
    bottom: 4px !important;
  }

  .profile-main-info {
    width: 100% !important;
    align-items: center !important;
    text-align: center !important;
    gap: 14px !important;
  }

  .profile-username {
    width: 100% !important;
    font-size: clamp(28px, 9vw, 38px) !important;
    line-height: 1.1 !important;
    text-align: center !important;
    word-break: break-word !important;
  }

  .profile-details-row {
    width: 100% !important;
    justify-content: center !important;
    flex-wrap: wrap !important;
    gap: 8px 12px !important;
    font-size: 14px !important;
    margin-bottom: 0 !important;
  }

  .profile-detail-item {
    font-size: 14px !important;
    gap: 6px !important;
  }

  .profile-detail-divider {
    display: none !important;
  }

  .profile-goal-section {
    width: 100% !important;
    margin-top: 0 !important;
    align-items: stretch !important;
  }

  .profile-goal-label {
    margin-left: 0 !important;
    text-align: left !important;
    font-size: 11px !important;
  }

  .profile-goal-input-wrap {
    width: 100% !important;
    max-width: 100% !important;
    padding: 12px 14px !important;
    border-radius: 16px !important;
    box-sizing: border-box !important;
  }

  .profile-goal-input {
    font-size: 16px !important;
    min-width: 0 !important;
  }

  .profile-social-links {
    width: 100% !important;
    justify-content: center !important;
    gap: 18px !important;
    margin-top: 0 !important;
  }

  .profile-edit-btn {
    width: 100% !important;
    min-height: 52px !important;
    margin-top: 4px !important;
    border-radius: 16px !important;
    font-size: 14px !important;
  }

  .profile-separator {
    margin: 18px 0 !important;
  }

  .profile-section-title {
    margin: 0 0 14px !important;
    font-size: 22px !important;
  }

  .profile-stats-grid {
    grid-template-columns: 1fr 1fr !important;
    gap: 10px !important;
  }

  .profile-stat-card {
    padding: 16px 12px !important;
    border-radius: 18px !important;
    gap: 10px !important;
    min-width: 0 !important;
  }

  .profile-tabs-card,
  .profile-friends-card {
    border-radius: 20px !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .profile-friends-card {
    padding: 18px !important;
  }

  .profile-tabs-content {
    padding: 30px 16px !important;
  }
}

/* Small phone */
@media (max-width: 430px) {
  .profile-page {
    padding-left: 4px !important;
    padding-right: 4px !important;
    padding-bottom: 100px !important;
  }

  .profile-header-section {
    padding: 18px 12px !important;
    border-radius: 22px !important;
  }

  .profile-avatar {
    width: 112px !important;
    height: 112px !important;
  }

  .profile-stats-grid {
    grid-template-columns: 1fr !important;
  }

  .profile-stat-card {
    padding: 18px !important;
  }
}
      `}</style>
    </div>
  );
};

const duoPageStyle = {
  display: 'flex',
  justifyContent: 'center',
  padding: '60px 20px',
  background: '#1c1e22',
  minHeight: '100vh'
};

const duoContainerStyle = {
  display: 'flex',
  gap: '50px',
  width: '100%',
  maxWidth: '1100px'
};

const leftColStyle = {
  flex: 2,
  display: 'flex',
  flexDirection: 'column'
};

const rightColStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '25px',
  marginTop: '20px'
};

const headerSectionStyle = {
  display: 'flex',
  gap: '40px',
  alignItems: 'flex-start',
  marginBottom: '30px'
};

const mainInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  flex: 1
};

const userNameStyle = {
  fontSize: '38px',
  margin: 0,
  fontWeight: 'bold',
  color: 'white',
  letterSpacing: '-0.5px'
};

const goalSectionWrapper = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginTop: '5px'
};

const goalLabelHintStyle = {
  fontSize: '13px',
  color: '#61dafb',
  fontWeight: 'bold',
  letterSpacing: '1.5px',
  marginLeft: '5px',
  textTransform: 'uppercase'
};

const inputGoalWrapper = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  background: 'rgba(97, 218, 251, 0.03)',
  padding: '12px 18px',
  borderRadius: '16px',
  border: '1px solid #3e4451',
  maxWidth: '320px',
  transition: 'border-color 0.3s'
};

const duoInputStyle = {
  background: 'transparent',
  border: 'none',
  color: '#61dafb',
  fontSize: '18px',
  fontWeight: '600',
  outline: 'none',
  width: '100%'
};

const editProfileButtonStyle = {
  marginTop: '15px',
  padding: '14px 28px',
  borderRadius: '14px',
  border: '1.5px solid #3e4451',
  background: 'transparent',
  color: '#61dafb',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  width: 'fit-content',
  letterSpacing: '1px',
  textTransform: 'uppercase'
};

const duoAvatarStyle = {
  width: '160px',
  height: '160px',
  borderRadius: '50%',
  background: '#282c34',
  border: '2px solid #3e4451',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative'
};

const initialsStyle = {
  fontSize: '54px',
  color: '#61dafb',
  fontWeight: 'bold'
};

const editAvatarButtonStyle = {
  position: 'absolute',
  bottom: '8px',
  right: '8px',
  background: '#61dafb',
  border: 'none',
  borderRadius: '50%',
  width: '38px',
  height: '38px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
};

const detailsRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  color: '#abb2bf',
  fontSize: '16px',
  marginBottom: '5px'
};

const duoSocialLinks = {
  display: 'flex',
  gap: '25px',
  marginTop: '5px'
};

const socialLink = {
  color: '#abb2bf',
  fontSize: '14px',
  cursor: 'pointer'
};

const separatorStyle = {
  height: '1px',
  background: 'linear-gradient(90deg, #3e4451 0%, rgba(62,68,81,0) 100%)',
  margin: '40px 0'
};

const sectionTitleStyle = {
  fontSize: '24px',
  marginBottom: '25px',
  color: 'white',
  fontWeight: 'bold'
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px'
};

const duoStatCardStyle = {
  border: '1px solid #3e4451',
  borderRadius: '20px',
  padding: '25px',
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  background: '#21252b'
};

const statIconStyle = {
  fontSize: '34px'
};

const statValueStyle = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: 'white'
};

const statLabelStyle = {
  color: '#abb2bf',
  fontSize: '15px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const duoTabsCardStyle = {
  border: '1px solid #3e4451',
  borderRadius: '20px',
  overflow: 'hidden',
  background: '#21252b'
};

const tabsHeaderStyle = {
  display: 'flex',
  borderBottom: '1px solid #3e4451'
};

const activeTabStyle = {
  flex: 1,
  padding: '15px',
  textAlign: 'center',
  color: '#61dafb',
  borderBottom: '2px solid #61dafb',
  fontWeight: 'bold',
  fontSize: '13px'
};

const inactiveTabStyle = {
  flex: 1,
  padding: '15px',
  textAlign: 'center',
  color: '#abb2bf',
  fontSize: '13px'
};

const tabsContentStyle = {
  padding: '50px 20px',
  textAlign: 'center'
};

const emptyFriendsStyle = {
  fontSize: '44px',
  marginBottom: '15px',
  opacity: 0.5
};

const tabsTextStyle = {
  fontSize: '14px',
  color: '#abb2bf',
  lineHeight: '1.5'
};

const duoFriendsCardStyle = {
  border: '1px solid #3e4451',
  borderRadius: '20px',
  padding: '25px',
  background: '#21252b'
};

const friendsTitleStyle = {
  margin: '0 0 20px 0',
  fontSize: '18px',
  color: 'white',
  fontWeight: 'bold'
};

const friendOptionStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '15px 0',
  borderBottom: '1px solid #3e4451',
  color: '#61dafb',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500'
};

const detailItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '18px',
  color: '#abb2bf'
};

const detailDividerStyle = {
  color: '#3e4451',
  padding: '0 10px',
  fontSize: '18px'
};

const goalIconStyle = {
  fontSize: '22px',
  display: 'flex',
  alignItems: 'center'
};

export default ProfilePage;