import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart2, Award, Clock } from 'lucide-react';
import './ProgressView.css';

const ProgressView = () => {
  const [stats, setStats] = useState({
    activeStudents: 0,
    assignedLessons: 0,
    averageProgress: 0,
    totalHours: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aquí cargarás las estadísticas desde el backend
    setTimeout(() => {
      setStats({
        activeStudents: 0,
        assignedLessons: 0,
        averageProgress: 0,
        totalHours: 0
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="progress-view-loading">
        <div className="loading-spinner"></div>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="progress-view">
      <div className="progress-view-header">
        <div className="header-content">
          <h1 className="view-title">
            <TrendingUp className="title-icon" />
            Progreso de Estudiantes
          </h1>
          <p className="view-subtitle">
            Monitorea el avance y desempeño de tus estudiantes
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">
            <BarChart2 size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.activeStudents}</div>
            <div className="stat-label">Estudiantes Activos</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon lessons">
            <Award size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.assignedLessons}</div>
            <div className="stat-label">Lecciones Asignadas</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon progress">
            <TrendingUp size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.averageProgress}%</div>
            <div className="stat-label">Progreso Promedio</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon hours">
            <Clock size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalHours}h</div>
            <div className="stat-label">Horas de Estudio</div>
          </div>
        </div>
      </div>

      <div className="progress-charts">
        <div className="chart-card">
          <h3 className="chart-title">Rendimiento por Lección</h3>
          <div className="chart-placeholder">
            <BarChart2 size={48} className="chart-icon" />
            <p>Gráfico disponible próximamente</p>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Progreso en el Tiempo</h3>
          <div className="chart-placeholder">
            <TrendingUp size={48} className="chart-icon" />
            <p>Gráfico disponible próximamente</p>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3 className="section-title">Actividad Reciente</h3>
        <div className="activity-list">
          <div className="empty-state-small">
            <p>No hay actividad reciente para mostrar</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressView;
