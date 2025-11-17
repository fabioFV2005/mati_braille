const TEACHER_BASE_URL = 'http://localhost:5002';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const teacherService = {
  async getDashboardData() {
    const response = await fetch(`${TEACHER_BASE_URL}/api/teacher/dashboard`, {
      headers: getAuthHeaders()
    });
    
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    
    return await response.json();
  },

  async getClassStudents(classId) {
    const response = await fetch(`${TEACHER_BASE_URL}/api/teacher/class/${classId}/students`, {
      headers: getAuthHeaders()
    });
    
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch class students');
    }
    
    return await response.json();
  },

  async getStudentDetails(studentId) {
    const response = await fetch(`${TEACHER_BASE_URL}/api/teacher/student/${studentId}`, {
      headers: getAuthHeaders()
    });
    
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch student details');
    }
    
    return await response.json();
  },

  // ============= LESSONS API =============
  
  async getLessons() {
    const response = await fetch(`${TEACHER_BASE_URL}/api/teacher/lessons`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch lessons');
    }
    
    const data = await response.json();
    return data.lessons || [];
  },

  async getLessonById(lessonId) {
    const response = await fetch(`${TEACHER_BASE_URL}/api/teacher/lesson/${lessonId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch lesson ${lessonId}`);
    }
    
    return await response.json();
  },

  async createLesson(lessonData) {
    const response = await fetch(`${TEACHER_BASE_URL}/api/teacher/lessons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lessonData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error creating lesson');
    }
    
    return await response.json();
  },

  async updateLesson(lessonId, lessonData) {
    const response = await fetch(`${TEACHER_BASE_URL}/api/teacher/lesson/${lessonId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lessonData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error updating lesson');
    }
    
    return await response.json();
  },

  async deleteLesson(lessonId) {
    const response = await fetch(`${TEACHER_BASE_URL}/api/teacher/lesson/${lessonId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error deleting lesson');
    }
    
    return await response.json();
  },

  async assignLessonToClass(lessonId, classId, dueDate = null) {
    const response = await fetch(`${TEACHER_BASE_URL}/api/teacher/lesson/${lessonId}/assign-to-class`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        class_id: classId,
        due_date: dueDate,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error assigning lesson to class');
    }
    
    return await response.json();
  }
};