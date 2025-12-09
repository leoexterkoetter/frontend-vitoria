import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Clock,
  TrendingUp,
  ArrowRight,
  CreditCard
} from 'lucide-react';
import api from '../../services/api';
import AdminSidebar from './components/AdminSidebar';
import AdminMobileHeader from './components/AdminMobileHeader';
import './AdminStyles.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    totalClients: 0,
    monthRevenue: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, appointmentsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/appointments?limit=5')
      ]);

      setStats(statsRes.data);
      setRecentAppointments(appointmentsRes.data.appointments || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const dateOnly = dateString.split('T')[0];
      return new Date(dateOnly + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short'
      });
    } catch {
      return '-';
    }
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

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      cancelled: 'Cancelado',
      completed: 'Concluído'
    };
    return texts[status] || status;
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

  return (
    <div className="admin-layout">
      <AdminMobileHeader 
        onMenuClick={() => setSidebarOpen(true)} 
        pendingCount={stats.pendingAppointments}
      />
      
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <main className="admin-main">
        <div className="admin-page-header">
          <h1>Dashboard</h1>
          <p>Visão geral do seu negócio</p>
        </div>

        {/* Stats Cards */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-card-header">
              <div className="admin-stat-icon pink">
                <Calendar size={24} />
              </div>
              <span className="admin-stat-trend up">
                <TrendingUp size={12} />
                12%
              </span>
            </div>
            <div className="admin-stat-value">{stats.totalAppointments}</div>
            <div className="admin-stat-label">Total de Agendamentos</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-card-header">
              <div className="admin-stat-icon orange">
                <Clock size={24} />
              </div>
            </div>
            <div className="admin-stat-value">{stats.pendingAppointments}</div>
            <div className="admin-stat-label">Pendentes</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-card-header">
              <div className="admin-stat-icon blue">
                <Users size={24} />
              </div>
              <span className="admin-stat-trend up">
                <TrendingUp size={12} />
                8%
              </span>
            </div>
            <div className="admin-stat-value">{stats.totalClients}</div>
            <div className="admin-stat-label">Clientes Cadastrados</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-card-header">
              <div className="admin-stat-icon green">
                <DollarSign size={24} />
              </div>
              <span className="admin-stat-trend up">
                <TrendingUp size={12} />
                23%
              </span>
            </div>
            <div className="admin-stat-value">{formatCurrency(stats.monthRevenue)}</div>
            <div className="admin-stat-label">Receita do Mês</div>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="admin-content-card">
          <div className="admin-card-header">
            <h2>Agendamentos Recentes</h2>
            <button 
              className="admin-btn admin-btn-outline admin-btn-sm"
              onClick={() => navigate('/admin/appointments')}
            >
              Ver Todos
              <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="admin-loading-state">
              <div className="admin-spinner"></div>
              <p>Carregando...</p>
            </div>
          ) : recentAppointments.length === 0 ? (
            <div className="admin-empty-state">
              <Calendar size={48} />
              <h3>Nenhum agendamento</h3>
              <p>Os agendamentos aparecerão aqui</p>
            </div>
          ) : (
            <div className="dashboard-appointments-list">
              {recentAppointments.map((apt) => (
                <div key={apt._id} className="dashboard-appointment-card">
                  <div className="dashboard-card-header">
                    <div className="dashboard-avatar">
                      {apt.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="dashboard-user-info">
                      <div className="dashboard-user-name">{apt.user?.name || '-'}</div>
                      <span className={`admin-status-badge ${getStatusClass(apt.status)}`}>
                        {getStatusText(apt.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="dashboard-service-name">
                    {apt.service?.name || '-'}
                  </div>

                  <div className="dashboard-meta-row">
                    <span>
                      <Calendar size={14} />
                      {formatDate(apt.timeSlot?.date)}
                    </span>
                    <span>
                      <Clock size={14} />
                      {apt.timeSlot?.start_time?.substring(0, 5) || '-'}
                    </span>
                    <span>
                      <CreditCard size={14} />
                      {getPaymentMethodText(apt.paymentMethod)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`
        .dashboard-appointments-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .dashboard-appointment-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
        }

        .dashboard-card-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .dashboard-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .dashboard-user-info {
          flex: 1;
          min-width: 0;
        }

        .dashboard-user-name {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 6px;
          word-break: break-word;
        }

        .dashboard-service-name {
          color: #64748b;
          font-size: 0.9rem;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
        }

        .dashboard-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          color: #64748b;
          font-size: 0.85rem;
        }

        .dashboard-meta-row span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dashboard-meta-row svg {
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}