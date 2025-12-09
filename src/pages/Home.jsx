import { Link } from 'react-router-dom';
import { Calendar, CalendarCheck, Sparkles, MessageCircle, Instagram, MapPin } from 'lucide-react';
import authService from '../services/authService';
import './Home.css';

export default function Home() {
  const isAuthenticated = authService.isAuthenticated();

  return (
    <div className="home-container home-clean">
      {/* Hero Section - Única seção visível */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Bem-vinda ao Espaço Vitória Nail Designer</span>
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
              <>
                <div className="social-buttons">
                  <a 
                    href="http://wa.me/5548998164811" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-whatsapp"
                  >
                    <MessageCircle size={20} />
                    WhatsApp
                  </a>
                  <a 
                    href="https://www.instagram.com/vitoriaext_nail/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-instagram"
                  >
                    <Instagram size={20} />
                    Instagram
                  </a>
                </div>
                <a 
                  href="https://www.google.com/maps?q=-28.770416,-49.372613"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-location"
                >
                  <MapPin size={20} />
                  Ver Localização
                </a>
              </>
            )}
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-image-placeholder">
            <img src="/logo-ve.png" alt="Vitória Nail Designer" className="hero-logo" />
          </div>
        </div>
      </section>

    </div>
  );
}