// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Divider,
  useTheme,
} from '@mui/material';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import LayersIcon from '@mui/icons-material/Layers';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import LogoutIcon from '@mui/icons-material/Logout';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import LockResetIcon from '@mui/icons-material/LockReset';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';

import axios from '../services/axios'; // instância configurada

import { useAuth } from '../contexts/AuthContext';
import { useWindowManager } from '../contexts/WindowManagerContext';
import ThemeModal from './ThemeModal';
import { useThemeConfig } from '../contexts/ThemeContext';

export default function Navbar() {
  const theme = useTheme();
  const { logout } = useAuth();
  const {
    windows,
    openWindow,
    minimizeWindow,
    restoreWindow,
    minimizeAllWindows,
    restoreAllWindows,
    updateWindowPosition,
    focusedWindow,
    setFocusedWindow,
  } = useWindowManager();
  const { themeSettings } = useThemeConfig();

  const navbarPosition = themeSettings.navbarPosition || 'bottom';

  /* --------------------------- estado | efeitos --------------------------- */
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [startMenuAnchor, setStartMenuAnchor] = useState(null);

  // cômodos vindos da API
  const [comodos, setComodos] = useState([]);
  useEffect(() => {
    axios
      .get('/api/comodos/listarPorStatus')
      .then(({ data }) =>
        setComodos(
          (Array.isArray(data) ? data : []).filter((c) => c.status !== false)
        )
      )
      .catch((err) => console.error('Erro ao buscar cômodos:', err));
  }, []);

  /* ---------------------- handlers de menus e modais ---------------------- */
  const handleOpenThemeModal = () => {
    setThemeModalOpen(true);
    handleStartMenuClose();
  };
  const handleCloseThemeModal = () => setThemeModalOpen(false);

  const handleStartButtonClick = (event) => setStartMenuAnchor(event.currentTarget);
  const handleStartMenuClose = () => setStartMenuAnchor(null);

  /* ---------------------- janelas fixas de exemplo ------------------------ */
  const openConfiguracaoWindow = () => {
    openWindow(
      'configuracao',
      'Configuração',
      <iframe
        src="/configuracao"
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Configuração"
      />
    );
    handleStartMenuClose();
  };

  const openAlterarSenhaWindow = () => {
    openWindow(
      'alterarSenha',
      'Alterar Senha',
      <iframe
        src="/alterarSenha"
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Alterar Senha"
      />
    );
    handleStartMenuClose();
  };

  /* --------------------------- organização janelas ------------------------ */
  const arrangeCascade = () => {
    const offset = 30;
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight - 50;

    windows.forEach((win, i) => {
      win.isMaximized = false;
      updateWindowPosition(
        win.id,
        {
          x: offset * i,
          y: offset * i,
          width: availableWidth - offset * i,
          height: availableHeight - offset * i,
        },
        { skipAutoMaximize: true }
      );
    });
    handleStartMenuClose();
  };

  const arrangeStacked = () => {
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight - 50;
    const h = availableHeight / windows.length;

    windows.forEach((win, i) => {
      win.isMaximized = false;
      updateWindowPosition(
        win.id,
        { x: 0, y: i * h, width: availableWidth, height: h },
        { skipAutoMaximize: true }
      );
    });
    handleStartMenuClose();
  };

  const arrangeSideBySide = () => {
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight - 50;
    const w = availableWidth / windows.length;

    windows.forEach((win, i) => {
      win.isMaximized = false;
      updateWindowPosition(
        win.id,
        { x: i * w, y: 0, width: w, height: availableHeight },
        { skipAutoMaximize: true }
      );
    });
    handleStartMenuClose();
  };

  /* --------------------- taskbar / minimizar-restaurar -------------------- */
  const handleTaskClick = (win) => {
    if (win.isMinimized) {
      restoreWindow(win.id);
      setFocusedWindow(win.id);
    } else if (focusedWindow === win.id) {
      minimizeWindow(win.id);
    } else {
      restoreWindow(win.id);
      setFocusedWindow(win.id);
    }
  };

  const toggleAllWindows = () => {
    if (windows.every((w) => w.isMinimized)) restoreAllWindows();
    else minimizeAllWindows();
  };

  /* -------------------------------- logout -------------------------------- */
  const handleLogout = () => {
    logout();
    handleStartMenuClose();
  };

  /* ======================================================================== */
  return (
    <Box
      component="header"
      sx={{
        position: 'fixed',
        left: 0,
        width: '100%',
        height: 60,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        display: 'flex',
        alignItems: 'center',
        zIndex: 1300,
        px: 1,
        borderTop: navbarPosition === 'bottom' ? `1px solid ${theme.palette.divider}` : 0,
        borderBottom: navbarPosition === 'top' ? `1px solid ${theme.palette.divider}` : 0,
        top: navbarPosition === 'top' ? 0 : 'auto',
        bottom: navbarPosition === 'bottom' ? 0 : 'auto',
      }}
    >
      {/* Botão Iniciar */}
      <IconButton onClick={handleStartButtonClick} color="inherit" sx={{ mr: 1 }}>
        <MenuIcon />
      </IconButton>

      {/* Menu Iniciar */}
      <Menu
        anchorEl={startMenuAnchor}
        open={Boolean(startMenuAnchor)}
        onClose={handleStartMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            p: 1,
            maxWidth: '100vw',
            maxHeight: '100vh',
            overflow: 'auto',
          },
        }}
      >
        <Box sx={{ display: 'flex' }}>
          {/* COLUNA ESQUERDA */}
          <Box
            sx={{
              borderRight: `2px solid ${theme.palette.divider}`,
              pr: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
      

            {/* Itens dinâmicos de /api/comodos */}
            {comodos.map((c) => (
              <MenuItem
                key={c.id}
                onClick={() => {
                  openWindow(
                    c.nome_tela || c.nome,
                    c.nome,
                    <iframe
                      src={c.caminho}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      title={c.nome}
                    />
                  );
                  handleStartMenuClose();
                }}
              >
                <PriceCheckIcon fontSize="small" sx={{ mr: 1 }} />
                {c.nome}
              </MenuItem>
              
            ))}
                
          </Box>

          {/* COLUNA DIREITA */}
          <Box
            sx={{
              pl: 2,
              display: 'flex',
              flexDirection: 'column',
              width: 250,
            }}
          >
            <MenuItem onClick={arrangeCascade}>
              <LayersIcon fontSize="small" sx={{ mr: 1 }} />
              Cascata
            </MenuItem>
            <MenuItem onClick={arrangeStacked}>
              <ViewStreamIcon fontSize="small" sx={{ mr: 1 }} />
              Empilhadas
            </MenuItem>
            <MenuItem onClick={arrangeSideBySide}>
              <ViewColumnIcon fontSize="small" sx={{ mr: 1 }} />
              Lado a lado
            </MenuItem>

            <Divider sx={{ my: 1, borderBottomWidth: 2 }} />

            <MenuItem onClick={handleOpenThemeModal}>
              <ColorLensIcon fontSize="small" sx={{ mr: 1 }} />
              Alterar Tema
            </MenuItem>
            <MenuItem onClick={openAlterarSenhaWindow}>
              <LockResetIcon fontSize="small" sx={{ mr: 1 }} />
              Alterar Senha
            </MenuItem>

            <Divider sx={{ my: 1, borderBottomWidth: 2 }} />

            <Box sx={{ flex: 1 }} />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Box>
        </Box>
      </Menu>

      {/* TASKBAR */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          overflowX: 'auto',
          gap: 1,
        }}
      >
        {windows.map((win) => (
          <Button
            key={win.id}
            variant={focusedWindow === win.id ? 'contained' : 'outlined'}
            onClick={() => handleTaskClick(win)}
            sx={{
              color:
                focusedWindow === win.id
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary,
              backgroundColor:
                focusedWindow === win.id ? theme.palette.primary.main : 'transparent',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {win.title || 'Sem título'}
          </Button>
        ))}
      </Box>

      {/* Minimizar/Restaurar todas */}
      <IconButton onClick={toggleAllWindows} color="inherit" sx={{ ml: 1 }}>
        <DesktopWindowsIcon />
      </IconButton>

      {/* Modal Tema */}
      {themeModalOpen && <ThemeModal onClose={handleCloseThemeModal} />}
    </Box>
  );
}
