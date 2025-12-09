import { Link, useNavigate } from 'react-router-dom';
import { Calendar, CalendarCheck, Sparkles, Star, LogIn } from 'lucide-react';
import authService from '../services/authService';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  return (
    <div className="home-container home-clean">
      {/* Hero Section - Única seção visível */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Bem-vinda ao Vitória Nail Designer</span>
          </div>
          <h1 className="hero-title">
            Suas unhas merecem o melhor cuidado
          </h1>
          <p className="hero-subtitle">
            Agende seu horário de forma rápida e fácil. Escolha o serviço perfeito para você!
          </p>
          <div className="hero-buttons">
            <Link to="/services" className="btn btn-primary">
              <Calendar size={20} />
              Agendar Agora
            </Link>
            {isAuthenticated ? (
              <Link to="/my-appointments" className="btn btn-secondary">
                <CalendarCheck size={20} />
                Meus Agendamentos
              </Link>
            ) : (
              <Link to="/services" className="btn btn-secondary">
                <Star size={20} />
                Ver Serviços
              </Link>
            )}
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-image-placeholder">
            <Star size={80} />
          </div>
        </div>
      </section>

      {/* Botão de login discreto no rodapé */}
      {!isAuthenticated && (
        <div className="home-footer-login">
          <button 
            className="login-link-discrete"
            onClick={() => navigate('/login')}
          >
            <LogIn size={16} />
            <span>Área do Cliente / Admin</span>
          </button>
        </div>
      )}
    </div>
  );
}
