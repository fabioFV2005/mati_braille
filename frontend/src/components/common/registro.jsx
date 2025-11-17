import React, { useState, useEffect } from "react";
import { Eye, EyeOff, User, Mail, Lock, Scale, ArrowLeft, Wifi, WifiOff } from "lucide-react";
import { authService, checkBackendConnection } from "../../services/api";
import "./registro.css"

const Register = ({ onSwitchToLogin, onContinue }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [backendOnline, setBackendOnline] = useState(null);
  
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    password: "",
    role: "student"
  });

  useEffect(() => {
    const checkConnection = async () => {
      const isOnline = await checkBackendConnection();
      setBackendOnline(isOnline);
    };
    
    checkConnection();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (backendOnline === false) {
      setError("El servidor no está disponible. Verifica que el backend esté ejecutándose");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }

    try {
      const userDataForBackend = {
        username: formData.username,
        full_name: formData.full_name,
        password: formData.password,
        role: formData.role
      };

      await authService.register(userDataForBackend);
      
      setSuccess(true);
      setError("");
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      
    } catch (error) {
      if (error.message.includes("ya registrado") || error.message.includes("already exists")) {
        setError("Este nombre de usuario ya está registrado. Intenta con otro.");
      } else {
        setError(error.message || "Error al crear la cuenta. Intenta nuevamente.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        
        <button onClick={() => window.location.href = '/login'} className="register-back-btn" title="Volver al login">
          <ArrowLeft size={20} />
        </button>

        <div className="register-header">
        
          <h1 className="register-title">Crear cuenta</h1>
          <p className="register-subtitle">
            Completa el formulario para registrarte
          </p>
        </div>

        {backendOnline !== null && (
          <div className={`status-indicator ${backendOnline ? 'online' : 'offline'}`}>
            {backendOnline ? (
              <>
                <Wifi size={16} />
                <span>Conectado al servidor</span>
              </>
            ) : (
              <>
                <WifiOff size={16} />
                <span>Servidor no disponible</span>
              </>
            )}
          </div>
        )}

        {success && (
          <div className="success-message">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>¡Cuenta creada exitosamente! Redirigiendo al login...</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            <Lock size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          
          <div className="form-group">
            <label>Nombre completo</label>
            <div className="input-container">
              <User size={20} />
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Tu nombre completo"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Nombre de usuario</label>
            <div className="input-container">
              <User size={20} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="tu_usuario"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="input-container">
              <Lock size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                minLength="8"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Rol</label>
            <div className="input-container">
              <User size={20} />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="student">Estudiante</option>
                <option value="teacher">Profesor</option>
                <option value="admin">Administrador</option>
              </select>
              <div className="select-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={loading || backendOnline === false}
          >
            {loading ? (
              <>
                <svg className="spinner" width="20" height="20" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                  <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Creando cuenta...
              </>
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>

        <div className="register-footer">
          <span>Al crear la cuenta aceptas nuestros </span>
          <a href="#" className="terms-link">términos y condiciones</a>
        </div>

        <div className="security-note">
          <Lock size={16} />
          <span>Tus datos están protegidos y seguros</span>
        </div>

      </div>
    </div>
  );
};

export default Register;