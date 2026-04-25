import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

const SuccessModal = ({ isOpen, points, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      // Эффект "Салют" из огня и звезд
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          shapes: ['circle'],
          colors: ['#ff4500', '#ffa500', '#ff8c00'] // Цвета огня
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          shapes: ['circle'],
          colors: ['#ff4500', '#ffa500', '#ff8c00']
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={fireCircleStyle}>
          <span style={{ fontSize: '50px' }}>🔥</span>
        </div>
        <h2 style={{ color: '#fff', margin: '10px 0' }}>Ты в ударе!</h2>
        <p style={{ color: '#aaa', fontSize: '18px' }}>
          За тренировку получено: <span style={{ color: '#ffd700', fontWeight: 'bold' }}>+{points} ⭐</span>
        </p>
        <button onClick={onClose} style={buttonStyle}>Продолжить</button>
      </div>
    </div>
  );
};

// Стили (можно вынести в CSS)
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex',
  justifyContent: 'center', alignItems: 'center', zIndex: 1000
};

const modalStyle = {
  backgroundColor: '#282c34', padding: '40px', borderRadius: '30px',
  textAlign: 'center', border: '2px solid #ff4500', boxShadow: '0 0 20px rgba(255, 69, 0, 0.4)',
  animation: 'pop 0.3s ease-out'
};

const fireCircleStyle = {
  width: '100px', height: '100px', borderRadius: '50%',
  backgroundColor: 'rgba(255, 69, 0, 0.1)', display: 'flex',
  justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px',
  border: '2px solid #ff4500'
};

const buttonStyle = {
  marginTop: '20px', padding: '12px 40px', borderRadius: '25px',
  border: 'none', backgroundColor: '#ff4500', color: 'white',
  fontWeight: 'bold', fontSize: '16px', cursor: 'pointer'
};

export default SuccessModal;