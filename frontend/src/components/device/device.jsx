import React, { useState, useEffect } from 'react';
import { deviceService } from '../../services/api';
import './device.css';

const Devices = () => {
  const [puntosEstado, setPuntosEstado] = useState([false, false, false, false, false, false]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Verificando conexión...');
  const [activePoints, setActivePoints] = useState('Cargando...');

  const ordenVisual = [0, 3, 1, 4, 2, 5];

  useEffect(() => {
    initInterface();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      const data = await deviceService.getDeviceStatus();
      if (data.conectado) {
        setConnectionStatus(`Conectado - ${data.tiempo_respuesta_ms}ms`);
        setIsConnected(true);
        return true;
      } else {
        setConnectionStatus(`Desconectado - ${data.error || 'Error de conexión'}`);
        setIsConnected(false);
        return false;
      }
    } catch (error) {
      setConnectionStatus('Error verificando conexión');
      setIsConnected(false);
      return false;
    }
  };

  const initInterface = async () => {
    setIsLoading(true);
    const connected = await checkConnection();
    
    if (connected) {
      await loadEstado();
      updateStatusDisplay();
      setIsLoading(false);
    } else {
      showError("No se pudo conectar con el dispositivo ESP32. Verifica que el dispositivo esté encendido y en la misma red.");
      setIsLoading(false);
    }
  };

  const loadEstado = async () => {
    try {
      const data = await deviceService.getEstado();
      if (data.estados) {
        setPuntosEstado(data.estados);
      } else if (data.error) {
        showError(data.error);
      }
    } catch (error) {
      console.error("Error cargando estado:", error);
    }
  };

  const togglePunto = async (punto) => {
    if (!isConnected) {
      showError("No hay conexión con el dispositivo");
      return;
    }

    try {
      const data = await deviceService.togglePunto(punto);
      if (data.error) {
        showError(data.error);
        return;
      }
      
      const newPuntosEstado = [...puntosEstado];
      newPuntosEstado[punto] = data.estado;
      setPuntosEstado(newPuntosEstado);
      updateStatusDisplay();
      
      console.log(`Punto ${punto + 1} toggleado: ${data.estado}`);
    } catch (error) {
      showError('Error al toggle punto: ' + error.message);
    }
  };

  const sendLetter = async () => {
    if (!isConnected) {
      showError("No hay conexión con el dispositivo");
      return;
    }

    const input = document.getElementById('letterInput');
    const letra = input.value.trim().toUpperCase();
    
    if (!letra || !/^[A-Z]$/.test(letra)) {
      alert('Por favor ingresa una letra válida (A-Z)');
      return;
    }

    try {
      const data = await deviceService.sendLetter(letra);
      if (data.error) {
        showError(data.error);
        return;
      }
      
      if (data.estados) {
        setPuntosEstado(data.estados);
      }
      
      updateStatusDisplay();
      input.value = '';
      
      showSuccess(`Letra ${letra} enviada correctamente al dispositivo`);
      
    } catch (error) {
      showError('Error al enviar la letra: ' + error.message);
    }
  };

  const clearAllPoints = async () => {
    if (!isConnected) {
      showError("No hay conexión con el dispositivo");
      return;
    }

    try {
      const data = await deviceService.clearPoints();
      if (data.estados) {
        setPuntosEstado(data.estados);
      }
      
      updateStatusDisplay();
      showSuccess('Todos los puntos han sido limpiados');
      
    } catch (error) {
      showError('Error al limpiar puntos: ' + error.message);
    }
  };

  const updateStatusDisplay = () => {
    const activePointsArray = puntosEstado.map((estado, idx) => estado ? idx + 1 : null)
                                     .filter(x => x !== null);
    
    if (activePointsArray.length > 0) {
      setActivePoints(`Puntos activos: ${activePointsArray.join(', ')}`);
    } else {
      setActivePoints('Puntos activos: Ninguno');
    }
  };

  const refreshStatus = async () => {
    setIsLoading(true);
    const connected = await checkConnection();
    
    if (connected) {
      await loadEstado();
      updateStatusDisplay();
      showSuccess('Estado actualizado correctamente');
    } else {
      showError('No se pudo conectar con el dispositivo');
    }
    setIsLoading(false);
  };

  const showError = (message) => {
    alert(`❌ ${message}`);
  };

  const showSuccess = (message) => {
    alert(`✅ ${message}`);
  };

  // Efecto para actualizar el display de estado cuando cambia puntosEstado
  useEffect(() => {
    updateStatusDisplay();
  }, [puntosEstado]);

  // Manejadores de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '1' && e.key <= '6') {
        e.preventDefault();
        const punto = parseInt(e.key) - 1;
        togglePunto(punto);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        sendLetter();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        clearAllPoints();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        refreshStatus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isConnected, puntosEstado]);

  if (isLoading) {
    return (
      <div className="devices-container">
        <div className="loading-screen">
          <h2>🔄 Conectando con el dispositivo Braille...</h2>
          <p>Por favor espera mientras establecemos conexión</p>
        </div>
      </div>
    );
  }

  return (
    <div className="devices-container">
      <header>
        <h1>🎮 Control de Dispositivos Braille</h1>
        <p className="subtitle">Control remoto para ESP32 Braille conectado</p>
      </header>

      <div className="status-panel">
        <h3>Estado de Conexión</h3>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <span>{isConnected ? '🟢' : '🔴'} {connectionStatus}</span>
        </div>
        <div className="active-points" style={{ 
          background: activePoints.includes('Ninguno') 
            ? 'rgba(220, 53, 69, 0.2)' 
            : 'rgba(40, 167, 69, 0.2)' 
        }}>
          {activePoints}
        </div>
        <div className="input-group">
          <button className="btn btn-success" onClick={clearAllPoints} disabled={!isConnected}>
            🗑️ Limpiar Todo
          </button>
          <button className="btn btn-primary" onClick={refreshStatus}>
            🔄 Actualizar Estado
          </button>
        </div>
      </div>

      <div className="control-panel">
        <h2>Control de puntos Braille</h2>
        
        <div className="braille-grid">
          {ordenVisual.map((puntoIndex, displayIndex) => {
            const isActive = puntosEstado[puntoIndex];
            return (
              <button
                key={displayIndex}
                className={`braille-btn ${isActive ? 'on' : 'off'}`}
                onClick={() => togglePunto(puntoIndex)}
                disabled={!isConnected}
              >
                Punto {puntoIndex + 1}
              </button>
            );
          })}
        </div>

        <div className="form-section">
          <h3>Enviar Letra</h3>
          <div className="input-group">
            <input 
              type="text" 
              id="letterInput" 
              maxLength="1" 
              placeholder="A"
              onKeyUp={(e) => { e.target.value = e.target.value.toUpperCase(); }}
              disabled={!isConnected}
            />
            <button className="btn btn-primary" onClick={sendLetter} disabled={!isConnected}>
              📤 Enviar Letra
            </button>
          </div>
          <p style={{ marginTop: '10px', color: '#666', fontSize: '0.9em' }}>
            Ingresa una letra de la A a la Z
          </p>
        </div>

        {!isConnected && (
          <div className="connection-help" style={{
            background: 'rgba(255, 193, 7, 0.2)',
            padding: '15px',
            borderRadius: '10px',
            margin: '20px 0',
            border: '1px solid #ffc107'
          }}>
            <h4>⚠️ Problemas de conexión</h4>
            <p>Verifica que:</p>
            <ul style={{ textAlign: 'left', display: 'inline-block', color: '#666' }}>
              <li>El dispositivo ESP32 esté encendido</li>
              <li>Estés conectado a la misma red WiFi</li>
              <li>La IP del dispositivo sea: 192.168.4.1</li>
              <li>El servidor Flask esté ejecutándose en puerto 5004</li>
            </ul>
          </div>
        )}

        <a href="/dashboard" className="btn btn-back">
          ← Volver al Dashboard
        </a>
      </div>

      <footer>
        <p>Sistema de Aprendizaje Braille - Control de Dispositivos © 2025</p>
        <p>Conectado a: <span>192.168.4.1</span></p>
      </footer>
    </div>
  );
};

export default Devices;