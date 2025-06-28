import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';  // Importando o spinner do Material-UI

export function ProtectedRoute({ children, requireCompany = false }) {
  const { isAuthenticated, selectedCompany } = useAuth();
  const [isLoading, setIsLoading] = useState(true); // Estado de carregamento

  useEffect(() => {
    // Simula a verificação de autenticação ao carregar o contexto
    if (isAuthenticated !== undefined) {
      setIsLoading(false);
    }
  }, [isAuthenticated]); // Apenas muda quando isAuthenticated mudar

  // Enquanto estiver verificando o status de autenticação, exibe um spinner
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh', // Centraliza o spinner na tela
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Se não estiver autenticado, redireciona para a página de login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se for necessário selecionar a empresa e o usuário não selecionou, redireciona para /select-company
  if (requireCompany && !selectedCompany) {
    return <Navigate to="/select-company" replace />;
  }

  return children; // Retorna os filhos (a rota protegida)
}
