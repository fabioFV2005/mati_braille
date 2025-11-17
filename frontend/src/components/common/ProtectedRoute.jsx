import React from 'react';
import { Navigate } from 'react-router-dom';
import { permissionService } from '../../api';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const user = permissionService.getCurrentUser();
  const token = localStorage.getItem('authToken');

  // Verificar si está autenticado
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar rol si se requiere uno específico
  if (requiredRole && !permissionService.hasPermission(requiredRole)) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
        minHeight: '100vh',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1>Acceso Denegado</h1>
        <p>No tienes permisos para acceder a esta página.</p>
        <p>Se requiere rol: <strong>{requiredRole}</strong></p>
        <p>Tu rol actual: <strong>{user.role}</strong></p>
        <a 
          href="/dashboard" 
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px'
          }}
        >
          Volver al Dashboard
        </a>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;