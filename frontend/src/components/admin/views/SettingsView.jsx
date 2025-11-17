import React from 'react';
import { Settings, Database, Shield, Bell } from 'lucide-react';
import './SettingsView.css';

const SettingsView = () => {
  return (
    <div className="settings-view">
      <div className="view-header">
        <div className="header-content">
          <h1 className="view-title">
            <Settings className="title-icon" />
            Configuración del Sistema
          </h1>
          <p className="view-subtitle">
            Ajustes y configuración general de TouchGlyph
          </p>
        </div>
      </div>

      <div className="settings-sections">
        <div className="settings-card">
          <div className="settings-icon">
            <Database size={28} />
          </div>
          <div className="settings-content">
            <h3 className="settings-title">Base de Datos</h3>
            <p className="settings-description">
              Gestión de respaldos y mantenimiento de la base de datos
            </p>
            <button className="btn-settings">Administrar</button>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-icon">
            <Shield size={28} />
          </div>
          <div className="settings-content">
            <h3 className="settings-title">Seguridad y Permisos</h3>
            <p className="settings-description">
              Configurar roles de usuario y permisos del sistema
            </p>
            <button className="btn-settings">Administrar</button>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-icon">
            <Bell size={28} />
          </div>
          <div className="settings-content">
            <h3 className="settings-title">Notificaciones</h3>
            <p className="settings-description">
              Configurar alertas y notificaciones del sistema
            </p>
            <button className="btn-settings">Administrar</button>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-icon">
            <Settings size={28} />
          </div>
          <div className="settings-content">
            <h3 className="settings-title">General</h3>
            <p className="settings-description">
              Configuración general del sistema y preferencias
            </p>
            <button className="btn-settings">Administrar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
