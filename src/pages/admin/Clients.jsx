import { useEffect, useState } from 'react';
import { 
  Users,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import api from '../../services/api';
import AdminSidebar from './components/AdminSidebar';
import AdminMobileHeader from './components/AdminMobileHeader';
import './AdminStyles.css';

export default function Clients() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/admin/clients');
      setClients(response.data.clients || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="admin-layout">
      <AdminMobileHeader onMenuClick={() => setSidebarOpen(true)} />
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="admin-main">
        <div className="admin-page-header">
          <h1>Clientes</h1>
          <p>Lista de todos os clientes cadastrados</p>
        </div>

        <div className="admin-content-card">
          {loading ? (
            <div className="admin-loading-state">
              <div className="admin-spinner"></div>
              <p>Carregando clientes...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="admin-empty-state">
              <Users size={48} />
              <h3>Nenhum cliente cadastrado</h3>
              <p>Os clientes aparecerão aqui após se cadastrarem</p>
            </div>
          ) : (
            <div className="admin-clients-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Contato</th>
                    <th>Cadastrado em</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client._id}>
                      <td>
                        <div className="admin-client-cell">
                          <div className="admin-client-avatar">
                            {client.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="admin-client-name">{client.name}</div>
                        </div>
                      </td>
                      <td>
                        <div className="admin-contact-info">
                          <span className="admin-contact-item">
                            <Mail size={14} />
                            {client.email}
                          </span>
                          {client.phone && (
                            <span className="admin-contact-item">
                              <Phone size={14} />
                              {client.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="admin-date-item">
                          <Calendar size={14} />
                          {formatDate(client.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}