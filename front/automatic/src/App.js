import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';

// MUI
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

// Contexts e Providers
import { ThemeProviderComponent } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ConnectivityProvider } from './contexts/ConnectivityProvider';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WindowManagerProvider } from './contexts/WindowManagerContext';
import { SyncProvider } from './contexts/SyncContext';

import { UnsavedChangesProvider, useUnsavedChanges } from './contexts/UnsavedChangesContext';

// Componentes
import { ProtectedRoute } from './components/ProtectedRoute';
import WindowManager from './components/WindowManager';

// Páginas
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';



import AlterarSenha from './pages/alterarSenha/alterarSenha';

import TCC2 from './pages/tcc/tcc';

/**
 * Esse componente só serve para efetuar o logout
 * e redirecionar para a página de login.
 */
function Logout() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return <Navigate to="/login" replace />;
}

/**
 * Componente principal que gerencia as rotas e o WindowManager.
 */
function AppRoutes() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { hasUnsavedChanges } = useUnsavedChanges();

  // Verifica se a rota começa com /windows
  const isWindowRoute = location.pathname.startsWith('/windows');

  // Redirecionamento com confirmação
  useEffect(() => {

  }, [location.pathname, navigate, hasUnsavedChanges]);

  // Contagem regressiva para habilitar o botão
  const startCountdown = () => {
    setIsButtonEnabled(false);
    setCountdown(5);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsButtonEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    navigate(pendingNavigation, { replace: true });
  };



  // Rotas padrão (não /windows)
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
     

      <Route
        path="/home"
        element={
        
             <SyncProvider>
              
            <WindowManagerProvider>
              <HomePage />
            </WindowManagerProvider>

            </SyncProvider>
         
        }
      />

    
        <Route
        path="/TCC"
        element={
          
            <TCC2 />
          
        }
      />
    
  

  {/* outras rotas */}


        <Route path="/login" element={<LoginPage />} />


      <Route
        path="/alterarSenha"
        element={
          
            <AlterarSenha />
          
        }
      />
    

      <Route path="/logout" element={<Logout />} />

      {/* Rota wildcard para redirecionar se a rota não existir */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Componente principal da aplicação.
 */
function App() {
  return (
    <ThemeProviderComponent>
      <NotificationProvider>
        <AuthProvider>
          <ConnectivityProvider>
           
              <UnsavedChangesProvider>
                <Router>
                  <AppRoutes />
                </Router>
              </UnsavedChangesProvider>
          
          </ConnectivityProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProviderComponent>
  );
}

export default App;