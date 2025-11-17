import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit2, Trash2, TrendingUp } from 'lucide-react';
import adminService from '../../../services/adminService';
import './AdminStudentsView.css';

const AdminStudentsView = () => {
  const [students, setStudents] = useState([]);
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
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await adminService.users.getByRole('student');
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
      alert(`Error al cargar estudiantes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Actualizar estudiante existente
        await adminService.users.update(editingId, {
          ...formData,
          role: 'student'
        });
        alert('Estudiante actualizado exitosamente');
      } else {
        // Crear nuevo estudiante
        await adminService.users.create({
          ...formData,
          role: 'student'
        });
        alert('Estudiante creado exitosamente');
      }
      
      setShowModal(false);
      resetForm();
      loadStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      alert(error.message || 'Error al guardar el estudiante');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este estudiante?')) {
      try {
        await adminService.users.delete(id);
        alert('Estudiante eliminado exitosamente');
        loadStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        alert(error.message || 'Error al eliminar el estudiante');
      }
    }
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setFormData({
      username: student.username,
      password: '',
      full_name: student.full_name,
      email: student.email
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ username: '', password: '', full_name: '', email: '' });
    setEditingId(null);
  };

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-students-view">
      <div className="view-header">
        <div className="header-content">
          <h1 className="view-title">
            <Users className="title-icon" />
            Gestión de Estudiantes
          </h1>
          <p className="view-subtitle">
            Administrar estudiantes del sistema
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
          Nuevo Estudiante
        </button>
      </div>

      <div className="search-container">
        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar estudiantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando estudiantes...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="empty-state">
          <Users size={64} className="empty-icon" />
          <h3>No hay estudiantes registrados</h3>
          <p>Comienza agregando estudiantes al sistema</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Agregar Primer Estudiante
          </button>
        </div>
      ) : (
        <div className="students-grid">
          {filteredStudents.map((student) => (
            <div key={student.id} className="student-card">
              <div className="student-avatar">
                <Users size={32} />
              </div>
              <div className="student-info">
                <h3 className="student-name">{student.full_name}</h3>
                <p className="student-username">@{student.username}</p>
                {student.email && (
                  <p className="student-email">{student.email}</p>
                )}
                <div className="student-stats">
                  <div className="stat-item">
                    <TrendingUp size={16} />
                    <span>{student.progress || 0}% progreso</span>
                  </div>
                </div>
              </div>
              <div className="student-actions">
                <button 
                  className="btn-icon btn-edit"
                  onClick={() => handleEdit(student)}
                  title="Editar"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  className="btn-icon btn-delete"
                  onClick={() => handleDelete(student.id)}
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
              <h2>{editingId ? 'Editar Estudiante' : 'Nuevo Estudiante'}</h2>
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
                  placeholder="Nombre completo del estudiante"
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
                  {editingId ? 'Actualizar' : 'Crear'} Estudiante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentsView;
