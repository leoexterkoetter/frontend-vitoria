import { Home, CalendarDays, CalendarCheck, User, LogOut, LogIn } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  const handleLogout = () => {
    authService.logout();
    navigate('/home');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="user-nav">
      <div className="nav-links">
        {/* Home */}
        <button
          className={`nav-link ${isActive('/home') ? 'active' : ''}`}
          onClick={() => navigate('/home')}
        >
          <Home />
          <span>Início</span>
        </button>

        {/* Agendar */}
        <button
          className={`nav-link ${isActive('/services') || isActive('/booking') ? 'active' : ''}`}
          onClick={() => navigate('/services')}
        >
          <CalendarDays />
          <span>Agendar</span>
        </button>

        {/* Meus Agendamentos - só aparece se logado */}
        {isAuthenticated && (
          <button
            className={`nav-link ${isActive('/my-appointments') ? 'active' : ''}`}
            onClick={() => navigate('/my-appointments')}
          >
            <CalendarCheck />
            <span>Agendados</span>
          </button>
        )}

        {/* Login ou Logout */}
        {isAuthenticated ? (
          <button className="nav-link logout" onClick={handleLogout}>
            <LogOut />
            <span>Sair</span>
          </button>
        ) : (
          <button 
            className={`nav-link ${isActive('/login') ? 'active' : ''}`}
            onClick={() => navigate('/login')}
          >
            <LogIn />
            <span>Entrar</span>
          </button>
        )}
      </div>
    </nav>
  );
}
