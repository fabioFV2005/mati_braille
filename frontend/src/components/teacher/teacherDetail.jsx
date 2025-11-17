import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teacherService } from '../../services/teacherService';
import './teacherDetail.css';

const TeacherStudentDetail = () => {
  const { studentId } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getStudentDetails(studentId);
      setStudentData(data);
      setError(null);
    } catch (err) {
      setError('Error loading student data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'No disponible' || dateString === 'En progreso') {
      return dateString;
    }
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="teacher-student-detail loading">
        <div className="loading-spinner">Loading Student Data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-student-detail error">
        <div className="error-message">
          <h3>Error Loading Student Details</h3>
          <p>{error}</p>
          <button onClick={loadStudentData} className="btn btn-primary">
            Retry
          </button>
          <Link to="/teacher" className="btn btn-back">
            Back to Teacher Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="teacher-student-detail">
        <div className="no-data">No student data available</div>
      </div>
    );
  }

  const { student, progress, overall } = studentData;

  return (
    <div className="teacher-student-detail">
      <div className="student-header">
        <h1>{student.full_name}</h1>
        <p className="student-username">Username: {student.username}</p>
        
        <div className="student-info-grid">
          <div className="info-card">
            <div className="info-value">{overall.lessons_attempted || 0}</div>
            <div className="info-label">Lessons Started</div>
          </div>
          <div className="info-card">
            <div className="info-value">{overall.lessons_completed || 0}</div>
            <div className="info-label">Lessons Completed</div>
          </div>
          <div className="info-card">
            <div className="info-value">{overall.total_attempts || 0}</div>
            <div className="info-label">Total Attempts</div>
          </div>
          <div className="info-card">
            <div className="info-value">{overall.overall_accuracy || 0}%</div>
            <div className="info-label">Overall Accuracy</div>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <h2 className="section-title">Lesson Progress</h2>
        
        <div className="lesson-progress-list">
          {progress && progress.length > 0 ? (
            progress.map((lesson, index) => (
              <div key={index} className="lesson-card">
                <div className="lesson-header">
                  <div className="lesson-title">
                    {lesson.title}
                    {lesson.finished_at && lesson.finished_at !== 'En progreso' ? (
                      <span className="status-badge completed">Completed</span>
                    ) : (
                      <span className="status-badge in-progress">In Progress</span>
                    )}
                  </div>
                  <div className="lesson-score">{lesson.score || 0} points</div>
                </div>
                
                <div className="lesson-details">
                  <div className="detail-item">
                    <strong>Attempts:</strong> {lesson.total_attempts || 0}
                  </div>
                  <div className="detail-item">
                    <strong>Correct:</strong> {lesson.correct_attempts || 0}
                  </div>
                  <div className="detail-item">
                    <strong>Started:</strong> {formatDate(lesson.started_at)}
                  </div>
                  <div className="detail-item">
                    <strong>Completed:</strong> {formatDate(lesson.finished_at)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-progress">
              <h3>No Progress Recorded</h3>
              <p>The student hasn't started any lessons yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="action-buttons">
        <Link to="/teacher" className="btn btn-back">
          Back to Teacher Dashboard
        </Link>
        <button 
          className="btn btn-primary" 
          onClick={() => alert(`Generating detailed report for ${student.full_name}...`)}
        >
          Generate Report
        </button>
      </div>
    </div>
  );
};

export default TeacherStudentDetail;