import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { useThemeConfig } from '../contexts/ThemeContext';
import { styled } from '@mui/material/styles';
import Slider from '@mui/material/Slider';

// Componente Slider customizado para melhorar a visibilidade no tema escuro
const CustomSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? '#fff' : '#1976d2',
  '& .MuiSlider-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? '#fff' : '#1976d2',
    border: '2px solid currentColor',
  },
  '& .MuiSlider-track': {
    backgroundColor: theme.palette.mode === 'dark' ? '#fff' : '#1976d2',
  },
  '& .MuiSlider-rail': {
    opacity: 0.5,
    backgroundColor:
      theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.3)'
        : 'rgba(25,118,210,0.3)',
  },
}));

function ThemeModal({ onClose }) {
  const { themeSettings, updateTheme } = useThemeConfig();
  const [settings, setSettings] = useState(themeSettings);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [countdown, setCountdown] = useState(5); // Timer de 5 segundos
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Ao confirmar, atualizamos o tema e fechamos o modal.
  const handleConfirmSave = () => {
    updateTheme(settings);
    setConfirmOpen(false);
    onClose();
  };

  // Inicia o timer de 5 segundos ao abrir o modal de confirmação
  useEffect(() => {
    if (confirmOpen) {
      setCountdown(5);
      setIsButtonEnabled(false);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setIsButtonEnabled(true);
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [confirmOpen]);

  return (
    <>
      {/* Modal de configuração do tema */}
      <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Configuração de Tema</DialogTitle>
        <DialogContent>
          {/* Modo Claro/Escuro/Personalizado */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Modo</InputLabel>
            <Select
              value={settings.mode}
              onChange={(e) => handleChange('mode', e.target.value)}
              label="Modo"
            >
              <MenuItem value="light">Claro</MenuItem>
              <MenuItem value="dark">Escuro</MenuItem>
              <MenuItem value="custom">Personalizado</MenuItem>
            </Select>
          </FormControl>

          {/* Novo controle para a posição da Navbar */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Posição da Navbar</InputLabel>
            <Select
              value={settings.navbarPosition || 'bottom'} // valor padrão: 'bottom'
              onChange={(e) =>
                handleChange('navbarPosition', e.target.value)
              }
              label="Posição da Navbar"
            >
              <MenuItem value="top">Em Cima</MenuItem>
              <MenuItem value="bottom">Em Baixo</MenuItem>
            </Select>
          </FormControl>

          {/* Configurações para Modo Personalizado */}
          {settings.mode === 'custom' && (
            <>
              <Typography>Cor da Navbar</Typography>
              <input
                type="color"
                value={settings.navbarColor}
                onChange={(e) =>
                  handleChange('navbarColor', e.target.value)
                }
                style={{
                  width: '100%',
                  height: '40px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              />

              <Typography>Cor das Janelas</Typography>
              <input
                type="color"
                value={settings.windowColor}
                onChange={(e) =>
                  handleChange('windowColor', e.target.value)
                }
                style={{
                  width: '100%',
                  height: '40px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              />

              <Typography>Cor do Texto</Typography>
              <input
                type="color"
                value={settings.textColor}
                onChange={(e) =>
                  handleChange('textColor', e.target.value)
                }
                style={{
                  width: '100%',
                  height: '40px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              />
            </>
          )}

          <Typography mt={2}>Tamanho da Fonte</Typography>
          <CustomSlider
            value={settings.fontSize}
            onChange={(e, newValue) => handleChange('fontSize', newValue)}
            min={12}
            max={30}
            step={1}
            valueLabelDisplay="auto"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={() => setConfirmOpen(true)} color="secondary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Confirmação com Timer */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirmar Alteração</DialogTitle>
        <DialogContent>
          <Typography>
            As telas serão atualizadas e alterações não salvas podem ser
            perdidas. Tem certeza que deseja continuar?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmSave}
            color="secondary"
            variant="contained"
            disabled={!isButtonEnabled} // Bloqueia o botão até o tempo acabar
          >
            {isButtonEnabled ? 'Sim, mudar' : `Aguarde ${countdown}s`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ThemeModal;
