/**
 * Servicio modular para gestión de administración
 * Centraliza todas las llamadas API relacionadas con funciones de admin
 */

const API_BASE_URL = 'http://localhost:5000';

/**
 * Wrapper para manejar respuestas y errores de fetch
 */
async function handleResponse(response) {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
  }
  
  return data;
}

/**
 * Wrapper para hacer peticiones fetch con configuración común
 */
async function fetchAPI(endpoint, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options
  });

  return handleResponse(response);
}

// ===========================
// GESTIÓN DE LECCIONES/CLASES
// ===========================

export const classesAPI = {
  /**
   * Obtener todas las lecciones/clases con profesores y estudiantes
   */
  getAll: async () => {
    const data = await fetchAPI('/admin');
    return {
      classes: data.classes || [],
      teachers: data.teachers || [],
      students: data.students || []
    };
  },

  /**
   * Crear una nueva clase/lección
   * @param {string} name - Nombre de la clase
   * @param {number|null} teacherId - ID del profesor asignado (opcional)
   */
  create: async (name, teacherId = null) => {
    return fetchAPI('/admin/create_class', {
      method: 'POST',
      body: JSON.stringify({
        name,
        teacher_id: teacherId
      })
    });
  },

  /**
   * Asignar o reasignar un profesor a una clase
   * @param {number} classId - ID de la clase
   * @param {number|null} teacherId - ID del profesor (null para desasignar)
   */
  assignTeacher: async (classId, teacherId) => {
    return fetchAPI('/admin/assign_teacher', {
      method: 'POST',
      body: JSON.stringify({
        class_id: classId,
        teacher_id: teacherId
      })
    });
  },

  /**
   * Eliminar una clase/lección
   * @param {number} classId - ID de la clase a eliminar
   */
  delete: async (classId) => {
    return fetchAPI('/admin/delete_class', {
      method: 'POST',
      body: JSON.stringify({
        class_id: classId
      })
    });
  },

  /**
   * Obtener detalles de una clase específica
   * @param {number} classId - ID de la clase
   */
  getDetails: async (classId) => {
    return fetchAPI(`/admin/get_class_details/${classId}`);
  },

  /**
   * Agregar estudiantes a una clase
   * @param {number} classId - ID de la clase
   * @param {number[]} studentIds - Array de IDs de estudiantes
   */
  addStudents: async (classId, studentIds) => {
    return fetchAPI('/admin/add_students_to_class', {
      method: 'POST',
      body: JSON.stringify({
        class_id: classId,
        student_ids: studentIds
      })
    });
  }
};

// ===========================
// GESTIÓN DE USUARIOS
// ===========================

export const usersAPI = {
  /**
   * Obtener todos los usuarios filtrados por rol
   * @param {string} role - 'teacher', 'student', o 'admin'
   */
  getByRole: async (role) => {
    const data = await fetchAPI('/admin');
    if (role === 'teacher') return data.teachers || [];
    if (role === 'student') return data.students || [];
    return data.users || [];
  },

  /**
   * Crear un nuevo usuario (estudiante, profesor o admin)
   * @param {Object} userData - Datos del usuario
   */
  create: async (userData) => {
    return fetchAPI('/admin/create_user', {
      method: 'POST',
      body: JSON.stringify({
        username: userData.username,
        full_name: userData.full_name,
        role: userData.role || 'student',
        password: userData.password,
        email: userData.email || null,
        ci: userData.ci || null,
        active: userData.active !== undefined ? userData.active : 1
      })
    });
  },

  /**
   * Actualizar un usuario existente
   * @param {number} userId - ID del usuario
   * @param {Object} userData - Datos actualizados
   */
  update: async (userId, userData) => {
    return fetchAPI('/admin/update_user', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        username: userData.username,
        full_name: userData.full_name,
        email: userData.email || null,
        password: userData.password || null,
        active: userData.active
      })
    });
  },

  /**
   * Eliminar un usuario
   * @param {number} userId - ID del usuario a eliminar
   */
  delete: async (userId) => {
    return fetchAPI('/admin/delete_user', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId
      })
    });
  },

  /**
   * Importar estudiantes desde CSV
   * @param {File} csvFile - Archivo CSV con datos de estudiantes
   */
  importStudents: async (csvFile) => {
    const formData = new FormData();
    formData.append('csv_file', csvFile);

    const response = await fetch(`${API_BASE_URL}/admin/import_students`, {
      method: 'POST',
      body: formData
    });

    return handleResponse(response);
  }
};

// ===========================
// GESTIÓN DE DISPOSITIVOS
// ===========================

export const devicesAPI = {
  /**
   * Crear/registrar un nuevo dispositivo
   * @param {string} deviceId - ID único del dispositivo
   * @param {string} name - Nombre descriptivo del dispositivo
   */
  create: async (deviceId, name) => {
    return fetchAPI('/admin/create_device', {
      method: 'POST',
      body: JSON.stringify({
        device_id: deviceId,
        name: name || deviceId
      })
    });
  },

  /**
   * Obtener todos los dispositivos
   */
  getAll: async () => {
    const data = await fetchAPI('/admin');
    return data.devices || [];
  }
};

// ===========================
// UTILIDADES
// ===========================

/**
 * Mapear datos de clase del backend al formato del frontend
 */
export function mapClassToLesson(cls) {
  return {
    id: cls.id,
    title: cls.name,
    description: '',
    teacher_id: cls.teacher_id,
    teacher_name: cls.teacher_name,
    difficulty: 'beginner',
    materials_count: 0,
    students_count: cls.students_count || 0
  };
}

/**
 * Validar nombre de clase
 */
export function validateClassName(name) {
  if (!name || name.trim().length === 0) {
    throw new Error('El nombre de la clase es requerido');
  }
  if (name.trim().length < 3) {
    throw new Error('El nombre debe tener al menos 3 caracteres');
  }
  return true;
}

export default {
  classes: classesAPI,
  users: usersAPI,
  devices: devicesAPI,
  utils: {
    mapClassToLesson,
    validateClassName
  }
};
