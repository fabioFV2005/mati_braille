import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Activity,
  LogOut,
  Menu,
  X,
  TrendingUp,
  User
} from 'lucide-react';
import LessonView from './views/LessonView';
import StudentsView from './views/StudentsView';
import ProgressView from './views/ProgressView';
import ProfileView from './views/ProfileView';
import './TeacherDashboardNew.css';

const TeacherDashboard = ({ onLogout }) => {
  const [userData, setUserData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('lecciones');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const user = JSON.parse(storedUserData);
      setUserData(user);
      
      // Verificar que sea profesor
      if (user.role !== 'teacher') {
        navigate('/dashboard');
      }
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      onLogout();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'lecciones':
        return <LessonView />;

      case 'estudiantes':
        return <StudentsView />;

      case 'progreso':
        return <ProgressView />;

      case 'perfil':
        return <ProfileView />;

      default:
        return <LessonView />;
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="teacher-app">
      <header className="teacher-header">
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
              <span className="logo-text">TouchGlyph Profesor</span>
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

      <div className="teacher-main-wrapper">
        <aside className={`teacher-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <nav className="sidebar-nav">
            {[
              { id: 'lecciones', label: 'Mis Lecciones', icon: BookOpen },
              { id: 'estudiantes', label: 'Estudiantes', icon: Users },
              { id: 'progreso', label: 'Progreso', icon: TrendingUp },
              { id: 'perfil', label: 'Perfil', icon: User },
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

        <main className="teacher-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
