import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SyncIcon from '@mui/icons-material/Sync';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeConfig } from '../contexts/ThemeContext';
import { useConnectivity } from '../contexts/ConnectivityProvider';
import ThemeModal from './ThemeModal';
import SyncModal from './SyncModal';

function AndroidNavbar() {
  const navigate = useNavigate();
  const { themeSettings } = useThemeConfig();
  const { isOnline } = useConnectivity();
  const [anchorEl, setAnchorEl] = useState(null);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const { logout, user } = useAuth();

  // Caminho da logo
  const logoPath = user?.matriz?.logo
    ? require(`../assets/logos/${user.matriz.logo}`)
    : require(`../assets/logos/default.png`);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path) => {
    handleMenuClose();
    navigate(path);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleThemeChange = () => {
    setThemeModalOpen(true);
    handleMenuClose();
  };

  const handleSync = () => {
    setSyncModalOpen(true);
    handleMenuClose();
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: themeSettings.navbarColor }}>
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Ícone do menu */}
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>

          {/* Logo + Nome da empresa */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img src={logoPath} alt="Logo" style={{ height: 40, width: 'auto' }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Horta Automatica
            </Typography>
          </Box>

          {/* Menu Dropdown */}
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => handleNavigate('/home')}>Página Inicial</MenuItem>
            <MenuItem onClick={() => handleNavigate('/clientes')}>Clientes</MenuItem>
            <MenuItem onClick={() => handleNavigate('/pedidos')}>Pedido</MenuItem>
            <MenuItem onClick={() => handleNavigate('/listaPreco')}>Lista Preço</MenuItem>
            <MenuItem onClick={handleSync}>
              <SyncIcon sx={{ marginRight: 1 }} /> Sincronizar Dados
            </MenuItem>
            <MenuItem onClick={handleThemeChange}>Selecionar Tema</MenuItem>
            <MenuItem onClick={handleLogout}>Sair</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Modal para configuração do tema */}
      {themeModalOpen && <ThemeModal onClose={() => setThemeModalOpen(false)} />}

      {/* Modal para sincronização de dados */}
      {syncModalOpen && <SyncModal onClose={() => setSyncModalOpen(false)} />}
    </>
  );
}

export default AndroidNavbar;
