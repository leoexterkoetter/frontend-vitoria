import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/authService';

// Layout
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';

// Páginas
import AdminDashboard from './pages/admin/Dashboard';
import AdminAppointments from './pages/admin/Appointments';
import AdminServices from './pages/admin/Services';
import AdminClients from './pages/admin/Clients';
import AdminTimeSlots from './pages/admin/TimeSlots';
import MyAppointments from './pages/MyAppointments';
import Profile from './pages/Profile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/Home';
import Services from './pages/Services';

import './styles/global.css';

// Rota protegida - APENAS para admin
function AdminRoute({ children }) {
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();

  if (!isAuthenticated || !isAdmin) return <Navigate to="/login" />;
  return children;
}

// Rota que requer autenticação (para páginas que precisam de usuário logado)
function AuthRoute({ children }) {
  const isAuthenticated = authService.isAuthenticated();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
}

// Layout com Navbar - PARA USUÁRIOS
function UserLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}

// Página temporária
function ComingSoon({ title }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <h1>🎀 {title}</h1>
      <p>Página em construção...</p>
      <button className="btn btn-primary" onClick={() => window.history.back()}>
        Voltar
      </button>
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verifica se já mostrou o loading nesta sessão
    const hasShownLoading = sessionStorage.getItem('hasShownLoading');
    
    if (hasShownLoading) {
      setIsLoading(false);
    } else {
      // Mostra loading por 7 segundos
      const timer = setTimeout(() => {
        setIsLoading(false);
        sessionStorage.setItem('hasShownLoading', 'true');
      }, 7000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>

        {/* ROTA INICIAL - VAI DIRETO PARA HOME */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* ROTAS PÚBLICAS - SEM NECESSIDADE DE LOGIN */}
        <Route path="/home" element={<UserLayout><Home /></UserLayout>} />
        <Route path="/services" element={<UserLayout><Services /></UserLayout>} />

        {/* LOGIN/REGISTRO */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ROTAS QUE PRECISAM DE AUTENTICAÇÃO */}
        <Route
          path="/my-appointments"
          element={
            <AuthRoute>
              <UserLayout><MyAppointments /></UserLayout>
            </AuthRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <AuthRoute>
              <UserLayout><Profile /></UserLayout>
            </AuthRoute>
          }
        />

        <Route
          path="/booking"
          element={<UserLayout><Services /></UserLayout>}
        />

        {/* ==========================================
            ROTAS ADMIN - SEM NAVBAR (sidebar própria)
            ========================================== */}
        
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Navigate to="/admin/dashboard" replace />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/time-slots"
          element={
            <AdminRoute>
              <AdminTimeSlots />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/services"
          element={
            <AdminRoute>
              <AdminServices />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/clients"
          element={
            <AdminRoute>
              <AdminClients />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/appointments"
          element={
            <AdminRoute>
              <AdminAppointments />
            </AdminRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<ComingSoon title="Página não encontrada" />} />

      </Routes>
    </Router>
  );
}

export default App;
