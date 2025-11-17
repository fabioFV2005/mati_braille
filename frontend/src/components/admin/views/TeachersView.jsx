import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, Edit2, Trash2, BookOpen } from 'lucide-react';
import adminService from '../../../services/adminService';
import './TeachersView.css';

const TeachersView = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const data = await adminService.users.getByRole('teacher');
      setTeachers(data);
    } catch (error) {
      console.error('Error loading teachers:', error);
      alert(`Error al cargar docentes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Actualizar docente existente
        await adminService.users.update(editingId, {
          ...formData,
          role: 'teacher'
        });
        alert('Docente actualizado exitosamente');
      } else {
        // Crear nuevo docente
        await adminService.users.create({
          ...formData,
          role: 'teacher'
        });
        alert('Docente creado exitosamente');
      }
      
      setShowModal(false);
      resetForm();
      loadTeachers();
    } catch (error) {
      console.error('Error saving teacher:', error);
      alert(error.message || 'Error al guardar el docente');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este docente? Se eliminarán también sus asignaciones.')) {
      try {
        await adminService.users.delete(id);
        alert('Docente eliminado exitosamente');
        loadTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
        alert(error.message || 'Error al eliminar el docente');
      }
    }
  };

  const handleEdit = (teacher) => {
    setEditingId(teacher.id);
    setFormData({
      username: teacher.username,
      password: '',
      full_name: teacher.full_name,
      email: teacher.email
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ username: '', password: '', full_name: '', email: '' });
    setEditingId(null);
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="teachers-view">
      <div className="view-header">
        <div className="header-content">
          <h1 className="view-title">
            <UserCheck className="title-icon" />
            Gestión de Docentes
          </h1>
          <p className="view-subtitle">
            Administrar profesores y asignar lecciones
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
          Nuevo Docente
        </button>
      </div>

      <div className="search-container">
        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar docentes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando docentes...</p>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="empty-state">
          <UserCheck size={64} className="empty-icon" />
          <h3>No hay docentes registrados</h3>
          <p>Comienza agregando docentes al sistema</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Agregar Primer Docente
          </button>
        </div>
      ) : (
        <div className="teachers-grid">
          {filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="teacher-card">
              <div className="teacher-avatar">
                <UserCheck size={32} />
              </div>
              <div className="teacher-info">
                <h3 className="teacher-name">{teacher.full_name}</h3>
                <p className="teacher-username">@{teacher.username}</p>
                {teacher.email && (
                  <p className="teacher-email">{teacher.email}</p>
                )}
                <div className="teacher-stats">
                  <div className="stat-item">
                    <BookOpen size={16} />
                    <span>{teacher.lessons_count || 0} lecciones</span>
                  </div>
                </div>
              </div>
              <div className="teacher-actions">
                <button 
                  className="btn-icon btn-edit"
                  onClick={() => handleEdit(teacher)}
                  title="Editar"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  className="btn-icon btn-delete"
                  onClick={() => handleDelete(teacher.id)}
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
              <h2>{editingId ? 'Editar Docente' : 'Nuevo Docente'}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="full_name">Nombre Completo *</label>
                <input
                  id="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="Nombre completo del docente"
                />
              </div>
              <div className="form-group">
                <label htmlFor="username">Usuario *</label>
                <input
                  id="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="Nombre de usuario"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">
                  Contraseña {editingId && '(dejar vacío para mantener)'}
                </label>
                <input
                  id="password"
                  type="password"
                  required={!editingId}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Contraseña"
                />
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
                  {editingId ? 'Actualizar' : 'Crear'} Docente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersView;
