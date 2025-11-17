import React, { useEffect, useRef, useState } from 'react';
import { 
  Monitor, 
  BookOpen, 
  Activity,
  LogOut,
  User,
  Menu,
  X,
  Settings
} from 'lucide-react';
import './Sistema.css';

const Dashboard = ({ onLogout }) => {
  const [userData, setUserData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio');
  const keyboardNavIndicatorRef = useRef(null);

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      onLogout();
    }
  };

  useEffect(() => {
    let keyboardNav = false;

    const utterance = new SpeechSynthesisUtterance('Bienvenido al Sistema de Aprendizaje Braille. Usa las teclas Tab y Enter para navegar.');
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;

    const handleKeyDown = (e) => {
      if (e.key === 'h' || e.key === 'H') {
        speechSynthesis.speak(utterance);
      } else if (e.key === 'Tab') {
        keyboardNav = true;
        if (keyboardNavIndicatorRef.current) {
          keyboardNavIndicatorRef.current.classList.add('show');
        }
      } else if (e.key === '?') {
        const help = new SpeechSynthesisUtterance('Presiona H para escuchar ayuda. Tab para navegar. Enter para seleccionar. Signo de interrogación para repetir esta ayuda.');
        help.lang = 'es-ES';
        speechSynthesis.speak(help);
      }
    };

    const handleMouseDown = () => {
      keyboardNav = false;
      if (keyboardNavIndicatorRef.current) {
        keyboardNavIndicatorRef.current.classList.remove('show');
      }
    };

    const handleFocus = (link) => {
      if (keyboardNav) {
        const title = link.querySelector('.card-title').textContent;
        const desc = link.querySelector('.card-desc').textContent;
        const announce = new SpeechSynthesisUtterance(`${title}. ${desc}`);
        announce.lang = 'es-ES';
        announce.rate = 0.9;
        announce.volume = 0.3;
        speechSynthesis.cancel();
        speechSynthesis.speak(announce);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    const links = document.querySelectorAll('.dashboard-card');
    links.forEach(link => {
      link.addEventListener('focus', () => handleFocus(link));
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      links.forEach(link => {
        link.removeEventListener('focus', () => handleFocus(link));
      });
    };
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: "Lecciones",
      description: "Material de aprendizaje Braille",
      href: "/lessons",
      color: "#10b981"
    },
    {
      icon: Activity,
      title: "Práctica",
      description: "Ejercicios interactivos",
      href: "/practice",
      color: "#059669"
    },
    {
      icon: Monitor,
      title: "Dispositivos",
      description: "Conectar dispositivo Braille",
      href: "/devices",
      color: "#047857"
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'inicio':
        return (
          <div className="dashboard-container">
            <a href="#main" className="skip-link">Saltar al contenido principal</a>

            <main className="dashboard-main" id="main" role="main">
              <div className="dashboard-hero">
                <div className="hero-content">
                  <h1 className="hero-title">
                    <BookOpen className="hero-icon" />
                    Sistema de Aprendizaje Braille
                  </h1>
                  <p className="hero-subtitle">
                    Accede a tus lecciones y practica Braille
                  </p>
                  {userData && (
                    <div className="user-welcome">
                      Bienvenido, <strong>{userData.full_name || userData.username}</strong>
                      <span className="user-role">({userData.role})</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="dashboard-grid">
                {features.map((feature) => (
                  <a
                    key={feature.title}
                    href={feature.href}
                    className="dashboard-card"
                    style={{ '--accent-color': feature.color }}
                    role="button"
                    aria-describedby={`${feature.title.toLowerCase()}-desc`}
                  >
                    <div className="card-icon-wrapper">
                      <feature.icon className="card-icon" />
                    </div>
                    <h3 className="card-title">{feature.title}</h3>
                    <p className="card-desc" id={`${feature.title.toLowerCase()}-desc`}>
                      {feature.description}
                    </p>
                    <span className="sr-only">Presiona Enter para acceder a {feature.title}</span>
                  </a>
                ))}
              </div>

              <div className="dashboard-tips">
                <div className="tips-card">
                  <h3 className="tips-title">Consejos de accesibilidad</h3>
                  <div className="tips-grid">
                    <div className="tip-item">
                      <kbd>Tab</kbd>
                      <span>Navegar entre opciones</span>
                    </div>
                    <div className="tip-item">
                      <kbd>Enter</kbd>
                      <span>Seleccionar elemento</span>
                    </div>
                    <div className="tip-item">
                      <kbd>H</kbd>
                      <span>Ayuda por voz</span>
                    </div>
                    <div className="tip-item">
                      <kbd>?</kbd>
                      <span>Repetir instrucciones</span>
                    </div>
                  </div>
                  <p className="tips-note">
                    Los lectores de pantalla están completamente soportados. 
                    Comienza por <strong>Estudiantes</strong> para acceder a las lecciones.
                  </p>
                </div>
              </div>
            </main>

            <div className="keyboard-nav-indicator" ref={keyboardNavIndicatorRef} role="status" aria-live="polite">
              Navegación por teclado activa
            </div>
          </div>
        );

      case 'perfil':
        return (
          <div className="profile-container">
            <div className="profile-card">
              <h2 className="profile-title">Tu Perfil</h2>
              {userData && (
                <div className="profile-content">
                  <div className="profile-header">
                    <div className="profile-avatar">
                      <User className="profile-avatar-icon" />
                    </div>
                    <div className="profile-info">
                      <h3 className="profile-name">{userData.full_name || userData.username}</h3>
                      <p className="profile-username">@{userData.username}</p>
                      <p className="profile-member-since">Miembro desde {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="profile-grid">
                    <div className="profile-section">
                      <h4 className="profile-section-title">Información General</h4>
                      <div className="profile-field">
                        <span className="profile-label">Usuario:</span>
                        <span className="profile-value">{userData.username}</span>
                      </div>
                      <div className="profile-field">
                        <span className="profile-label">Rol:</span>
                        <span className="profile-role">{userData.role}</span>
                      </div>
                      <div className="profile-field">
                        <span className="profile-label">Nombre completo:</span>
                        <span className="profile-value">{userData.full_name || 'No especificado'}</span>
                      </div>
                    </div>
                    
                    <div className="profile-section">
                      <h4 className="profile-section-title">Actividad</h4>
                      <div className="profile-field">
                        <span className="profile-label">Cuenta creada:</span>
                        <span className="profile-value">{new Date().toLocaleDateString()}</span>
                      </div>
                      {userData.created_by && (
                        <div className="profile-field">
                          <span className="profile-label">Creado por:</span>
                          <span className="profile-value">Usuario #{userData.created_by}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'configuracion':
        return (
          <div className="settings-container">
            <div className="settings-card">
              <h2 className="settings-title">Configuración</h2>
              <div className="settings-content">
                <div className="settings-section">
                  <h4 className="settings-section-title">Notificaciones</h4>
                  <p className="settings-desc">Configura cómo quieres recibir las notificaciones</p>
                </div>
                <div className="settings-section">
                  <h4 className="settings-section-title">Privacidad</h4>
                  <p className="settings-desc">Gestiona tu privacidad y datos</p>
                </div>
                <div className="settings-section">
                  <h4 className="settings-section-title">Accesibilidad</h4>
                  <p className="settings-desc">Ajustes de accesibilidad y navegación</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-app">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="sidebar-toggle"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="logo">
              <Activity className="logo-icon" />
              <span className="logo-text">TouchGlyph</span>
            </div>
          </div>

          <div className="header-right">
            {userData && (
              <span className="user-greeting">
                Hola, {userData.full_name || userData.username}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="header-btn logout-btn"
            >
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-main-wrapper">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <nav className="sidebar-nav">
            {[
              { id: 'inicio', label: 'Inicio', icon: Activity },
              { id: 'perfil', label: 'Perfil', icon: User },
              { id: 'configuracion', label: 'Configuración', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
              >
                <item.icon className="nav-icon" size={20} />
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="content-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;