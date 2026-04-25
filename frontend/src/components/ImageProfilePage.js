import React, { useRef, useState } from 'react';

const ImageProfilePage = ({ user, onImageUpload }) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar_url || null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 1. Создаем локальное превью для мгновенного эффекта
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // 2. Отправляем файл родителю или на сервер
    if (onImageUpload) {
      onImageUpload(file);
    }
  };

  return (
    <div style={duoAvatarStyle}>
      {previewUrl ? (
        <img src={previewUrl} alt="Profile" style={imageStyle} />
      ) : (
        <div style={initialsStyle}>
          {user.username ? user.username.substring(0, 2).toUpperCase() : 'TA'}
        </div>
      )}

      {/* Скрытый инпут для выбора файла */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <button style={editAvatarButtonStyle} onClick={handleButtonClick}>
        ✎
      </button>
    </div>
  );
};

// --- Стили ---
const duoAvatarStyle = {
  width: '160px',
  height: '160px',
  borderRadius: '50%',
  background: '#282c34',
  border: '4px solid #3e4451',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'visible', // Чтобы кнопка выходила за пределы
  boxShadow: '0 0 20px rgba(97, 218, 251, 0.1)'
};

const imageStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  objectFit: 'cover'
};

const initialsStyle = {
  fontSize: '54px',
  color: '#61dafb',
  fontWeight: 'bold',
  letterSpacing: '2px'
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
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
  zIndex: 10
};

export default ImageProfilePage;