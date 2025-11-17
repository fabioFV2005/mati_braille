import React from 'react';
import { Activity, Users, BookOpen, TrendingUp, UserCheck } from 'lucide-react';
import './ReportsView.css';

const ReportsView = () => {
  // TODO: Implementar fetch de estadísticas del backend
  const stats = {
    totalStudents: 0,
    totalTeachers: 0,
    totalLessons: 0,
    averageProgress: 0
  };

  return (
    <div className="reports-view">
      <div className="view-header">
        <div className="header-content">
          <h1 className="view-title">
            <Activity className="title-icon" />
            Reportes y Estadísticas
          </h1>
          <p className="view-subtitle">
            Vista general del sistema y métricas de rendimiento
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={32} />
          </div>
          <div className="stat-info">
            <div className="stat-number">{stats.totalStudents}</div>
            <div className="stat-label">Estudiantes Activos</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <UserCheck size={32} />
          </div>
          <div className="stat-info">
            <div className="stat-number">{stats.totalTeachers}</div>
            <div className="stat-label">Profesores</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon yellow">
            <BookOpen size={32} />
          </div>
          <div className="stat-info">
            <div className="stat-number">{stats.totalLessons}</div>
            <div className="stat-label">Lecciones Creadas</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <TrendingUp size={32} />
          </div>
          <div className="stat-info">
            <div className="stat-number">{stats.averageProgress}%</div>
            <div className="stat-label">Progreso Promedio</div>
          </div>
        </div>
      </div>

      <div className="reports-content">
        <div className="report-section">
          <h2 className="section-title">Actividad del Sistema</h2>
          <div className="chart-placeholder">
            <Activity size={48} className="placeholder-icon" />
            <p>Gráficos de actividad próximamente</p>
          </div>
        </div>

        <div className="report-section">
          <h2 className="section-title">Progreso de Estudiantes</h2>
          <div className="chart-placeholder">
            <TrendingUp size={48} className="placeholder-icon" />
            <p>Gráficos de progreso próximamente</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
