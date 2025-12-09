import api from './api';

const appointmentService = {
  // Buscar horários disponíveis
  getAvailableSlots: async (date = null) => {
    try {
      const params = date ? { date } : {};
      const response = await api.get('/appointments/available-slots', { params });
      return response.data.slots;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao buscar horários' };
    }
  },

  // Criar novo agendamento
  create: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao criar agendamento' };
    }
  },

  // Buscar agendamentos do usuário
  getMyAppointments: async () => {
    try {
      const response = await api.get('/appointments/my-appointments');
      return response.data.appointments;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao buscar agendamentos' };
    }
  },

  // Buscar agendamento por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/appointments/${id}`);
      return response.data.appointment;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao buscar agendamento' };
    }
  },

  // Cancelar agendamento
  cancel: async (id) => {
    try {
      const response = await api.put(`/appointments/${id}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao cancelar agendamento' };
    }
  }
};

export default appointmentService;
