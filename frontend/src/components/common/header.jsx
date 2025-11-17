import React from 'react';
import { Bell, LogOut, Activity } from 'lucide-react';
import './Header.css';

const Header = ({ onLogout }) => {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="header-left">
          <div className="app-logo">
            <Activity className="logo-icon" />
            <span className="app-name">TouchGlyph</span>
          </div>
        </div>
        
        <div className="header-right">
          <button className="notification-btn">
            <Bell size={20} />
          </button>
          
          {userData && (
            <div className="user-info">
              <span className="user-greeting">
                Hola, <strong>{userData.full_name || userData.username}</strong>
              </span>
            </div>
          )}
          
          <button onClick={onLogout} className="logout-btn">
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;