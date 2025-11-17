import React, { useState, useEffect } from 'react';
import { authService, checkBackendConnection } from "../../services/api";
import "./login.css"

const Login = ({ onSwitchToRegister, onLoginSuccess }) => { 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendOnline, setBackendOnline] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      const isOnline = await checkBackendConnection();
      setBackendOnline(isOnline);
    };
    
    checkConnection();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!username || !password) {
      setError('Por favor ingresa tu nombre de usuario y contraseña');
      setLoading(false);
      return;
    }

    try {
      const credentials = { username, password };
      const response = await authService.login(credentials);
      
      if (response.access_token) {
        localStorage.setItem('authToken', response.access_token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        throw new Error('No se recibió token de autenticación');
      }

    } catch (error) {
      setError(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <h1>Iniciar Sesión</h1>
          <p>Accede a tu cuenta</p>
        </div>

        {/* Status Indicators */}
        {backendOnline !== null && (
          <div className={`status-indicator ${backendOnline ? 'online' : 'offline'}`}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              {backendOnline ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              )}
            </svg>
            <span>{backendOnline ? 'Servidor conectado' : 'Servidor no disponible'}</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <div className="input-container">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-container">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || backendOnline === false}
            className="login-button"
          >
            {loading ? (
              <>
                <svg className="spinner" width="20" height="20" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                  <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="login-footer">
          <span>¿No tienes cuenta?</span>
          <button onClick={() => window.location.href = '/registro'}>
            Crear cuenta
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;