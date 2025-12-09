import { useState } from 'react';
import { X, Calendar, Clock, DollarSign, User, Phone, Mail, CreditCard } from 'lucide-react';
import api from '../services/api';
import './BookingModal.css';

export default function BookingModal({ 
  isOpen, 
  onClose, 
  service, 
  timeSlot,
  onSuccess 
}) {
  const [step, setStep] = useState(1); // 1: dados pessoais, 2: confirmação
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    paymentMethod: 'pix'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !service || !timeSlot) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({
      ...prev,
      phone: formatted
    }));
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError('Por favor, informe seu nome completo');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) {
      setError('Por favor, informe um telefone válido');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Por favor, informe um e-mail válido');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError('');

    try {
      // Primeiro, registra/autentica o usuário
      const authResponse = await api.post('/auth/quick-register', {
        name: formData.name,
        phone: formData.phone.replace(/\D/g, ''),
        email: formData.email
      });

      // Armazena o token
      if (authResponse.data.token) {
        localStorage.setItem('token', authResponse.data.token);
      }

      // Cria o agendamento
      await api.post('/appointments', {
        serviceId: service._id,
        timeSlotId: timeSlot._id,
        paymentMethod: formData.paymentMethod
      });

      // Sucesso!
      onSuccess?.();
      onClose();
      
      alert('Agendamento realizado com sucesso! Você receberá uma confirmação em breve.');

    } catch (err) {
      console.error('Erro ao criar agendamento:', err);
      setError(err.response?.data?.error || 'Erro ao realizar agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="booking-modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        {/* Cabeçalho com informações do serviço */}
        <div className="booking-modal-header">
          <h2>Finalizar Agendamento</h2>
          <div className="booking-service-summary">
            <div className="booking-summary-item">
              <strong>{service.name}</strong>
            </div>
            <div className="booking-summary-details">
              <span>
                <Calendar size={16} />
                {formatDate(timeSlot.date)}
              </span>
              <span>
                <Clock size={16} />
                {formatTime(timeSlot.start_time)} - {formatTime(timeSlot.end_time)}
              </span>
              <span>
                <DollarSign size={16} />
                {formatCurrency(service.price)}
              </span>
            </div>
          </div>
        </div>

        {/* Indicador de etapas */}
        <div className="booking-steps-indicator">
          <div className={`booking-step ${step >= 1 ? 'active' : ''}`}>
            <div className="booking-step-number">1</div>
            <span>Seus Dados</span>
          </div>
          <div className="booking-step-line"></div>
          <div className={`booking-step ${step >= 2 ? 'active' : ''}`}>
            <div className="booking-step-number">2</div>
            <span>Confirmação</span>
          </div>
        </div>

        <div className="booking-modal-body">
          {step === 1 && (
            <div className="booking-form">
              <h3>Informe seus dados</h3>
              <p className="booking-form-subtitle">
                Precisamos de algumas informações para confirmar seu agendamento
              </p>

              <div className="booking-form-group">
                <label>
                  <User size={18} />
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Digite seu nome completo"
                  required
                />
              </div>

              <div className="booking-form-group">
                <label>
                  <Phone size={18} />
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  maxLength="15"
                  required
                />
              </div>

              <div className="booking-form-group">
                <label>
                  <Mail size={18} />
                  E-mail *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              {error && (
                <div className="booking-error-message">
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="booking-confirmation">
              <h3>Confirme seus dados</h3>
              
              <div className="booking-confirmation-card">
                <div className="booking-confirmation-section">
                  <h4>Informações Pessoais</h4>
                  <div className="booking-info-item">
                    <User size={16} />
                    <span>{formData.name}</span>
                  </div>
                  <div className="booking-info-item">
                    <Phone size={16} />
                    <span>{formData.phone}</span>
                  </div>
                  <div className="booking-info-item">
                    <Mail size={16} />
                    <span>{formData.email}</span>
                  </div>
                </div>

                <div className="booking-confirmation-section">
                  <h4>Detalhes do Serviço</h4>
                  <div className="booking-info-item">
                    <strong>{service.name}</strong>
                  </div>
                  <div className="booking-info-item">
                    <Calendar size={16} />
                    <span>{formatDate(timeSlot.date)}</span>
                  </div>
                  <div className="booking-info-item">
                    <Clock size={16} />
                    <span>{formatTime(timeSlot.start_time)} - {formatTime(timeSlot.end_time)}</span>
                  </div>
                </div>

                <div className="booking-confirmation-section">
                  <h4>Forma de Pagamento</h4>
                  <div className="booking-payment-options">
                    <label className={`booking-payment-option ${formData.paymentMethod === 'pix' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pix"
                        checked={formData.paymentMethod === 'pix'}
                        onChange={handleChange}
                      />
                      <CreditCard size={20} />
                      <span>PIX</span>
                    </label>
                    <label className={`booking-payment-option ${formData.paymentMethod === 'dinheiro' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="dinheiro"
                        checked={formData.paymentMethod === 'dinheiro'}
                        onChange={handleChange}
                      />
                      <DollarSign size={20} />
                      <span>Dinheiro</span>
                    </label>
                  </div>
                </div>

                <div className="booking-total">
                  <span>Total a pagar:</span>
                  <strong>{formatCurrency(service.price)}</strong>
                </div>
              </div>

              {error && (
                <div className="booking-error-message">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="booking-modal-footer">
          {step === 1 ? (
            <>
              <button 
                className="booking-btn booking-btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                className="booking-btn booking-btn-primary"
                onClick={handleNextStep}
                disabled={loading}
              >
                Continuar
              </button>
            </>
          ) : (
            <>
              <button 
                className="booking-btn booking-btn-secondary"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Voltar
              </button>
              <button 
                className="booking-btn booking-btn-primary"
                onClick={handleConfirmBooking}
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Confirmar Agendamento'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}