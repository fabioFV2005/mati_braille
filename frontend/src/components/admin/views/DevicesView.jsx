import React, { useState, useEffect } from 'react';
import { Monitor, Wifi, WifiOff, Activity } from 'lucide-react';
import './DevicesView.css';

const DevicesView = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      // TODO: Implementar llamada al backend
      // const response = await fetch('http://localhost:5000/api/devices');
      // const data = await response.json();
      // setDevices(data);
      setDevices([]); // Placeholder
    } catch (error) {
      console.error('Error loading devices:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="devices-view">
      <div className="view-header">
        <div className="header-content">
          <h1 className="view-title">
            <Monitor className="title-icon" />
            Gestión de Dispositivos Braille
          </h1>
          <p className="view-subtitle">
            Monitorear y administrar dispositivos conectados
          </p>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando dispositivos...</p>
        </div>
      ) : devices.length === 0 ? (
        <div className="empty-state">
          <Monitor size={64} className="empty-icon" />
          <h3>No hay dispositivos conectados</h3>
          <p>Los dispositivos Braille aparecerán aquí cuando se conecten al sistema</p>
        </div>
      ) : (
        <div className="devices-grid">
          {devices.map((device) => (
            <div key={device.id} className="device-card">
              <div className="device-icon">
                <Monitor size={32} />
              </div>
              <div className="device-info">
                <h3 className="device-name">{device.name || `Dispositivo ${device.id}`}</h3>
                <p className="device-id">ID: {device.id}</p>
                <div className="device-status">
                  {device.connected ? (
                    <>
                      <Wifi size={16} className="status-icon connected" />
                      <span className="status-text connected">Conectado</span>
                    </>
                  ) : (
                    <>
                      <WifiOff size={16} className="status-icon disconnected" />
                      <span className="status-text disconnected">Desconectado</span>
                    </>
                  )}
                </div>
                {device.last_activity && (
                  <div className="device-activity">
                    <Activity size={14} />
                    <span>Última actividad: {new Date(device.last_activity).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DevicesView;
