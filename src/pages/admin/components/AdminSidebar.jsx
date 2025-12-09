import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Scissors, 
  Clock, 
  Users, 
  LogOut,
  X
} from 'lucide-react';
import authService from '../../../services/authService';

export default function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/appointments', icon: Calendar, label: 'Agendamentos' },
    { path: '/admin/services', icon: Scissors, label: 'Serviços' },
    { path: '/admin/time-slots', icon: Clock, label: 'Horários' },
    { path: '/admin/clients', icon: Users, label: 'Clientes' },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div 
          className="admin-sidebar-overlay show" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-brand">
            <div className="admin-brand-icon">💅</div>
            <div className="admin-brand-text">
              <h2>Vitoria Nails</h2>
              <span>Painel Admin</span>
            </div>
          </div>
          
          {/* Botão fechar (mobile) */}
          <button className="admin-modal-close" onClick={onClose} style={{ display: isOpen ? 'flex' : 'none' }}>
            <X size={20} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section">
            <span className="admin-nav-section-title">Menu</span>
            
            {menuItems.map((item) => (
              <button
                key={item.path}
                className={`admin-nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}