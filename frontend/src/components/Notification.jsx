import React, { useEffect } from 'react';

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <>
      <div
        className={`notification-toast ${isSuccess ? 'notification-toast--success' : 'notification-toast--error'}`}
        role="alert"
        onClick={onClose}
      >
        <span className="notification-icon">
          {isSuccess ? '✅' : '❌'}
        </span>

        <span className="notification-message">
          {message}
        </span>
      </div>

      <style>{`
.notification-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 420px;
  padding: 15px 25px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 3000;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  animation: notification-slide-in 0.3s ease-out;
  color: white;
  font-weight: bold;
  border: 1px solid rgba(255,255,255,0.1);
  box-sizing: border-box;
  cursor: pointer;
}

.notification-toast--success {
  background-color: #2da44e;
}

.notification-toast--error {
  background-color: #e06c75;
}

.notification-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.notification-message {
  min-width: 0;
  font-size: 14px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

@keyframes notification-slide-in {
  from {
    opacity: 0;
    transform: translateX(24px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Phone UI */
@media (max-width: 768px) {
  .notification-toast {
    top: calc(14px + env(safe-area-inset-top));
    left: 10px;
    right: 10px;
    width: auto;
    max-width: none;
    padding: 14px 16px;
    border-radius: 18px;
    align-items: flex-start;
    gap: 10px;
    box-shadow: 0 14px 42px rgba(0,0,0,0.42);
    backdrop-filter: blur(14px);
    animation: notification-mobile-slide-in 0.28s ease-out;
  }

  .notification-icon {
    font-size: 19px;
    margin-top: 1px;
  }

  .notification-message {
    font-size: 13px;
    line-height: 1.45;
  }
}

@media (max-width: 430px) {
  .notification-toast {
    left: 8px;
    right: 8px;
    padding: 13px 14px;
    border-radius: 16px;
  }

  .notification-message {
    font-size: 12.5px;
  }
}

@keyframes notification-mobile-slide-in {
  from {
    opacity: 0;
    transform: translateY(-18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
      `}</style>
    </>
  );
};

export default Notification;