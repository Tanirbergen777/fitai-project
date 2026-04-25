import React, { useEffect } from 'react';

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Закроется через 3 секунды
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    container: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '15px 25px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      zIndex: 2000,
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      animation: 'slideIn 0.3s ease-out',
      backgroundColor: type === 'success' ? '#2da44e' : '#e06c75', // Зеленый для успеха, красный для ошибки
      color: 'white',
      fontWeight: 'bold',
      border: '1px solid rgba(255,255,255,0.1)'
    },
    icon: { fontSize: '20px' }
  };

  return (
    <div style={styles.container}>
      <span style={styles.icon}>{type === 'success' ? '✅' : '❌'}</span>
      {message}
    </div>
  );
};

export default Notification;