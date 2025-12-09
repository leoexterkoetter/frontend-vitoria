import { useEffect, useState, useRef } from 'react';
import { Calendar, Clock, Check, ChevronRight, User, Phone, Mail, CreditCard, DollarSign, X, Eye, EyeOff, Lock } from 'lucide-react';
import api from '../services/api';
import authService from '../services/authService';
import './Services.css';

export default function Services() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Referências para scroll automático
  const slotsRef = useRef(null);
  const summaryRef = useRef(null);
  const loginRef = useRef(null);
  const damagedNailsRef = useRef(null);

  // Estado do formulário de login/registro
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMode, setLoginMode] = useState('quick'); // 'quick', 'login', 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    pin: '',
    paymentMethod: 'pix'
  });

  // Estado para enquete de unhas danificadas
  const [hasDamagedNails, setHasDamagedNails] = useState(null);
  const [damagedNailsNote, setDamagedNailsNote] = useState('');

  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/services');
      setServices(response.data);
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectService = async (service) => {
    setSelectedService(service);
    setSelectedSlot(null);
    setHasDamagedNails(null);
    setDamagedNailsNote('');
    setLoadingSlots(true);
    setError('');

    try {
      const response = await api.get('/appointments/available-slots', {
        params: { serviceId: service._id }
      });

      let slots = Array.isArray(response.data) ? response.data : 
                  (response.data.slots || response.data.data || []);
      
      setAvailableSlots(slots);

      // Auto-scroll para enquete de unhas danificadas
      setTimeout(() => {
        damagedNailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (err) {
      console.error('Erro ao buscar horários:', err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setError('');

    // Auto-scroll para resumo/botão agendar
    setTimeout(() => {
      summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleBookAppointment = () => {
    if (!selectedService || !selectedSlot) {
      setError('Selecione um serviço e horário');
      return;
    }

    // Se já está logado, faz o agendamento direto
    if (isAuthenticated) {
      confirmBooking();
    } else {
      // Abre modal de login facilitado
      setShowLoginModal(true);
    }
  };

  const confirmBooking = async () => {
    setBookingLoading(true);
    setError('');

    try {
      // Monta a nota com informação de unhas danificadas
      let notes = '';
      if (hasDamagedNails === 'sim') {
        notes = `⚠️ UNHA DANIFICADA: ${damagedNailsNote || 'Cliente informou que possui unha(s) danificada(s)'}`;
      }

      await api.post('/appointments', {
        serviceId: selectedService._id,
        timeSlotId: selectedSlot._id,
        paymentMethod: formData.paymentMethod,
        notes
      });

      setSuccess('Agendamento realizado com sucesso!');
      
      // Reset
      setSelectedService(null);
      setSelectedSlot(null);
      setAvailableSlots([]);
      setShowLoginModal(false);
      setHasDamagedNails(null);
      setDamagedNailsNote('');

      // Redireciona após 2 segundos
      setTimeout(() => {
        window.location.href = '/my-appointments';
      }, 2000);

    } catch (err) {
      console.error('Erro ao criar agendamento:', err);
      setError(err.response?.data?.error || 'Erro ao realizar agendamento');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleQuickRegister = async () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      setError('Preencha todos os campos');
      return;
    }

    // Validar PIN de 4 dígitos
    if (!formData.pin || formData.pin.length !== 4 || !/^\d{4}$/.test(formData.pin)) {
      setError('Digite uma senha de 4 dígitos');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      // Registro rápido com PIN como senha
      const authResponse = await api.post('/auth/quick-register', {
        name: formData.name,
        phone: formData.phone.replace(/\D/g, ''),
        email: formData.email,
        password: formData.pin
      });

      if (authResponse.data.token) {
        localStorage.setItem('token', authResponse.data.token);
        localStorage.setItem('user', JSON.stringify(authResponse.data.user));
        
        // Atualiza o header do axios imediatamente
        api.defaults.headers.common['Authorization'] = `Bearer ${authResponse.data.token}`;
      }

      // Agora faz o agendamento
      await confirmBooking();

    } catch (err) {
      console.error('Erro no registro:', err);
      setError(err.response?.data?.error || 'Erro ao processar. Tente novamente.');
      setBookingLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Preencha email e senha');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      await authService.login(formData.email, formData.password);
      await confirmBooking();
    } catch (err) {
      console.error('Erro no login:', err);
      setError(err.error || 'Email ou senha inválidos');
      setBookingLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setFormData(prev => ({ ...prev, pin: value }));
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
    setFormData(prev => ({ ...prev, phone: formatPhone(e.target.value) }));
    setError('');
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
    if (!dateString) return 'Data inválida';
    // Extrai apenas YYYY-MM-DD se vier no formato ISO
    const dateOnly = dateString.split('T')[0];
    const date = new Date(dateOnly + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.substring(0, 5);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="services-container">
        <div className="services-loading">
          <div className="spinner"></div>
          <p>Carregando serviços...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="services-container">
      {/* Mensagem de sucesso */}
      {success && (
        <div className="success-toast">
          <Check size={20} />
          {success}
        </div>
      )}

      {/* Header simples */}
      <div className="services-hero">
        <h1>Agendar Serviço</h1>
        <p>Escolha o serviço e horário</p>
      </div>

      {/* Steps indicator */}
      <div className="steps-indicator">
        <div className={`step ${selectedService ? 'completed' : 'active'}`}>
          <span className="step-number">1</span>
          <span className="step-label">Serviço</span>
        </div>
        <ChevronRight size={16} className="step-arrow" />
        <div className={`step ${selectedSlot ? 'completed' : selectedService ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Horário</span>
        </div>
        <ChevronRight size={16} className="step-arrow" />
        <div className={`step ${selectedSlot ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Confirmar</span>
        </div>
      </div>

      <div className="services-content">
        {/* PASSO 1: Lista de Serviços */}
        <section className="services-section">
          <h2>1. Escolha seu serviço</h2>
          <div className="services-grid">
            {services.map(service => (
              <div 
                key={service._id}
                className={`service-card ${selectedService?._id === service._id ? 'selected' : ''}`}
                onClick={() => handleSelectService(service)}
              >
                <div className="service-card-content">
                  <h3>{service.name}</h3>
                  <span className="service-price">{formatCurrency(service.price)}</span>
                </div>
                {service.description && (
                  <p className="service-description">{service.description}</p>
                )}
                {selectedService?._id === service._id && (
                  <div className="service-selected-indicator">
                    <Check size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Enquete: Unhas Danificadas */}
        {selectedService && (
          <section className="damaged-nails-section" ref={damagedNailsRef}>
            <h2>Unhas Danificadas</h2>
            <div className="damaged-nails-card">
              <p className="damaged-nails-question">
                Você possui alguma unha quebrada ou danificada que necessita de um novo alongamento?
              </p>
              
              <div className="damaged-nails-options">
                <label className={`damaged-option ${hasDamagedNails === 'sim' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="damagedNails"
                    value="sim"
                    checked={hasDamagedNails === 'sim'}
                    onChange={(e) => {
                      setHasDamagedNails(e.target.value);
                      setTimeout(() => {
                        slotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 300);
                    }}
                  />
                  <span className="radio-custom"></span>
                  Sim
                </label>
                <label className={`damaged-option ${hasDamagedNails === 'nao' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="damagedNails"
                    value="nao"
                    checked={hasDamagedNails === 'nao'}
                    onChange={(e) => {
                      setHasDamagedNails(e.target.value);
                      setTimeout(() => {
                        slotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }}
                  />
                  <span className="radio-custom"></span>
                  Não
                </label>
              </div>

              {hasDamagedNails === 'sim' && (
                <div className="damaged-nails-warning">
                  <div className="warning-message">
                    <span className="warning-icon">⚠️</span>
                    <p>
                      Está sujeito a taxa adicional de <strong>R$5,00 por unha</strong> que necessite novo alongamento.
                    </p>
                  </div>
                  <textarea
                    className="damaged-nails-textarea"
                    placeholder="Descreva quantas unhas estão danificadas (opcional)"
                    value={damagedNailsNote}
                    onChange={(e) => setDamagedNailsNote(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* PASSO 2: Horários Disponíveis */}
        {selectedService && (
          <section className="slots-section" ref={slotsRef}>
            <h2>2. Escolha o horário</h2>
            
            {loadingSlots ? (
              <div className="slots-loading">
                <div className="spinner"></div>
                <p>Carregando horários...</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="slots-empty">
                <Calendar size={48} />
                <p>Nenhum horário disponível</p>
              </div>
            ) : (
              <div className="slots-container">
                {Object.entries(groupSlotsByDate(availableSlots)).map(([date, slots]) => (
                  <div key={date} className="slots-date-group">
                    <h3 className="slots-date-header">
                      <Calendar size={18} />
                      {formatDate(date)}
                    </h3>
                    <div className="slots-grid">
                      {slots.map(slot => (
                        <button
                          key={slot._id}
                          className={`slot-button ${selectedSlot?._id === slot._id ? 'selected' : ''}`}
                          onClick={() => handleSelectSlot(slot)}
                        >
                          {formatTime(slot.start_time)}
                          {selectedSlot?._id === slot._id && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* PASSO 3: Resumo e Agendamento */}
        {selectedService && selectedSlot && (
          <section className="booking-section" ref={summaryRef}>
            <h2>3. Confirme seu agendamento</h2>
            
            <div className="booking-card">
              <div className="booking-info">
                <div className="booking-info-item">
                  <span className="label">Serviço</span>
                  <span className="value">{selectedService.name}</span>
                </div>
                <div className="booking-info-item">
                  <span className="label">Data</span>
                  <span className="value">{formatDate(selectedSlot.date)}</span>
                </div>
                <div className="booking-info-item">
                  <span className="label">Horário</span>
                  <span className="value">{formatTime(selectedSlot.start_time)}</span>
                </div>
                <div className="booking-info-item total">
                  <span className="label">Total</span>
                  <span className="value price">{formatCurrency(selectedService.price)}</span>
                </div>
              </div>

              {/* Forma de pagamento */}
              <div className="payment-section">
                <span className="payment-label">Pagamento no local:</span>
                <div className="payment-options">
                  <label className={`payment-option ${formData.paymentMethod === 'pix' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="pix"
                      checked={formData.paymentMethod === 'pix'}
                      onChange={handleChange}
                    />
                    <CreditCard size={18} />
                    PIX
                  </label>
                  <label className={`payment-option ${formData.paymentMethod === 'dinheiro' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="dinheiro"
                      checked={formData.paymentMethod === 'dinheiro'}
                      onChange={handleChange}
                    />
                    <DollarSign size={18} />
                    Dinheiro
                  </label>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button 
                className="btn-confirm"
                onClick={handleBookAppointment}
                disabled={bookingLoading}
              >
                {bookingLoading ? 'Processando...' : (
                  <>
                    <Calendar size={20} />
                    {isAuthenticated ? 'Confirmar Agendamento' : 'Continuar para Agendar'}
                  </>
                )}
              </button>

              {!isAuthenticated && (
                <p className="login-hint">
                  Você precisará informar seus dados para finalizar
                </p>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Modal de Login Facilitado */}
      {showLoginModal && (
        <div className="login-modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="login-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLoginModal(false)}>
              <X size={24} />
            </button>

            <div className="login-modal-header">
              <h2>Finalizar Agendamento</h2>
              <p>Informe seus dados para confirmar</p>
            </div>

            {/* Tabs */}
            <div className="login-tabs">
              <button 
                className={`tab ${loginMode === 'quick' ? 'active' : ''}`}
                onClick={() => setLoginMode('quick')}
              >
                Cadastro Rápido
              </button>
              <button 
                className={`tab ${loginMode === 'login' ? 'active' : ''}`}
                onClick={() => setLoginMode('login')}
              >
                Já tenho conta
              </button>
            </div>

            <div className="login-modal-body">
              {loginMode === 'quick' ? (
                /* Cadastro Rápido */
                <div className="quick-form">
                  <div className="form-group">
                    <label><User size={16} /> Nome Completo</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="form-group">
                    <label><Phone size={16} /> WhatsApp</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="(00) 00000-0000"
                      maxLength="15"
                    />
                  </div>
                  <div className="form-group">
                    <label><Mail size={16} /> E-mail</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div className="form-group">
                    <label><Lock size={16} /> Senha (4 dígitos)</label>
                    <input
                      type="password"
                      name="pin"
                      value={formData.pin}
                      onChange={handlePinChange}
                      placeholder="••••"
                      maxLength="4"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '1.2rem' }}
                    />
                    <small style={{ color: '#666', fontSize: '0.75rem' }}>
                      Use essa senha para acessar seus agendamentos
                    </small>
                  </div>
                </div>
              ) : (
                /* Login */
                <div className="login-form">
                  <div className="form-group">
                    <label><Mail size={16} /> E-mail</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div className="form-group">
                    <label><Lock size={16} /> Senha</label>
                    <div className="password-input">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••"
                      />
                      <button 
                        type="button" 
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}

              {/* Resumo do agendamento */}
              <div className="modal-booking-summary">
                <div className="summary-row">
                  <span>{selectedService?.name}</span>
                  <span>{formatCurrency(selectedService?.price)}</span>
                </div>
                <div className="summary-row">
                  <span>{formatDate(selectedSlot?.date)} às {formatTime(selectedSlot?.start_time)}</span>
                </div>
              </div>

              <button 
                className="btn-confirm-modal"
                onClick={loginMode === 'quick' ? handleQuickRegister : handleLogin}
                disabled={bookingLoading}
              >
                {bookingLoading ? 'Processando...' : (
                  <>
                    <Check size={20} />
                    Confirmar Agendamento
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}