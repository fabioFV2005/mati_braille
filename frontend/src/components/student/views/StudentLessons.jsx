import React, { useState, useEffect } from 'react';
import { BookOpen, Star, Trophy, Clock, CheckCircle, Lock, Play } from 'lucide-react';
import LessonPlayer from './LessonPlayer';
import './StudentLessons.css';

const StudentLessons = ({ studentId }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [playingLesson, setPlayingLesson] = useState(null);

  useEffect(() => {
    loadLessons();
  }, [studentId]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      console.log('Loading lessons for studentId:', studentId);
      const response = await fetch(`http://localhost:5003/api/student/lessons/${studentId}`);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Lessons data:', data);
      setLessons(data.lessons || []);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLesson = (lesson) => {
    setPlayingLesson(lesson);
  };

  const handleComplete = (score) => {
    setPlayingLesson(null);
    loadLessons(); // Recargar para actualizar progreso
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'beginner': return 'beginner';
      case 'intermediate': return 'intermediate';
      case 'advanced': return 'advanced';
      default: return 'beginner';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch(difficulty) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return 'Principiante';
    }
  };

  if (playingLesson) {
    return (
      <LessonPlayer
        lessonId={playingLesson.id}
        studentId={studentId}
        onComplete={handleComplete}
        onBack={() => setPlayingLesson(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="student-lessons">
        <div className="loading-container">
          <div className="loading-spinner-large"></div>
          <p className="loading-text">Cargando lecciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-lessons">
      <div className="lessons-header">
        <div className="header-content">
          <h1 className="page-title">
            <BookOpen className="title-icon" />
            Mis Lecciones
          </h1>
          <p className="page-subtitle">
            Aprende Braille de forma divertida e interactiva
          </p>
        </div>

        <div className="student-stats">
          <div className="stat-card">
            <Trophy className="stat-icon" />
            <div className="stat-info">
              <span className="stat-value">
                {lessons.filter(l => l.completed).length}
              </span>
              <span className="stat-label">Completadas</span>
            </div>
          </div>

          <div className="stat-card">
            <Star className="stat-icon star-yellow" />
            <div className="stat-info">
              <span className="stat-value">
                {lessons.reduce((sum, l) => sum + (l.score || 0), 0)}
              </span>
              <span className="stat-label">Puntos Totales</span>
            </div>
          </div>
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={80} className="empty-icon" />
          <h3>No hay lecciones asignadas</h3>
          <p>Tu profesor aún no te ha asignado lecciones. ¡Espera pronto nuevas actividades!</p>
        </div>
      ) : (
        <div className="lessons-grid">
          {lessons.map((lesson, index) => (
            <div 
              key={lesson.id} 
              className={`lesson-card ${lesson.completed ? 'completed' : ''}`}
            >
              {lesson.completed && (
                <div className="completed-badge">
                  <CheckCircle size={20} />
                  Completada
                </div>
              )}

              <div className="lesson-header">
                <div className="lesson-number">Lección {index + 1}</div>
                <div className={`difficulty-badge ${getDifficultyColor(lesson.difficulty)}`}>
                  {getDifficultyLabel(lesson.difficulty)}
                </div>
              </div>

              <h3 className="lesson-title">{lesson.title}</h3>
              <p className="lesson-description">{lesson.description}</p>

              <div className="lesson-info">
                <div className="info-item">
                  <BookOpen size={18} />
                  <span>{lesson.total_steps} pasos</span>
                </div>
                
                {lesson.completed && lesson.score > 0 && (
                  <div className="info-item score-item">
                    <Star size={18} />
                    <span>{lesson.score} puntos</span>
                  </div>
                )}
              </div>

              <button 
                className={`btn-play ${lesson.completed ? 'btn-replay' : 'btn-start'}`}
                onClick={() => handleStartLesson(lesson)}
              >
                <Play size={20} />
                {lesson.completed ? 'Repetir' : 'Comenzar'}
              </button>

              {lesson.completed && (
                <div className="completion-stars">
                  {[...Array(3)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={20} 
                      className={i < Math.ceil((lesson.score / lesson.total_steps) * 3) ? 'star-filled' : 'star-empty'}
                      fill={i < Math.ceil((lesson.score / lesson.total_steps) * 3) ? '#fbbf24' : 'none'}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentLessons;
