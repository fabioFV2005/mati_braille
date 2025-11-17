import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Settings, 
  Monitor, 
  BookOpen, 
  Activity,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import TeachersView from './views/TeachersView';
import AdminStudentsView from './views/AdminStudentsView';
import LessonsView from './views/LessonsView';
import DevicesView from './views/DevicesView';
import ReportsView from './views/ReportsView';
import SettingsView from './views/SettingsView';
import './AdminDashboard.css';

const AdminDashboard = ({ onLogout }) => {
  const [userData, setUserData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio');

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

  const features = [
    {
      icon: UserCheck,
      title: "Docentes",
      description: "Administrar profesores y asignaciones",
      tab: "docentes",
      color: "#059669"
    },
    {
      icon: Users,
      title: "Estudiantes",
      description: "Gestionar estudiantes del sistema",
      tab: "estudiantes",
      color: "#10b981"
    },
    {
      icon: BookOpen,
      title: "Clases",
      description: "Crear y asignar clases a profesores",
      tab: "lecciones",
      color: "#059669"
    },
    {
      icon: Monitor,
      title: "Dispositivos",
      description: "Gestionar dispositivos Braille",
      tab: "dispositivos",
      color: "#10b981"
    },
    {
      icon: Activity,
      title: "Reportes",
      description: "Ver reportes y estadísticas generales",
      tab: "reportes",
      color: "#047857"
    },
    {
      icon: Settings,
      title: "Configuración",
      description: "Configuración general del sistema",
      tab: "configuracion",
      color: "#047857"
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'docentes':
        return <TeachersView />;
      
      case 'estudiantes':
        return <AdminStudentsView />;
      
      case 'lecciones':
        return <LessonsView />;
      
      case 'dispositivos':
        return <DevicesView />;
      
      case 'reportes':
        return <ReportsView />;
      
      case 'configuracion':
        return <SettingsView />;
      
      case 'inicio':
      default:
        return (
          <div className="dashboard-container">
            <main className="dashboard-main" id="main" role="main">
              <div className="dashboard-hero">
                <div className="hero-content">
                  <h1 className="hero-title">
                    <Activity className="hero-icon" />
                    Panel de Administración
                  </h1>
                  <p className="hero-subtitle">
                    Gestión completa del Sistema de Aprendizaje Braille
                  </p>
                  {userData && (
                    <div className="user-welcome">
                      Bienvenido, <strong>{userData.full_name || userData.username}</strong>
                      <span className="user-role">Administrador</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="dashboard-grid">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    onClick={() => setActiveTab(feature.tab)}
                    className="dashboard-card"
                    style={{ '--accent-color': feature.color }}
                  >
                    <div className="card-icon-wrapper">
                      <feature.icon className="card-icon" />
                    </div>
                    <h3 className="card-title">{feature.title}</h3>
                    <p className="card-desc">{feature.description}</p>
                  </div>
                ))}
              </div>
            </main>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-app">
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
              <span className="logo-text">TouchGlyph Admin</span>
            </div>
          </div>

          <div className="header-right">
            {userData && (
              <span className="user-greeting">
                Hola, {userData.full_name || userData.username}
              </span>
            )}
            <button onClick={handleLogout} className="header-btn logout-btn">
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-main-wrapper">
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <nav className="sidebar-nav">
            <button
              onClick={() => {
                setActiveTab('inicio');
                setSidebarOpen(false);
              }}
              className={`nav-btn ${activeTab === 'inicio' ? 'active' : ''}`}
            >
              <Activity className="nav-icon" size={20} />
              <span className="nav-label">Panel Principal</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('docentes');
                setSidebarOpen(false);
              }}
              className={`nav-btn ${activeTab === 'docentes' ? 'active' : ''}`}
            >
              <UserCheck className="nav-icon" size={20} />
              <span className="nav-label">Docentes</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('estudiantes');
                setSidebarOpen(false);
              }}
              className={`nav-btn ${activeTab === 'estudiantes' ? 'active' : ''}`}
            >
              <Users className="nav-icon" size={20} />
              <span className="nav-label">Estudiantes</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('lecciones');
                setSidebarOpen(false);
              }}
              className={`nav-btn ${activeTab === 'lecciones' ? 'active' : ''}`}
            >
              <BookOpen className="nav-icon" size={20} />
              <span className="nav-label">Clases</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('dispositivos');
                setSidebarOpen(false);
              }}
              className={`nav-btn ${activeTab === 'dispositivos' ? 'active' : ''}`}
            >
              <Monitor className="nav-icon" size={20} />
              <span className="nav-label">Dispositivos</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('reportes');
                setSidebarOpen(false);
              }}
              className={`nav-btn ${activeTab === 'reportes' ? 'active' : ''}`}
            >
              <Activity className="nav-icon" size={20} />
              <span className="nav-label">Reportes</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('configuracion');
                setSidebarOpen(false);
              }}
              className={`nav-btn ${activeTab === 'configuracion' ? 'active' : ''}`}
            >
              <Settings className="nav-icon" size={20} />
              <span className="nav-label">Configuración</span>
            </button>
          </nav>
        </aside>

        <main className="content-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
