const API_BASE_URL = 'http://127.0.0.1:8000/api';
const DEVICES_BASE_URL = 'http://localhost:5004'; // Backend de dispositivos (Flask)

export const checkBackendConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    return response.ok;
  } catch (error) {
    console.error('Error checking backend connection:', error);
    return false;
  }
};

export const authService = {
  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al iniciar sesión');
    }

    return await response.json();
  },

  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/usuarios/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al crear la cuenta');
    }

    return await response.json();
  },

  async updatePersonalData(userId, personalData) {
    const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/datos-personales/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(personalData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al actualizar datos personales');
    }

    return await response.json();
  }
};

// Servicio para dispositivos
export const deviceService = {
  async getDeviceStatus() {
    const response = await fetch(`${DEVICES_BASE_URL}/api/device_status`);
    if (!response.ok) {
      throw new Error('Error al obtener el estado del dispositivo');
    }
    return await response.json();
  },

  async getEstado() {
    const response = await fetch(`${DEVICES_BASE_URL}/api/estado`);
    if (!response.ok) {
      throw new Error('Error al obtener el estado de los puntos');
    }
    return await response.json();
  },

  async togglePunto(punto) {
    const response = await fetch(`${DEVICES_BASE_URL}/api/toggle/${punto}`);
    if (!response.ok) {
      throw new Error('Error al togglear el punto');
    }
    return await response.json();
  },

  async sendLetter(letra) {
    const response = await fetch(`${DEVICES_BASE_URL}/api/letra`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ letra }),
    });
    if (!response.ok) {
      throw new Error('Error al enviar la letra');
    }
    return await response.json();
  },

  async clearPoints() {
    const response = await fetch(`${DEVICES_BASE_URL}/api/clear`);
    if (!response.ok) {
      throw new Error('Error al limpiar los puntos');
    }
    return await response.json();
  },
};