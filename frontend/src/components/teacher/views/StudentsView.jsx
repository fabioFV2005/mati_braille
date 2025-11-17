import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, TrendingUp } from 'lucide-react';
import './StudentsView.css';

const StudentsView = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('userData'));
      const teacherId = userData?.id;
      
      if (!teacherId) {
        console.error('No teacher ID found');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5002/api/teacher/classes/${teacherId}`);
      const data = await response.json();
      
      console.log('Classes data:', data);
      setClasses(data.classes || []);
      
      // Combinar todos los estudiantes de todas las clases
      const allStudents = [];
      if (data.classes) {
        data.classes.forEach(classData => {
          if (classData.students) {
            classData.students.forEach(student => {
              allStudents.push({
                ...student,
                className: classData.name,
                classId: classData.id
              });
            });
          }
        });
      }
      setStudents(allStudents);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="students-view-loading">
        <div className="loading-spinner"></div>
        <p>Cargando estudiantes...</p>
      </div>
    );
  }

  return (
    <div className="students-view">
      <div className="students-view-header">
        <div className="header-content">
          <h1 className="view-title">
            <Users className="title-icon" />
            Mis Estudiantes
          </h1>
          <p className="view-subtitle">
            Estudiantes inscritos en tus lecciones asignadas
          </p>
        </div>

        <div className="search-bar">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar estudiante por nombre o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {students.length === 0 ? (
        <div className="empty-state">
          <Users size={64} className="empty-icon" />
          <h3>No hay estudiantes registrados</h3>
          <p>Cuando asignes estudiantes a tus clases, aparecerán aquí</p>
        </div>
      ) : (
        <>
          {/* Mostrar clases */}
          <div className="classes-section">
            <h2 className="section-title">Mis Clases ({classes.length})</h2>
            <div className="classes-grid">
              {classes.map((classData) => (
                <div key={classData.id} className="class-card">
                  <h3 className="class-name">{classData.name}</h3>
                  {classData.description && (
                    <p className="class-description">{classData.description}</p>
                  )}
                  <div className="class-stats">
                    <div className="stat">
                      <span className="stat-value">{classData.student_count}</span>
                      <span className="stat-label">Estudiantes</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{classData.lesson_count}</span>
                      <span className="stat-label">Lecciones</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mostrar estudiantes */}
          <div className="students-section">
            <h2 className="section-title">Todos los Estudiantes ({students.length})</h2>
            <div className="students-grid">
              {students
                .filter(student => 
                  student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  student.username?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((student) => (
                  <div key={`${student.classId}-${student.id}`} className="student-card">
                    <div className="student-header">
                      <div className="student-avatar">
                        <span>{student.full_name?.charAt(0) || student.username?.charAt(0)}</span>
                      </div>
                      <div className="student-info">
                        <h3 className="student-name">{student.full_name || student.username}</h3>
                        <p className="student-username">@{student.username}</p>
                        <p className="student-class">Clase: {student.className}</p>
                      </div>
                    </div>

                    <div className="student-stats">
                      <div className="stat">
                        <span className="stat-value">{student.completed_lessons || 0}</span>
                        <span className="stat-label">Lecciones</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{student.total_score || 0}</span>
                        <span className="stat-label">Puntos</span>
                      </div>
                    </div>

                    <div className="student-actions">
                      <button className="btn btn-primary">
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentsView;
