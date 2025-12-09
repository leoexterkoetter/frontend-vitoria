import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, XCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';
import './MyAppointments.css';

function MyAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const userName = localStorage.getItem('userName') || 'Cliente';

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/appointments/my-appointments');
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Erro:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Deseja cancelar este agendamento?')) return;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      fetchAppointments();
      alert('Agendamento cancelado com sucesso!');
    } catch {
      alert('Erro ao cancelar agendamento');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      confirmed: '#4CAF50',
      cancelled: '#DC2626',
      completed: '#2563EB'
    };
    return colors[status] || '#6B7280';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      cancelled: 'Cancelado',
      completed: 'Concluido'
    };
    return texts[status] || status;
  };

const formatDate = (dateString) => {
  if (!dateString) return '';
  // Extrai apenas YYYY-MM-DD se vier no formato ISO
  const dateOnly = dateString.split('T')[0];
  const date = new Date(dateOnly + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  });
};

  return (
    <div className="my-appointments-page">
      <main className="appointments-content">
        <header className="page-header">
          <div>
            <h1>Meus Agendamentos</h1>
            <p>Ola, {userName}! Aqui estao seus agendamentos.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/services')}>
            <Calendar size={18} /> Novo Agendamento
          </button>
        </header>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <Calendar size={64} />
            <h3>Nenhum agendamento encontrado</h3>
            <p>Que tal agendar seu primeiro atendimento?</p>
            <button className="btn-primary" onClick={() => navigate('/services')}>
              Agendar Agora
            </button>
          </div>
        ) : (
          <div className="appointments-grid">
            {appointments.map(apt => (
              <div key={apt._id} className="appointment-card">
                <div className="card-header">
                  <div className="service-name">{apt.service?.name}</div>
                  <span 
                    className="status-badge"
                    style={{ 
                      background: `${getStatusColor(apt.status)}20`, 
                      color: getStatusColor(apt.status) 
                    }}
                  >
                    {getStatusText(apt.status)}
                  </span>
                </div>

                <div className="card-body">
                  <div className="info-item">
                    <Calendar size={16} /> 
                    <span>{formatDate(apt.timeSlot?.date)}</span>
                  </div>
                  <div className="info-item">
                    <Clock size={16} /> 
                    <span>{apt.timeSlot?.start_time?.substring(0, 5)}</span>
                  </div>
                  <div className="info-item price">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(apt.service?.price || 0)}
                  </div>
                </div>

                <div className="card-footer">
                  {(apt.status === 'pending' || apt.status === 'confirmed') ? (
                    <button className="btn-cancel" onClick={() => handleCancel(apt._id)}>
                      <XCircle size={16} /> Cancelar
                    </button>
                  ) : apt.status === 'completed' ? (
                    <div className="completed-badge">
                      <CheckCircle size={16} /> Atendimento realizado
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyAppointments;
