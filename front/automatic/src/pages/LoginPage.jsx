import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const { login, isAuthenticated ,user} = useAuth(); // Obtém o estado de autenticação
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Detecta telas menores

  // Redireciona para /home se estiver autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/home');
    }
  }, [isAuthenticated, user,navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = credentials;

    if (!username || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);
      await login({ username, password });
      navigate('/home'); // Redireciona após login bem-sucedido
    } catch (err) {
      setError(err.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: isMobile ? '90%' : '400px',
          padding: 4,
          borderRadius: 2,
          boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.2)',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
          }}
        >
          Bem-vindo a horta automática
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Por favor, faça login para continuar.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Usuário"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
          <TextField
            fullWidth
            label="Senha"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ mt: 3, position: 'relative' }}>
            {loading ? (
              <>
              <CircularProgress size={30} sx={{ display: 'block', margin: 'auto' }} />
              <Typography > Efetuando login..</Typography>
              </>
            ) : (
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  borderRadius: '8px',
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': { backgroundColor: theme.palette.primary.dark },
                }}
              >
                Entrar
              </Button>
            )}
          </Box>
        </form>
      </Paper>

    
    </Container>
  );
}

export default LoginPage;
