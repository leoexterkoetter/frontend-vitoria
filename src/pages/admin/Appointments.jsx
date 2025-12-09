import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Check, 
  X, 
  Trash2,
  RefreshCw,
  CreditCard
} from 'lucide-react';
import api from '../../services/api';
import AdminSidebar from './components/AdminSidebar';
import AdminMobileHeader from './components/AdminMobileHeader';
import './AdminStyles.css';

function Appointments() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Estados para remanejamento
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedNewSlot, setSelectedNewSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/appointments');
      
      let appointmentsData = [];
      
      if (Array.isArray(response.data)) {
        appointmentsData = response.data;
      } else if (response.data && Array.isArray(response.data.appointments)) {
        appointmentsData = response.data.appointments;
      }
      
      setAppointments(appointmentsData);
      
    } catch (err) {
      console.error('❌ Erro ao carregar:', err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/admin/appointments/${id}/status`, { status: newStatus });
      fetchAppointments();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao atualizar status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este agendamento?')) return;

    try {
      await api.delete(`/appointments/${id}`);
      alert('Excluído com sucesso!');
      fetchAppointments();
    } catch (err) {
      console.error('Erro ao excluir:', err);
      alert('Erro ao excluir: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleOpenReschedule = async (appointment) => {
    setSelectedAppointment(appointment);
    setIsRescheduleModalOpen(true);
    setLoadingSlots(true);
    setAvailableSlots([]);
    setSelectedNewSlot(null);

    try {
      const serviceId = appointment.service?._id || appointment.service;

      if (!serviceId) {
        throw new Error('ID do serviço não encontrado');
      }

      const response = await api.get('/appointments/available-slots', {
        params: { serviceId }
      });

      let slots = Array.isArray(response.data) ? response.data : 
                  (response.data.slots || response.data.data || []);

      const currentSlotId = appointment.timeSlot?._id || appointment.timeSlot;
      const filteredSlots = slots.filter(slot => (slot._id || slot.id) !== currentSlotId);

      setAvailableSlots(filteredSlots);

    } catch (err) {
      console.error('❌ Erro ao buscar slots:', err);
      alert('Erro ao buscar horários: ' + (err.response?.data?.error || err.message));
      setIsRescheduleModalOpen(false);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!selectedNewSlot) {
      alert('Selecione um novo horário');
      return;
    }

    try {
      const appointmentId = selectedAppointment._id || selectedAppointment.id;
      const newTimeSlotId = selectedNewSlot._id || selectedNewSlot.id;

      await api.patch(`/appointments/${appointmentId}/reschedule`, { newTimeSlotId });

      alert('Remanejado com sucesso!');
      setIsRescheduleModalOpen(false);
      setSelectedAppointment(null);
      setSelectedNewSlot(null);
      fetchAppointments();

    } catch (err) {
      console.error('❌ Erro ao remanejar:', err);
      alert('Erro ao remanejar: ' + (err.response?.data?.error || err.message));
    }
  };

  const groupSlotsByDate = (slots) => {
    const grouped = {};
    slots.forEach(slot => {
      // Extrai apenas YYYY-MM-DD do ISO date
      const date = slot.date?.split('T')[0] || slot.date;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(slot);
    });
    return grouped;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    // Extrai apenas YYYY-MM-DD se vier no formato ISO
    const dateOnly = dateString.split('T')[0];
    const date = new Date(dateOnly + 'T00:00:00');
    if (isNaN(date.getTime())) return 'Data não disponível';
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    // Extrai apenas YYYY-MM-DD se vier no formato ISO
    const dateOnly = dateString.split('T')[0];
    const date = new Date(dateOnly + 'T00:00:00');
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.substring(0, 5);
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      cancelled: 'Cancelado',
      completed: 'Concluído'
    };
    return texts[status] || status;
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: 'admin-status-pending',
      confirmed: 'admin-status-confirmed',
      cancelled: 'admin-status-cancelled',
      completed: 'admin-status-completed'
    };
    return classes[status] || classes.pending;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const getPaymentMethodText = (method) => {
    const methods = {
      pix: 'PIX',
      dinheiro: 'Dinheiro',
      credito: 'Crédito',
      debito: 'Débito'
    };
    return methods[method] || method || '-';
  };

  const filteredAppointments = appointments.filter(apt => 
    filterStatus === 'all' || apt.status === filterStatus
  );

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminMobileHeader onMenuClick={() => setSidebarOpen(true)} />
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="admin-main">
          <div className="admin-loading-state">
            <div className="admin-spinner"></div>
            <p>Carregando agendamentos...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminMobileHeader onMenuClick={() => setSidebarOpen(true)} />
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="admin-main">
        <div className="admin-page-header">
          <h1>Gerenciar Agendamentos</h1>
          <p>Visualize e gerencie todos os agendamentos</p>
        </div>

        {/* Filtros */}
        <div className="admin-filters-bar">
          <button 
            className={`admin-filter-chip ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Todos
          </button>
          <button 
            className={`admin-filter-chip ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            Pendentes
          </button>
          <button 
            className={`admin-filter-chip ${filterStatus === 'confirmed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('confirmed')}
          >
            Confirmados
          </button>
          <button 
            className={`admin-filter-chip ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            Concluídos
          </button>
        </div>

        <div className="admin-content-card">
          {filteredAppointments.length === 0 ? (
            <div className="admin-empty-state">
              <Calendar size={48} />
              <h3>Nenhum agendamento encontrado</h3>
              <p>Os agendamentos aparecerão aqui</p>
            </div>
          ) : (
            <div className="admin-appointments-list">
              {filteredAppointments.map((appointment) => {
                if (!appointment || !appointment._id) return null;
                
                return (
                  <div key={appointment._id} className="admin-appointment-item">
                    <div className="admin-appointment-avatar">
                      {appointment.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    
                    <div className="admin-appointment-info">
                      <div className="admin-appointment-name">
                        {appointment.user?.name || 'Sem nome'}
                      </div>
                      <div className="admin-appointment-status-row">
                        <span className={`admin-status-badge ${getStatusClass(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      <div className="admin-appointment-service">
                        {appointment.service?.name || 'Sem serviço'}
                      </div>
                    </div>

                    <div className="admin-appointment-meta">
                      <span>
                        <Calendar size={14} />
                        {formatDateShort(appointment.timeSlot?.date)}
                      </span>
                      <span>
                        <Clock size={14} />
                        {formatTime(appointment.timeSlot?.start_time)}
                      </span>
                      <span>
                        <CreditCard size={14} />
                        {getPaymentMethodText(appointment.paymentMethod)}
                      </span>
                      <span>
                        {formatCurrency(appointment.service?.price)}
                      </span>
                    </div>

                    <div className="admin-appointment-actions">
                      {appointment.status === 'pending' && (
                        <>
                          <button 
                            className="admin-btn admin-btn-success admin-btn-sm"
                            onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                          >
                            <Check size={16} />
                            Confirmar
                          </button>
                          <button 
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                          >
                            <X size={16} />
                            Recusar
                          </button>
                        </>
                      )}

                      {appointment.status === 'confirmed' && (
                        <>
                          <button 
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            onClick={() => handleOpenReschedule(appointment)}
                          >
                            <RefreshCw size={16} />
                            Remanejar
                          </button>
                          <button 
                            className="admin-btn admin-btn-success admin-btn-sm"
                            onClick={() => handleStatusChange(appointment._id, 'completed')}
                          >
                            <Check size={16} />
                            Concluir
                          </button>
                        </>
                      )}

                      <button 
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => handleDelete(appointment._id)}
                      >
                        <Trash2 size={16} />
                        Excluir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal de Remanejamento */}
        {isRescheduleModalOpen && selectedAppointment && (
          <div className="admin-modal-overlay" onClick={() => setIsRescheduleModalOpen(false)}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>Remanejar Agendamento</h2>
                <button 
                  className="admin-modal-close"
                  onClick={() => setIsRescheduleModalOpen(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="admin-modal-body">
                <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--admin-slate-50)', borderRadius: 'var(--admin-radius-md)' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--admin-slate-800)' }}>Agendamento Atual</h3>
                  <p style={{ margin: '4px 0', color: 'var(--admin-slate-600)' }}><strong>Cliente:</strong> {selectedAppointment.user?.name}</p>
                  <p style={{ margin: '4px 0', color: 'var(--admin-slate-600)' }}><strong>Serviço:</strong> {selectedAppointment.service?.name}</p>
                  <p style={{ margin: '4px 0', color: 'var(--admin-slate-600)' }}>
                    <strong>Data:</strong> {formatDateShort(selectedAppointment.timeSlot?.date)}
                  </p>
                  <p style={{ margin: '4px 0', color: 'var(--admin-slate-600)' }}>
                    <strong>Horário:</strong> {formatTime(selectedAppointment.timeSlot?.start_time)} - {formatTime(selectedAppointment.timeSlot?.end_time)}
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--admin-slate-800)' }}>Selecione o Novo Horário</h3>
                  
                  {loadingSlots ? (
                    <div className="admin-loading-state">
                      <div className="admin-spinner"></div>
                      <p>Carregando horários...</p>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="admin-empty-state">
                      <p>Nenhum horário disponível</p>
                    </div>
                  ) : (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {Object.entries(groupSlotsByDate(availableSlots)).map(([date, slots]) => (
                        <div key={date} style={{ marginBottom: '24px' }}>
                          <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--admin-slate-700)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={16} />
                            {formatDate(date)}
                          </h4>
                          <div className="admin-slots-grid">
                            {slots.map(slot => (
                              <button
                                key={slot._id || slot.id}
                                type="button"
                                className={`admin-slot-card ${selectedNewSlot?._id === slot._id ? 'selected' : ''}`}
                                onClick={() => setSelectedNewSlot(slot)}
                                style={{
                                  cursor: 'pointer',
                                  border: selectedNewSlot?._id === slot._id 
                                    ? '2px solid var(--admin-pink-500)' 
                                    : '1px solid var(--admin-slate-200)',
                                  background: selectedNewSlot?._id === slot._id 
                                    ? 'var(--admin-pink-50)' 
                                    : 'white'
                                }}
                              >
                                <div className="admin-slot-time">
                                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-modal-footer">
                <button 
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setIsRescheduleModalOpen(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="admin-btn admin-btn-primary"
                  onClick={handleConfirmReschedule}
                  disabled={!selectedNewSlot || loadingSlots}
                >
                  Confirmar Remanejamento
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        /* Fix mobile layout para appointment items */
        @media (max-width: 768px) {
          .admin-appointment-item {
            flex-wrap: wrap;
            gap: 12px;
            padding: 16px;
          }
          
          .admin-appointment-info {
            flex: 1;
            min-width: 0;
          }
          
          .admin-appointment-name {
            font-size: 0.95rem;
            word-break: break-word;
          }
          
          .admin-appointment-status-row {
            margin-top: 4px;
            margin-bottom: 4px;
          }
          
          .admin-status-badge {
            font-size: 0.7rem;
            padding: 2px 8px;
          }
          
          .admin-appointment-meta {
            width: 100%;
            order: 3;
            justify-content: flex-start;
            gap: 16px;
            padding-top: 12px;
            border-top: 1px solid var(--admin-slate-100);
          }
          
          .admin-appointment-actions {
            width: 100%;
            order: 4;
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .admin-appointment-actions .admin-btn {
            flex: 1;
            min-width: 100px;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

export default Appointments;