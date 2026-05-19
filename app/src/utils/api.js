// utils/api.js
class ApiClient {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Добавляем токен авторизации если есть
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Если токен истёк, выходим
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/auth';
        throw new Error('Session expired');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Методы для удобства
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export default new ApiClient();