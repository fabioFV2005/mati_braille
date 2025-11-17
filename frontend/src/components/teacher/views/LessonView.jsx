import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit, Trash2, AlertCircle, X, ChevronRight, ChevronLeft, Save, Users } from 'lucide-react';
import { teacherService } from '../../../services/teacherService';
import './LessonView.css';

const LessonView = () => {
  const [lessons, setLessons] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  
  // Estado para el formulario de creación
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'beginner',
    order_index: 0,
    steps: []
  });
  const [currentStep, setCurrentStep] = useState({
    type: 'input',
    target: '',
    prompt: '',
    hint: '',
    max_attempts: 3
  });

  useEffect(() => {
    loadLessons();
    loadClasses();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teacherService.getLessons();
      setLessons(data);
    } catch (err) {
      console.error('Error loading lessons:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const teacherId = userData?.id;
      
      if (!teacherId) return;

      const response = await fetch(`http://localhost:5002/api/teacher/classes/${teacherId}`);
      const data = await response.json();
      setClasses(data.classes || []);
    } catch (err) {
      console.error('Error loading classes:', err);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: 'beginner',
      order_index: lessons.length,
      steps: []
    });
    setCurrentStep({
      type: 'input',
      target: '',
      prompt: '',
      hint: '',
      max_attempts: 3
    });
    setCurrentPage(1);
    setShowCreateModal(true);
  };

  const handleAddStep = () => {
    if (!currentStep.target.trim() || !currentStep.prompt.trim()) {
      alert('El paso necesita un objetivo (target) y una pregunta (prompt)');
      return;
    }

    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { ...currentStep }]
    }));

    setCurrentStep({
      type: 'input',
      target: '',
      prompt: '',
      hint: '',
      max_attempts: 3
    });
  };

  const handleRemoveStep = (index) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const handleCreateLesson = async () => {
    if (!formData.title.trim()) {
      alert('El título es requerido');
      return;
    }

    if (formData.steps.length === 0) {
      alert('Debes agregar al menos un paso a la lección');
      return;
    }

    try {
      await teacherService.createLesson(formData);
      setShowCreateModal(false);
      loadLessons();
      alert('¡Lección creada exitosamente!');
    } catch (err) {
      console.error('Error creating lesson:', err);
      alert(`Error al crear lección: ${err.message}`);
    }
  };

  const handleAssignToClass = (lesson) => {
    setSelectedLesson(lesson);
    setShowAssignModal(true);
  };

  const handleConfirmAssign = async (classId) => {
    try {
      const response = await fetch(`http://localhost:5002/api/teacher/lesson/${selectedLesson.id}/assign-to-class`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ class_id: classId })
      });

      if (!response.ok) {
        throw new Error('Error al asignar lección');
      }

      alert('Lección asignada exitosamente');
      setShowAssignModal(false);
      setSelectedLesson(null);
    } catch (err) {
      console.error('Error assigning lesson:', err);
      alert(`Error al asignar lección: ${err.message}`);
    }
  };

  const handleDeleteLesson = async (lessonId, lessonTitle) => {
    if (!confirm(`¿Estás seguro de eliminar la lección "${lessonTitle}"?`)) {
      return;
    }

    try {
      await teacherService.deleteLesson(lessonId);
      loadLessons();
      alert('Lección eliminada exitosamente');
    } catch (err) {
      console.error('Error deleting lesson:', err);
      alert(`Error al eliminar lección: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="lesson-view-loading">
        <div className="loading-spinner"></div>
        <p>Cargando lecciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lesson-view-error">
        <AlertCircle size={48} className="error-icon" />
        <h3>Error al cargar lecciones</h3>
        <p>{error}</p>
        <button onClick={loadLessons} className="btn btn-primary">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="lesson-view">
      <div className="lesson-view-header">
        <div className="header-content">
          <h1 className="view-title">
            <BookOpen className="title-icon" />
            Mis Lecciones
          </h1>
          <p className="view-subtitle">
            Crea y gestiona lecciones tipo Duolingo con ejercicios interactivos
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={20} />
          Crear Lección
        </button>
      </div>

      {lessons.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={64} className="empty-icon" />
          <h3>No hay lecciones creadas</h3>
          <p>Crea tu primera lección interactiva con ejercicios de Braille</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={20} />
            Crear Primera Lección
          </button>
        </div>
      ) : (
        <div className="lessons-grid">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="lesson-card">
              <div className="lesson-card-header">
                <h3 className="lesson-title">{lesson.title}</h3>
                <span className={`difficulty-badge ${lesson.difficulty || 'beginner'}`}>
                  {lesson.difficulty === 'beginner' && 'Principiante'}
                  {lesson.difficulty === 'intermediate' && 'Intermedio'}
                  {lesson.difficulty === 'advanced' && 'Avanzado'}
                </span>
              </div>
              
              <p className="lesson-description">{lesson.description}</p>
              
              <div className="lesson-stats">
                <div className="stat">
                  <span className="stat-value">{lesson.step_count || 0}</span>
                  <span className="stat-label">Pasos</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{lesson.order_index || 0}</span>
                  <span className="stat-label">Orden</span>
                </div>
                <div className="stat">
                  <span className="stat-value">
                    {lesson.active ? 'Activa' : 'Inactiva'}
                  </span>
                  <span className="stat-label">Estado</span>
                </div>
              </div>

              <div className="lesson-actions">
                <button 
                  className="btn btn-success"
                  onClick={() => handleAssignToClass(lesson)}
                >
                  <Users size={18} />
                  Asignar a Clase
                </button>
                <div className="lesson-actions-row">
                  <button className="btn btn-outline">
                    <Edit size={16} />
                    Editar
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de creación de lección */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <BookOpen size={24} />
                Crear Nueva Lección
              </h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {/* Indicador de página */}
              <div className="page-indicator">
                <div className={`page-dot ${currentPage === 1 ? 'active' : ''}`} onClick={() => setCurrentPage(1)}>
                  <span>1</span>
                  <p>Información</p>
                </div>
                <div className="page-connector"></div>
                <div className={`page-dot ${currentPage === 2 ? 'active' : ''}`} onClick={() => setCurrentPage(2)}>
                  <span>2</span>
                  <p>Pasos</p>
                </div>
                <div className="page-connector"></div>
                <div className={`page-dot ${currentPage === 3 ? 'active' : ''}`} onClick={() => setCurrentPage(3)}>
                  <span>3</span>
                  <p>Revisión</p>
                </div>
              </div>

              {/* Página 1: Información básica */}
              {currentPage === 1 && (
                <div className="form-page">
                  <div className="form-group">
                    <label>Título de la Lección *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej: Vocales en Braille"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea
                      className="form-textarea"
                      rows="4"
                      placeholder="Describe brevemente el contenido de la lección..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Dificultad</label>
                      <select
                        className="form-select"
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      >
                        <option value="beginner">Principiante</option>
                        <option value="intermediate">Intermedio</option>
                        <option value="advanced">Avanzado</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Orden en el curso</label>
                      <input
                        type="number"
                        className="form-input"
                        min="0"
                        value={formData.order_index}
                        onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Página 2: Agregar pasos */}
              {currentPage === 2 && (
                <div className="form-page">
                  <h3 className="page-subtitle">Agregar Ejercicios</h3>
                  <p className="page-description">
                    Cada paso es un ejercicio que el estudiante debe completar. Crea ejercicios interactivos tipo Duolingo.
                  </p>

                  <div className="steps-container">
                    <div className="step-form-card">
                      <div className="form-group">
                        <label>Tipo de Ejercicio</label>
                        <select
                          className="form-select"
                          value={currentStep.type}
                          onChange={(e) => setCurrentStep({ ...currentStep, type: e.target.value })}
                        >
                          <option value="input">Escritura (el estudiante escribe la respuesta)</option>
                          <option value="select">Selección múltiple</option>
                          <option value="match">Emparejar elementos</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Respuesta Correcta (Target) *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Ej: A, HOLA, E"
                          value={currentStep.target}
                          onChange={(e) => setCurrentStep({ ...currentStep, target: e.target.value.toUpperCase() })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Pregunta/Instrucción (Prompt) *</label>
                        <textarea
                          className="form-textarea"
                          rows="3"
                          placeholder="Ej: ¿Qué vocal representa este patrón Braille? (⠁)"
                          value={currentStep.prompt}
                          onChange={(e) => setCurrentStep({ ...currentStep, prompt: e.target.value })}
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Pista (Opcional)</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Ej: Es la primera vocal del alfabeto"
                            value={currentStep.hint}
                            onChange={(e) => setCurrentStep({ ...currentStep, hint: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>Intentos Máximos</label>
                          <input
                            type="number"
                            className="form-input"
                            min="1"
                            max="10"
                            value={currentStep.max_attempts}
                            onChange={(e) => setCurrentStep({ ...currentStep, max_attempts: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>

                      <button className="btn btn-primary btn-add-step" onClick={handleAddStep}>
                        <Plus size={18} />
                        Agregar Paso ({formData.steps.length} agregados)
                      </button>
                    </div>

                    {/* Lista de pasos agregados */}
                    {formData.steps.length > 0 && (
                      <div className="steps-list">
                        <h4>Pasos Agregados ({formData.steps.length})</h4>
                        {formData.steps.map((step, index) => (
                          <div key={index} className="step-item">
                            <div className="step-number">{index + 1}</div>
                            <div className="step-info">
                              <strong>{step.target}</strong>
                              <p>{step.prompt}</p>
                              <span className="step-type-badge">{step.type}</span>
                            </div>
                            <button
                              className="btn-remove-step"
                              onClick={() => handleRemoveStep(index)}
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Página 3: Revisión */}
              {currentPage === 3 && (
                <div className="form-page">
                  <h3 className="page-subtitle">Revisión Final</h3>
                  
                  <div className="review-section">
                    <div className="review-item">
                      <label>Título:</label>
                      <p>{formData.title || '(Sin título)'}</p>
                    </div>

                    <div className="review-item">
                      <label>Descripción:</label>
                      <p>{formData.description || '(Sin descripción)'}</p>
                    </div>

                    <div className="review-row">
                      <div className="review-item">
                        <label>Dificultad:</label>
                        <span className={`difficulty-badge ${formData.difficulty}`}>
                          {formData.difficulty === 'beginner' && 'Principiante'}
                          {formData.difficulty === 'intermediate' && 'Intermedio'}
                          {formData.difficulty === 'advanced' && 'Avanzado'}
                        </span>
                      </div>

                      <div className="review-item">
                        <label>Orden:</label>
                        <p>{formData.order_index}</p>
                      </div>

                      <div className="review-item">
                        <label>Total de Pasos:</label>
                        <p className="highlight-number">{formData.steps.length}</p>
                      </div>
                    </div>

                    {formData.steps.length > 0 && (
                      <div className="review-steps">
                        <label>Pasos de la Lección:</label>
                        {formData.steps.map((step, index) => (
                          <div key={index} className="review-step-card">
                            <div className="review-step-header">
                              <span className="step-badge">Paso {index + 1}</span>
                              <span className="step-type-badge">{step.type}</span>
                            </div>
                            <p className="review-step-prompt">{step.prompt}</p>
                            <div className="review-step-details">
                              <span><strong>Respuesta:</strong> {step.target}</span>
                              {step.hint && <span><strong>Pista:</strong> {step.hint}</span>}
                              <span><strong>Intentos:</strong> {step.max_attempts}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <div className="footer-navigation">
                {currentPage > 1 && (
                  <button 
                    className="btn btn-outline"
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ChevronLeft size={18} />
                    Anterior
                  </button>
                )}

                <div className="footer-spacer"></div>

                {currentPage < 3 ? (
                  <button 
                    className="btn btn-primary"
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Siguiente
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button 
                    className="btn btn-success"
                    onClick={handleCreateLesson}
                  >
                    <Save size={18} />
                    Crear Lección
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de asignación a clase */}
      {showAssignModal && selectedLesson && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <Users size={24} />
                Asignar Lección a Clase
              </h2>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="assign-lesson-info">
                <h3>{selectedLesson.title}</h3>
                <p>{selectedLesson.description}</p>
              </div>

              <div className="classes-list">
                <h4>Selecciona una clase:</h4>
                {classes.length === 0 ? (
                  <p className="no-classes">No tienes clases asignadas</p>
                ) : (
                  classes.map((classData) => (
                    <div 
                      key={classData.id} 
                      className="class-item"
                      onClick={() => handleConfirmAssign(classData.id)}
                    >
                      <div className="class-item-info">
                        <h5>{classData.name}</h5>
                        <p>{classData.student_count} estudiantes</p>
                      </div>
                      <ChevronRight size={20} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonView;
