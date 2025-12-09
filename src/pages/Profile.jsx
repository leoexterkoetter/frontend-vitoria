import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Home, User, LogOut, Edit2, Save, X } from 'lucide-react';
import api from '../services/api';
import authService from '../services/authService';
import './MyAppointments.css';


function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/api/users/profile');
      setUser(response.data.user);
      setFormData({
        name: response.data.user.name,
        phone: response.data.user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      await api.put('/api/users/profile', updateData);
      
      localStorage.setItem('userName', formData.name);
      
      setEditing(false);
      fetchUser();
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao atualizar perfil');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="user-dashboard">
      

      <main className="user-content">
        <header className="page-header">
          <div>
            <h1>Meu Perfil</h1>
            <p>Gerencie suas informações pessoais</p>
          </div>
          {!editing && (
            <button className="btn-primary" onClick={() => setEditing(true)}>
              <Edit2 size={18} />
              Editar Perfil
            </button>
          )}
        </header>

        <div className="profile-container">
          <div className="profile-card">
            {!editing ? (
              <div className="profile-view">
                <div className="profile-avatar">
                  <User size={64} />
                </div>
                
                <div className="profile-info">
                  <div className="info-group">
                    <label>Nome</label>
                    <p>{user.name}</p>
                  </div>

                  <div className="info-group">
                    <label>Email</label>
                    <p>{user.email}</p>
                  </div>

                  <div className="info-group">
                    <label>Telefone</label>
                    <p>{user.phone || 'Não informado'}</p>
                  </div>

                  <div className="info-group">
                    <label>Membro desde</label>
                    <p>{new Date(user.createdAt).toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric' 
                    })}</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="profile-form">
                <h3>Editar Informações</h3>
                
                <div className="form-group">
                  <label>Nome *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="input"
                    value={user.email}
                    disabled
                  />
                  <small>O email não pode ser alterado</small>
                </div>

                <div className="form-group">
                  <label>Telefone</label>
                  <input
                    type="tel"
                    className="input"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <hr />

                <h3>Alterar Senha</h3>
                <p className="form-hint">Deixe em branco se não deseja alterar a senha</p>

                <div className="form-group">
                  <label>Senha Atual</label>
                  <input
                    type="password"
                    className="input"
                    value={formData.currentPassword}
                    onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Nova Senha</label>
                  <input
                    type="password"
                    className="input"
                    value={formData.newPassword}
                    onChange={e => setFormData({...formData, newPassword: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Confirmar Nova Senha</label>
                  <input
                    type="password"
                    className="input"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
                    <X size={18} />
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    <Save size={18} />
                    Salvar Alterações
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;