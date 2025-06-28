import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography,
  useMediaQuery,
  useTheme 
} from '@mui/material';
import axios from '../../services/axios';
import { useConnectivity } from '../../contexts/ConnectivityProvider';

function AlterarSenha() {
  // Acessa o estado de conectividade
  const { isOnline } = useConnectivity();

  // Estados para os campos do formulário
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  
  // Estados para feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Hook do Material-UI para responsividade
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Sempre que a conectividade mudar, limpa as mensagens (opcional)
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [isOnline]);

  // Função para enviar os dados
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Se estiver offline, não permite o envio
    if (!isOnline) {
      setError('Este recurso funciona somente online.');
      return;
    }

    // Verifica se a nova senha e a confirmação coincidem
    if (novaSenha !== confirmarNovaSenha) {
      setError('A nova senha e a confirmação devem ser iguais.');
      return;
    }

    setLoading(true);
    try {
      // Envia a requisição POST para o endpoint /auth/alterarSenha
      const response = await axios.post('/auth/alterarSenha', {
        passwordOld: senhaAtual,
        passwordNova: novaSenha,
        confirmacao: confirmarNovaSenha
      });

      // Verifica o status da resposta
      if (response.status === 200) {
        setSuccess('Senha alterada com sucesso!');
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarNovaSenha('');
      } else {
        setError('Ocorreu um erro ao alterar a senha.');
      }
    } catch (err) {
      if (err.response?.status === 500) {
        setError('Erro interno do servidor. Por favor, tente novamente.');
      } else {
        setError(err.response?.data?.message || 'Erro ao alterar a senha.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        width: '90%',
        mx: 'auto',
        mt: 4,
        p: 2,
        border: '1px solid #ccc',
        borderRadius: 2,
        boxShadow: 2,
        backgroundColor: 'background.paper'
      }}
    >
      <Typography variant="h5" gutterBottom textAlign="center">
        Alterar Senha
      </Typography>

      {/* Se estiver offline, exibe mensagem informando que o recurso funciona somente online */}
      {!isOnline && (
        <Typography variant="body1" color="warning.main" sx={{ mb: 2, textAlign: 'center' }}>
          Este recurso funciona somente online.
        </Typography>
      )}

      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 2, textAlign: 'center' }}>
          {error}
        </Typography>
      )}
      {success && (
        <Typography variant="body2" color="success.main" sx={{ mb: 2, textAlign: 'center' }}>
          {success}
        </Typography>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Senha Atual"
          type="password"
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
          fullWidth
          margin="normal"
          required
          disabled={!isOnline || loading}
          inputProps={{ style: { fontSize: isMobile ? 14 : 16 } }}
          InputLabelProps={{ style: { fontSize: isMobile ? 14 : 16 } }}
        />
        <TextField
          label="Nova Senha"
          type="password"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          fullWidth
          margin="normal"
          required
          disabled={!isOnline || loading}
          inputProps={{ style: { fontSize: isMobile ? 14 : 16 } }}
          InputLabelProps={{ style: { fontSize: isMobile ? 14 : 16 } }}
        />
        <TextField
          label="Confirmar Nova Senha"
          type="password"
          value={confirmarNovaSenha}
          onChange={(e) => setConfirmarNovaSenha(e.target.value)}
          fullWidth
          margin="normal"
          required
          disabled={!isOnline || loading}
          inputProps={{ style: { fontSize: isMobile ? 14 : 16 } }}
          InputLabelProps={{ style: { fontSize: isMobile ? 14 : 16 } }}
        />
        <Button
          variant="contained"
          type="submit"
          fullWidth
          disabled={!isOnline || loading}
          sx={{ mt: 2, fontSize: isMobile ? '0.9rem' : '1rem' }}
        >
          {loading ? 'Alterando...' : 'Alterar Senha'}
        </Button>
      </form>
    </Box>
  );
}

export default AlterarSenha;
