import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Edit2, Trash2, UserCheck, Users, UserPlus } from 'lucide-react';
import adminService from '../../../services/adminService';
import './LessonsView.css';

const LessonsView = () => {
  const [lessons, setLessons] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    teacher_id: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminService.classes.getAll();
      
      // Mapear classes del backend a lessons del frontend
      const mappedLessons = data.classes.map(adminService.utils.mapClassToLesson);
      
      setLessons(mappedLessons);
      setTeachers(data.teachers);
      setAllStudents(data.students);
    } catch (error) {
      console.error('Error loading data:', error);
      alert(`Error al cargar datos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManageStudents = async (lesson) => {
    try {
      setSelectedClass(lesson);
      setShowStudentsModal(true);
      
      // Cargar estudiantes de la clase
      const details = await adminService.classes.getDetails(lesson.id);
      setClassStudents(details.students || []);
      setSelectedStudentIds([]);
    } catch (error) {
      console.error('Error loading class students:', error);
      alert(`Error al cargar estudiantes: ${error.message}`);
    }
  };

  const handleAddStudents = async () => {
    if (selectedStudentIds.length === 0) {
      alert('Selecciona al menos un estudiante');
      return;
    }

    try {
      await adminService.classes.addStudents(selectedClass.id, selectedStudentIds);
      alert(`${selectedStudentIds.length} estudiante(s) añadido(s) exitosamente`);
      
      // Recargar estudiantes de la clase
      const details = await adminService.classes.getDetails(selectedClass.id);
      setClassStudents(details.students || []);
      setSelectedStudentIds([]);
      loadData(); // Actualizar contador de estudiantes
    } catch (error) {
      console.error('Error adding students:', error);
      alert(error.message || 'Error al añadir estudiantes');
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const getAvailableStudents = () => {
    const enrolledIds = classStudents.map(s => s.id);
    return allStudents.filter(student => !enrolledIds.includes(student.id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validar nombre de clase
      adminService.utils.validateClassName(formData.title);
      
      if (editingId) {
        // Actualizar: asignar profesor a clase existente
        await adminService.classes.assignTeacher(
          editingId,
          formData.teacher_id || null
        );
        alert('Clase actualizada exitosamente');
      } else {
        // Crear nueva clase
        await adminService.classes.create(
          formData.title,
          formData.teacher_id || null
        );
        alert('Clase creada exitosamente');
      }
      
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert(error.message || 'Error al guardar la clase');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta clase? Se eliminarán también las asignaciones de estudiantes.')) {
      try {
        await adminService.classes.delete(id);
        alert('Clase eliminada exitosamente');
        loadData();
      } catch (error) {
        console.error('Error deleting lesson:', error);
        alert(error.message || 'Error al eliminar la clase');
      }
    }
  };

  const handleEdit = (lesson) => {
    setEditingId(lesson.id);
    setFormData({
      title: lesson.title,
      teacher_id: lesson.teacher_id || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ title: '', teacher_id: '' });
    setEditingId(null);
  };

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lesson.teacher_name && lesson.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="lessons-view">
      <div className="view-header">
        <div className="header-content">
          <h1 className="view-title">
            <BookOpen className="title-icon" />
            Gestión de Clases
          </h1>
          <p className="view-subtitle">
            Crear clases y asignar a profesores
          </p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus size={20} />
          Nueva Clase
        </button>
      </div>

      <div className="search-container">
        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar clases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando clases...</p>
        </div>
      ) : filteredLessons.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={64} className="empty-icon" />
          <h3>No hay clases creadas</h3>
          <p>Comienza creando clases y asignándolas a profesores</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Crear Primera Clase
          </button>
        </div>
      ) : (
        <div className="lessons-grid">
          {filteredLessons.map((lesson) => (
            <div key={lesson.id} className="lesson-card">
              <div className="lesson-header">
                <div className="lesson-icon">
                  <BookOpen size={28} />
                </div>
              </div>
              <div className="lesson-content">
                <h3 className="lesson-title">{lesson.title}</h3>
                {lesson.teacher_name && (
                  <div className="lesson-teacher">
                    <UserCheck size={16} />
                    <span>Asignado a: {lesson.teacher_name}</span>
                  </div>
                )}
                <div className="lesson-stats">
                  <div className="stat-item">
                    <Users size={16} />
                    <span>{lesson.students_count || 0} estudiantes</span>
                  </div>
                </div>
              </div>
              <div className="lesson-actions">
                <button 
                  className="btn-icon btn-students"
                  onClick={() => handleManageStudents(lesson)}
                  title="Gestionar Estudiantes"
                >
                  <UserPlus size={18} />
                </button>
                <button 
                  className="btn-icon btn-edit"
                  onClick={() => handleEdit(lesson)}
                  title="Editar"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  className="btn-icon btn-delete"
                  onClick={() => handleDelete(lesson.id)}
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Editar Clase' : 'Nueva Clase'}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="title">Nombre de la Clase *</label>
                <input
                  id="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ej: Introducción al Braille"
                />
              </div>
              <div className="form-group">
                <label htmlFor="teacher_id">Asignar a Profesor</label>
                <select
                  id="teacher_id"
                  value={formData.teacher_id}
                  onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
                >
                  <option value="">Sin asignar</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Actualizar' : 'Crear'} Clase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStudentsModal && selectedClass && (
        <div className="modal-overlay" onClick={() => setShowStudentsModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <Users size={24} />
                Gestionar Estudiantes - {selectedClass.title}
              </h2>
              <button 
                className="modal-close"
                onClick={() => setShowStudentsModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="students-modal-content">
              {/* Estudiantes actualmente en la clase */}
              <div className="enrolled-students-section">
                <h3 className="section-title">
                  <UserCheck size={20} />
                  Estudiantes Inscritos ({classStudents.length})
                </h3>
                {classStudents.length === 0 ? (
                  <div className="empty-message">
                    <Users size={40} className="empty-icon" />
                    <p>No hay estudiantes inscritos en esta clase</p>
                  </div>
                ) : (
                  <div className="students-list">
                    {classStudents.map(student => (
                      <div key={student.id} className="student-item enrolled">
                        <div className="student-avatar">
                          {student.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="student-info">
                          <span className="student-name">{student.full_name}</span>
                          <span className="student-username">@{student.username}</span>
                        </div>
                        <span className="enrolled-badge">Inscrito</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Estudiantes disponibles para añadir */}
              <div className="available-students-section">
                <h3 className="section-title">
                  <UserPlus size={20} />
                  Añadir Estudiantes ({getAvailableStudents().length} disponibles)
                </h3>
                {getAvailableStudents().length === 0 ? (
                  <div className="empty-message">
                    <UserCheck size={40} className="empty-icon" />
                    <p>Todos los estudiantes ya están inscritos</p>
                  </div>
                ) : (
                  <>
                    <div className="students-list">
                      {getAvailableStudents().map(student => (
                        <div 
                          key={student.id} 
                          className={`student-item selectable ${selectedStudentIds.includes(student.id) ? 'selected' : ''}`}
                          onClick={() => toggleStudentSelection(student.id)}
                        >
                          <div className="student-avatar">
                            {student.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="student-info">
                            <span className="student-name">{student.full_name}</span>
                            <span className="student-username">@{student.username}</span>
                          </div>
                          <input 
                            type="checkbox"
                            checked={selectedStudentIds.includes(student.id)}
                            onChange={() => {}}
                            className="student-checkbox"
                          />
                        </div>
                      ))}
                    </div>
                    {selectedStudentIds.length > 0 && (
                      <div className="add-students-footer">
                        <p>{selectedStudentIds.length} estudiante(s) seleccionado(s)</p>
                        <button 
                          className="btn-primary"
                          onClick={handleAddStudents}
                        >
                          <UserPlus size={18} />
                          Añadir Estudiantes
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonsView;
