import { useEffect, useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  Scissors
} from 'lucide-react';
import api from '../../services/api';
import AdminSidebar from './components/AdminSidebar';
import AdminMobileHeader from './components/AdminMobileHeader';
import '../admin/AdminStyles.css';

export default function Services() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: 60, // valor padrão fixo
    category: 'alongamento',
    active: true
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/admin/services');
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await api.put(`/admin/services/${editingService._id}`, formData);
      } else {
        await api.post('/admin/services', formData);
      }
      setShowModal(false);
      resetForm();
      fetchServices();
    } catch (error) {
      alert('Erro ao salvar serviço');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price,
      duration: service.duration || 60,
      category: service.category,
      active: service.active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) return;
    try {
      await api.delete(`/admin/services/${id}`);
      fetchServices();
    } catch (error) {
      alert('Erro ao excluir serviço');
    }
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: 60,
      category: 'alongamento',
      active: true
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const categories = {
    alongamento: 'Alongamento',
    manutencao: 'Manutenção',
    esmaltacao: 'Esmaltação',
    spa: 'Spa'
  };

  return (
    <div className="admin-layout">
      <AdminMobileHeader onMenuClick={() => setSidebarOpen(true)} />
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="admin-main">
        <div className="admin-page-header">
          <h1>Serviços</h1>
          <p>Gerencie os serviços oferecidos no salão</p>
          <div className="admin-page-header-actions">
            <button className="admin-btn admin-btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} />
              Novo Serviço
            </button>
          </div>
        </div>

        <div className="admin-content-card">
          {loading ? (
            <div className="admin-loading-state">
              <div className="admin-spinner"></div>
              <p>Carregando serviços...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="admin-empty-state">
              <Scissors size={48} />
              <h3>Nenhum serviço cadastrado</h3>
              <p>Adicione seu primeiro serviço</p>
              <button className="admin-btn admin-btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={18} />
                Adicionar Serviço
              </button>
            </div>
          ) : (
            <div className="admin-services-grid">
              {services.map((service) => (
                <div key={service._id} className="admin-service-card">
                  <div className="admin-service-card-header">
                    <h3>{service.name}</h3>
                    <span className={`admin-service-card-badge ${service.active ? 'active' : 'inactive'}`}>
                      {service.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  
                  <p>{service.description || 'Sem descrição'}</p>
                  
                  <div className="admin-service-card-meta">
                    <span className="admin-service-price">
                      {formatCurrency(service.price)}
                    </span>
                  </div>

                  <div className="admin-service-card-actions">
                    <button 
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit2 size={14} />
                      Editar
                    </button>
                    <button 
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      onClick={() => handleDelete(service._id)}
                    >
                      <Trash2 size={14} />
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="admin-modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>{editingService ? 'Editar Serviço' : 'Novo Serviço'}</h2>
                <button className="admin-modal-close" onClick={() => { setShowModal(false); resetForm(); }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="admin-modal-body">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Nome do Serviço *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Alongamento em Gel"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Descrição</label>
                    <textarea
                      className="admin-form-textarea"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descreva o serviço..."
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Preço (R$) *</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0,00"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Categoria *</label>
                    <select
                      className="admin-form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      {Object.entries(categories).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      />
                      <span>Serviço ativo</span>
                    </label>
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button 
                    type="button" 
                    className="admin-btn admin-btn-secondary"
                    onClick={() => { setShowModal(false); resetForm(); }}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="admin-btn admin-btn-primary">
                    {editingService ? 'Salvar Alterações' : 'Criar Serviço'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}