import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowLeft } from 'lucide-react';
import authService from '../../services/authService.js';
import './Auth.css';

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register(
        formData.name,
        formData.email,
        formData.password
      );

      navigate('/home');
    } catch (err) {
      setError(err.error || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        {/* Botão Voltar */}
        <button 
          className="back-button"
          onClick={() => navigate('/home')}
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <div className="auth-header">
          <div className="brand-icon">💅</div>
          <h1>Criar Conta</h1>
          <p>Junte-se a nós para cuidar das suas unhas</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="input-group">
            <label>Nome Completo</label>
            <div className="input-wrapper">
              <User size={20} />
              <input
                type="text"
                placeholder="Seu nome"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Email</label>
            <div className="input-wrapper">
              <Mail size={20} />
              <input
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Senha</label>
            <div className="input-wrapper">
              <Lock size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={6}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <div className="spinner-small"></div>
            ) : (
              <>
                <Sparkles size={20} />
                Criar Conta
              </>
            )}
          </button>

          <div className="auth-footer">
            <p>Já tem uma conta?</p>
            <Link to="/login" className="link-primary">
              Fazer login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
