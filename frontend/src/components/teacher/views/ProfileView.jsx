import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import './ProfileView.css';

const ProfileView = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="profile-view-loading">
        <div className="loading-spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="profile-view">
      <div className="profile-card-main">
        <h2 className="profile-title">Tu Perfil</h2>
        
        {userData && (
          <>
            <div className="profile-header-main">
              <div className="profile-avatar-large">
                <User className="avatar-icon" size={48} />
              </div>
              <div className="profile-info-main">
                <h3 className="profile-name-large">{userData.full_name || userData.username}</h3>
                <p className="profile-username-main">@{userData.username}</p>
                <span className="profile-role-badge">
                  <Shield size={16} />
                  Profesor del Sistema
                </span>
              </div>
            </div>

            <div className="profile-sections">
              <div className="profile-section">
                <h4 className="section-title">Información General</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-icon">
                      <User size={20} />
                    </div>
                    <div className="info-content">
                      <span className="info-label">Usuario</span>
                      <span className="info-value">{userData.username}</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <Shield size={20} />
                    </div>
                    <div className="info-content">
                      <span className="info-label">Rol</span>
                      <span className="info-value role">Profesor</span>
                    </div>
                  </div>

                  {userData.full_name && (
                    <div className="info-item">
                      <div className="info-icon">
                        <User size={20} />
                      </div>
                      <div className="info-content">
                        <span className="info-label">Nombre Completo</span>
                        <span className="info-value">{userData.full_name}</span>
                      </div>
                    </div>
                  )}

                  <div className="info-item">
                    <div className="info-icon">
                      <Calendar size={20} />
                    </div>
                    <div className="info-content">
                      <span className="info-label">Miembro desde</span>
                      <span className="info-value">{new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h4 className="section-title">Estadísticas</h4>
                <div className="stats-summary">
                  <div className="stat-summary-item">
                    <span className="stat-summary-value">0</span>
                    <span className="stat-summary-label">Lecciones Asignadas</span>
                  </div>
                  <div className="stat-summary-item">
                    <span className="stat-summary-value">0</span>
                    <span className="stat-summary-label">Estudiantes</span>
                  </div>
                  <div className="stat-summary-item">
                    <span className="stat-summary-value">0</span>
                    <span className="stat-summary-label">Materiales Subidos</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
