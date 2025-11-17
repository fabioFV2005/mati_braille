import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/common/login'
import Register from './components/common/registro' 
import Dashboard from './components/dashboard/dashboard'
import AdminDashboard from './components/admin/AdminDashboard'
import TeacherDashboard from './components/teacher/TeacherDashboardNew'
import StudentLessons from './components/student/views/StudentLessons'
import Devices from './components/device/device'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [userRole, setUserRole] = useState(null)

  // Verificar si el usuario está autenticado al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('userData')
    
    if (token && userData) {
      const user = JSON.parse(userData)
      setUserRole(user.role)
      setIsAuthenticated(true)
    }
    setIsCheckingAuth(false)
  }, [])

  // Función para manejar login exitoso
  const handleLoginSuccess = () => {
    const userData = localStorage.getItem('userData')
    if (userData) {
      const user = JSON.parse(userData)
      setUserRole(user.role)
    }
    setIsAuthenticated(true)
  }

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('userCompleteData')
    localStorage.removeItem('tempUserData')
    setIsAuthenticated(false)
    setUserRole(null)
  }

  // Componente para redirigir según el rol
  const RoleBasedRedirect = () => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />
    }
    
    switch (userRole) {
      case 'admin':
        return <Navigate to="/admin" replace />
      case 'teacher':
        return <Navigate to="/teacher" replace />
      default:
        return <Navigate to="/dashboard" replace />
    }
  }

  // Mostrar loading mientras verifica autenticación
  if (isCheckingAuth) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        <div>Verificando autenticación...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? (
                <Login onLoginSuccess={handleLoginSuccess} />
              ) : (
                <RoleBasedRedirect />
              )
            } 
          />
          <Route 
            path="/registro" 
            element={
              !isAuthenticated ? (
                <Register />
              ) : (
                <RoleBasedRedirect />
              )
            } 
          />
          <Route 
            path="/admin" 
            element={
              isAuthenticated && userRole === 'admin' ? (
                <AdminDashboard onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/teacher" 
            element={
              isAuthenticated && userRole === 'teacher' ? (
                <TeacherDashboard onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <Dashboard onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/devices" 
            element={
              isAuthenticated ? (
                <Devices />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/lessons" 
            element={
              isAuthenticated ? (
                <StudentLessons studentId={(() => {
                  try {
                    const userData = localStorage.getItem('userData');
                    if (!userData) return null;
                    const parsed = JSON.parse(userData);
                    console.log('StudentLessons - userData:', parsed);
                    return parsed?.id || null;
                  } catch (e) {
                    console.error('Error parsing userData:', e);
                    return null;
                  }
                })()} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? <RoleBasedRedirect /> : <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App