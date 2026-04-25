import React from 'react';
import { useTranslation } from 'react-i18next';

const Sidebar = ({
  isCollapsed, setIsCollapsed,
  activeTab, setActiveTab, menuItems, handleLogout
}) => {
  const { t } = useTranslation();

  return (
    <aside
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      style={{
        ...sidebarStyle,
        width: isCollapsed ? '80px' : '260px',
        // Добавляем защиту от "вылетов" контента
        overflowX: 'hidden',
      }}
    >
      <div className="sidebar-logo" style={logoContainerStyle}>
        <span className="logo-fire" style={{ fontSize: '24px', minWidth: '40px', textAlign: 'center' }}>🔥</span>
        {!isCollapsed && <h2 style={logoTextStyle}>FIT AI</h2>}
      </div>

      <nav style={{ flex: 1, marginTop: '10px', width: '100%' }}>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              onClick={(e) => {
                e.stopPropagation(); // Защита, чтобы клик не улетел на фон
                setActiveTab(item.id);
              }}
              className={`menu-item ${isActive ? 'active' : ''}`}
              style={{
                ...menuItemBaseStyle,
                // Важно: в свернутом виде центрируем иконку четко
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                backgroundColor: isActive ? 'rgba(97, 218, 251, 0.15)' : 'transparent',
                padding: isCollapsed ? '16px 0' : '16px',
                margin: isCollapsed ? '4px 15px' : '4px 12px',
              }}
              title={isCollapsed ? item.label : ""}
            >
              <span style={{ fontSize: '20px', minWidth: '40px', textAlign: 'center' }}>{item.icon}</span>
              {!isCollapsed && <span style={{ marginLeft: '10px', whiteSpace: 'nowrap' }}>{item.label}</span>}
            </div>
          );
        })}
      </nav>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
  <button
    onClick={handleLogout}

    style={{ ...logoutButtonStyle, pointerEvents: 'auto' }} // Кнопка кликабельна, контейнер - нет
  >
    {isCollapsed ? '🚪' : `🚪 ${t('menu.logout')}`}
  </button>
</div>
    </aside>
  );
};

// СТИЛИ (чуть-чуть подправили z-index и переходы)
const sidebarStyle = {
  background: '#1c1e22',
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  position: 'fixed',
  left: 0,
  top: 0,
  // ВАЖНО: Добавляем эти три строки, чтобы убрать "фантомные" клики
  width: 'inherit',
  maxWidth: 'inherit',
  pointerEvents: 'auto',
  // -------------------------
  overflow: 'hidden',
  zIndex: 10000, // Поднимаем выше всех
  transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  borderRight: '1px solid rgba(255,255,255,0.05)',
  boxShadow: '10px 0 30px rgba(0,0,0,0.3)',
  backdropFilter: 'blur(15px)',
};

const logoContainerStyle = { padding: '30px 20px', display: 'flex', alignItems: 'center', height: '80px', overflow: 'hidden' };
const logoTextStyle = { color: '#61dafb', margin: 0, fontSize: '20px', fontWeight: '900', marginLeft: '10px', whiteSpace: 'nowrap' };
const menuItemBaseStyle = { cursor: 'pointer', display: 'flex', alignItems: 'center', borderRadius: '12px', color: '#abb2bf', transition: 'all 0.2s ease', overflow: 'hidden' };
const logoutButtonStyle = {
  width: '85%', // Добавь ширину, чтобы кнопка была видна
  marginBottom: '20px', // Отступ от низа
  padding: '12px',
  borderRadius: '12px', // Добавь скругление (в CSS у тебя 25px, лучше привести к одному виду)
  color: 'white',
  background: 'linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%)',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: '0.3s',
  whiteSpace: 'nowrap'
};
export default Sidebar;