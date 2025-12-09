import api from './api';

const authService = {
  // Registrar novo usuário
  register: async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userName', response.data.user.name);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao registrar' };
    }
  },

  // Login
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userName', response.data.user.name);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao fazer login' };
    }
  },

  // Logout - redireciona para /home ao invés de /login
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userName');
    window.location.href = '/home';
  },

  // Obter dados do usuário atual
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao buscar usuário' };
    }
  },

  // Verificar se está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Verificar se o token não expirou (básico)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        // Token expirado, limpar storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userName');
        return false;
      }
      return true;
    } catch {
      return !!token;
    }
  },

  // Obter usuário do localStorage
  getLocalUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Verificar se é admin
  isAdmin: () => {
    const user = authService.getLocalUser();
    return user?.role === 'admin';
  },

  // Obter nome do usuário
  getUserName: () => {
    return localStorage.getItem('userName') || '';
  }
};

export default authService;
