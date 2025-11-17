import React, { useState, useEffect } from 'react';
import { teacherService } from '../../services/teacherService';
import { useNavigate } from 'react-router-dom';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar autenticación antes de cargar datos
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getDashboardData();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      if (err.message === 'Authentication required') {
        navigate('/login');
        return;
      }
      setError(err.message);
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClassClick = (classId) => {
    navigate(`/teacher/class/${classId}`);
  };

  const handleStudentClick = (studentId) => {
    navigate(`/teacher/student/${studentId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userCompleteData');
    localStorage.removeItem('tempUserData');
    navigate('/login');
  };

  const getAccuracyLevel = (accuracy) => {
    if (accuracy >= 80) return { level: 'High', class: 'accuracy-high' };
    if (accuracy >= 60) return { level: 'Medium', class: 'accuracy-medium' };
    return { level: 'Low', class: 'accuracy-low' };
  };

  // Componente para mostrar estudiantes de una clase
  const ClassStudentsView = ({ classId, className }) => {
    const [studentsData, setStudentsData] = useState(null);
    const [studentsLoading, setStudentsLoading] = useState(true);
    const [studentsError, setStudentsError] = useState(null);

    useEffect(() => {
      const loadClassStudents = async () => {
        try {
          setStudentsLoading(true);
          const data = await teacherService.getClassStudents(classId);
          setStudentsData(data);
          setStudentsError(null);
        } catch (err) {
          setStudentsError(err.message);
        } finally {
          setStudentsLoading(false);
        }
      };

      loadClassStudents();
    }, [classId]);

    if (studentsLoading) {
      return <div className="loading">Loading students...</div>;
    }

    if (studentsError) {
      return <div className="error">Error: {studentsError}</div>;
    }

    return (
      <div className="class-students-view">
        <div className="view-header">
          <button onClick={() => setDashboardData(prev => ({...prev, currentView: 'dashboard'}))} 
                  className="btn btn-back">
            ← Back to Classes
          </button>
          <h2>{className} - Students</h2>
        </div>
        
        <div className="students-grid">
          {studentsData.students.map((student) => {
            const progressBadge = getAccuracyLevel(student.accuracy);
            return (
              <div key={student.id} className="student-card" 
                   onClick={() => handleStudentClick(student.id)}>
                <div className="student-header">
                  <div className="student-name">
                    {student.full_name}
                    <span className={`progress-badge ${progressBadge.class}`}>
                      {progressBadge.level}
                    </span>
                  </div>
                  <div className="student-username">@{student.username}</div>
                </div>
                
                <div className="student-stats">
                  <div className="stat">
                    <div className="stat-value">{student.lessons_attempted}</div>
                    <div className="stat-label">Lessons Started</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{student.lessons_completed}</div>
                    <div className="stat-label">Lessons Completed</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{student.accuracy}%</div>
                    <div className="stat-label">Accuracy</div>
                  </div>
                </div>
                
                <div className="accuracy-bar">
                  <div 
                    className="accuracy-fill" 
                    style={{ width: `${student.accuracy}%` }}
                  ></div>
                </div>
                
                <div className="last-activity">
                  Last activity: {student.last_activity}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="teacher-dashboard loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading teacher dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-dashboard error">
        <div className="error-content">
          <h3>Unable to Load Dashboard</h3>
          <p>{error}</p>
          <button onClick={loadDashboardData} className="btn btn-primary">
            Try Again
          </button>
          <button onClick={handleLogout} className="btn btn-outline">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData || !dashboardData.classes) {
    return (
      <div className="teacher-dashboard">
        <div className="no-classes">
          <h3>No Classes Found</h3>
          <p>You don't have any classes assigned yet.</p>
          <button onClick={handleLogout} className="btn btn-primary">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Si estamos viendo estudiantes de una clase específica
  if (dashboardData.currentView === 'classStudents') {
    return <ClassStudentsView 
      classId={dashboardData.currentClassId} 
      className={dashboardData.currentClassName} 
    />;
  }

  // Vista principal del dashboard
  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="teacher-info">
            <h1>Teacher Dashboard</h1>
            <p className="welcome-message">
              Welcome back, {dashboardData.teacher?.full_name || 'Teacher'}
            </p>
          </div>
          <button onClick={handleLogout} className="btn btn-outline logout-btn">
            Logout
          </button>
        </div>
        
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-number">{dashboardData.classes.length}</div>
            <div className="stat-label">Total Classes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {dashboardData.classes.reduce((total, cls) => total + cls.student_count, 0)}
            </div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>
      </div>

      <div className="classes-section">
        <h2 className="section-title">Your Classes</h2>
        
        <div className="classes-grid">
          {dashboardData.classes.map((classItem) => {
            const accuracyInfo = getAccuracyLevel(classItem.avg_accuracy);
            return (
              <div key={classItem.id} className="class-card">
                <div className="class-header">
                  <h3 className="class-name">{classItem.name}</h3>
                  <div className={`accuracy-badge ${accuracyInfo.class}`}>
                    {classItem.avg_accuracy || 0}% Avg Accuracy
                  </div>
                </div>
                
                <div className="class-stats">
                  <div className="class-stat">
                    <span className="stat-value">{classItem.student_count}</span>
                    <span className="stat-label">Students</span>
                  </div>
                  <div className="class-stat">
                    <span className="stat-value">{classItem.lessons_attempted}</span>
                    <span className="stat-label">Lessons Started</span>
                  </div>
                  <div className="class-stat">
                    <span className="stat-value">{classItem.lessons_completed}</span>
                    <span className="stat-label">Lessons Completed</span>
                  </div>
                </div>
                
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${classItem.avg_accuracy || 0}%` }}
                  ></div>
                </div>
                
                <div className="class-actions">
                  <button 
                    onClick={() => handleClassClick(classItem.id)} 
                    className="btn btn-primary"
                  >
                    View Students
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="dashboard-footer">
        <button onClick={handleLogout} className="btn btn-back">
          Logout
        </button>
      </div>
    </div>
  );
};

export default TeacherDashboard;