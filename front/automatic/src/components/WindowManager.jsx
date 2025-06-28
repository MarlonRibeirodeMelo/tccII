import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import RestoreIcon from '@mui/icons-material/Restore';
import MinimizeIcon from '@mui/icons-material/Minimize';
import { Rnd } from 'react-rnd';
import { useWindowManager } from '../contexts/WindowManagerContext';
import { useThemeConfig } from '../contexts/ThemeContext';
import throttle from 'lodash.throttle';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from '../components/Dashbord';
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

function WindowManager() {
  const { user } = useAuth();
  const logoPath = user?.matriz?.logo
    ? require(`../assets/logos/${user.matriz.logo}`)
    : require(`../assets/logos/default.png`);
  const siccloudLogo = require('../assets/logos/siccloud.png');
  const integraLogo = require('../assets/logos/integra.jpg');

  // Estados para refresh dos iframes e menus
  const [refreshKey, setRefreshKey] = useState({});
  const [menuAnchor, setMenuAnchor] = useState({ anchorEl: null, windowId: null });
  const [anchorEl, setAnchorEl] = useState(null); // menu de organização
  const [startMenuAnchor, setStartMenuAnchor] = useState(null);
  const [previewMaximizing, setPreviewMaximizing] = useState(null);
  const lastTapRef = useRef(0);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [prevWindowStates, setPrevWindowStates] = useState({});
  // Estados para o diálogo de confirmação
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTimer, setConfirmTimer] = useState(5);
  const { themeSettings } = useThemeConfig();
  const {
    windows,
    closeWindow,
    toggleMaximize,
    minimizeWindow,
    restoreWindow,
    updateWindowPosition,
    minimizeAllWindows,
    restoreAllWindows,
    bringToFront,
    focusedWindow,
    setFocusedWindow,
  } = useWindowManager();
  const prevOrientationRef = useRef(isPortrait);

  // CONSTANTE para a altura da navbar (em px)
  const navbarHeight = 60;

  // ====================== INTERCEPTAÇÃO DO F5 ======================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r')) {
        e.preventDefault();
        setConfirmTimer(5);
        setConfirmOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!confirmOpen) return;
    if (confirmTimer === 0) {
      setConfirmOpen(false);
      return;
    }

    const timerId = setInterval(() => {
      setConfirmTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [confirmOpen, confirmTimer]);

  useEffect(() => {}, [focusedWindow, setFocusedWindow]);

  const handleConfirmReload = () => {
    setConfirmOpen(false);
    window.location.reload();
  };

  const handleCancelReload = () => {
    setConfirmOpen(false);
  };

  // ================ AÇÕES DO MENU DE AÇÕES (TABLET) ================
  const handleOpenActionsMenu = (event, windowId) => {
    setMenuAnchor({ anchorEl: event.currentTarget, windowId });
  };
  const handleCloseActionsMenu = () => {
    setMenuAnchor({ anchorEl: null, windowId: null });
  };
  const handleMenuMinimize = () => {
    if (menuAnchor.windowId) {
      minimizeWindow(menuAnchor.windowId);
      handleCloseActionsMenu();
    }
  };
  const handleMenuMaximize = () => {
    if (menuAnchor.windowId) {
      toggleMaximize(menuAnchor.windowId);
      handleCloseActionsMenu();
    }
  };
  const handleMenuCloseWin = () => {
    if (menuAnchor.windowId) {
      closeWindow(menuAnchor.windowId);
      handleCloseActionsMenu();
    }
  };

  // ================ REFRESH IFRAME QUANDO TEMA MUDA ================
  const refreshIframe = (id) => {
    setRefreshKey((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };
  useEffect(() => {
    windows.forEach((win) => refreshIframe(win.id));
    // eslint-disable-next-line
  }, [themeSettings]);

  // ================ HANDLERS DE DRAG/RESIZE ================
  const handleDragStop = (win, data) => {
    updateWindowPosition(win.id, { x: data.x, y: data.y });
    bringToFront(win.id);
    setFocusedWindow(win.id);
  };
  const handleResizeStop = (win, ref, position) => {
    updateWindowPosition(win.id, {
      x: position.x,
      y: position.y,
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    });
    bringToFront(win.id);
    setFocusedWindow(win.id);
  };
  const handleWindowClick = (id) => {
    bringToFront(id);
    setFocusedWindow(id);
  };
  const handleDoubleClick = (id) => {
    toggleMaximize(id);
    bringToFront(id);
    setFocusedWindow(id);
  };
  const handleBarClick = (win) => {
    console.log('entro');
    if (win.isMaximized) {
      restoreWindow(win.id);
      minimizeWindow(win.id);
    } else if (win.isMinimized) {
      restoreWindow(win.id);
      setFocusedWindow(win.id);
    } else {
      minimizeWindow(win.id);
    }
  };

  const toggleAllWindows = () => {
    if (windows.every((win) => win.isMinimized)) {
      restoreAllWindows();
    } else {
      minimizeAllWindows();
    }
  };

  // ================ MENU DE ORGANIZAÇÃO ================
  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const arrangeCascade = () => {
    const availableWidth = window.innerWidth;
    // Agora subtrai a altura da navbar (seja qual for a posição)
    const availableHeight = window.innerHeight - navbarHeight;
    const offset = 30;
    windows.forEach((win, i) => {
      win.isMaximized = false;
      const newX = offset * i;
      const newY = offset * i;
      const newWidth = availableWidth - newX;
      const newHeight = availableHeight - newY;
      updateWindowPosition(
        win.id,
        { x: newX, y: newY, width: newWidth, height: newHeight },
        { skipAutoMaximize: true }
      );
    });
    handleCloseMenu();
  };

  const arrangeStacked = () => {
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight - navbarHeight;
    const windowHeight = availableHeight / windows.length;
    windows.forEach((win, i) => {
      win.isMaximized = false;
      updateWindowPosition(
        win.id,
        { x: 0, y: i * windowHeight, width: availableWidth, height: windowHeight },
        { skipAutoMaximize: true }
      );
    });
    handleCloseMenu();
  };

  const arrangeSideBySide = () => {
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight - navbarHeight;
    const windowWidth = availableWidth / windows.length;
    windows.forEach(async (win, i) => {
      win.isMaximized = false;
      await updateWindowPosition(
        win.id,
        {
          x: i * windowWidth,
          y: 0,
          width: windowWidth,
          height: availableHeight,
        },
        { skipAutoMaximize: true }
      );
    });
    handleCloseMenu();
  };

  // ================ DETECÇÃO DE ORIENTAÇÃO (TOUCH) ================
  useEffect(() => {
    if (isTouchDevice) {
      const handleResize = () => {
        setIsPortrait(window.innerHeight > window.innerWidth);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // ================ AÇÃO AO MUDAR A ORIENTAÇÃO ================
  useEffect(() => {
    if (isTouchDevice) {
      // Se não houver uma janela ativa, escolha a última (ou a primeira) como ativa
      let active = focusedWindow;
      if (!active && windows.length > 0) {
        active = windows[windows.length - 1].id;
        setFocusedWindow(active);
      }

      if (isPortrait) {
        windows.forEach((win) => {
          if (win.id === active) {
            if (!win.isMaximized) {
              toggleMaximize(win.id);
            }
          } else {
            if (!win.isMinimized) {
              minimizeWindow(win.id);
            }
          }
        });
      } else {
        // Restaura os estados anteriores ao voltar para paisagem
        Object.keys(prevWindowStates).forEach((winId) => {
          const savedState = prevWindowStates[winId];
          const win = windows.find((w) => w.id === winId);
          if (win) {
            if (savedState.isMaximized && !win.isMaximized) {
              toggleMaximize(winId);
            }
            if (!savedState.isMinimized && win.isMinimized) {
              restoreWindow(winId);
            }
          }
        });
        setPrevWindowStates({});
      }
    }
  }, [isPortrait, windows]);

  // ================ AJUSTE AUTOMÁTICO DO TAMANHO DAS JANELAS ================
  useEffect(() => {
    const handleAutoResize = () => {
      const availableWidth = window.innerWidth;
      const availableHeight = window.innerHeight - navbarHeight;
      windows.forEach((win) => {
        if (!win.isMaximized && !win.isMinimized) {
          let newWidth = win.size.width;
          let newHeight = win.size.height;
          if (newWidth > availableWidth) newWidth = availableWidth;
          if (newHeight > availableHeight) newHeight = availableHeight;
          if (newWidth !== win.size.width || newHeight !== win.size.height) {
            updateWindowPosition(win.id, { width: newWidth, height: newHeight });
          }
        }
      });
    };
    window.addEventListener('resize', handleAutoResize);
    return () => window.removeEventListener('resize', handleAutoResize);
  }, [windows, updateWindowPosition]);

  const handleTitleTouchEnd = (winId) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      toggleMaximize(winId);
    }
    lastTapRef.current = now;
  };

  const handleDragPreviewThrottled = useCallback(
    throttle((data, win) => {
      const screenWidth = window.innerWidth;
      const leftBoundary = screenWidth * 0.25;
      const rightBoundary = screenWidth * 0.75;
      const thresholdY = 10;
      const windowWidth = win.size?.width || 500;
      const windowCenterX = data.x + windowWidth / 2;

      if (
        data.y <= thresholdY &&
        windowCenterX >= leftBoundary &&
        windowCenterX <= rightBoundary
      ) {
        if (previewMaximizing !== win.id) {
          setPreviewMaximizing(win.id);
        }
      } else {
        if (previewMaximizing === win.id) {
          setPreviewMaximizing(null);
        }
      }
    }, 50),
    [previewMaximizing]
  );

  // ================ ESTILOS DO CONTAINER, CONSIDERANDO A POSIÇÃO DA NAVBAR ================
  const containerStyle =
    themeSettings.navbarPosition === 'top'
      ? {
          position: 'absolute',
          top: navbarHeight, // Deixa o espaço da navbar no topo
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: themeSettings.windowColor,
        }
      : {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: navbarHeight, // Deixa o espaço da navbar na parte inferior
          backgroundColor: themeSettings.windowColor,
        };

  return (
    <Box sx={containerStyle}>
      {/* BACKGROUND: Área de fundo com o logo central e, abaixo, os dois logos laterais */}
      <Dashboard />

      {/* Janelas (os elementos do Rnd ficam sobre o background) */}
      {windows.map((win) => (
        <Rnd
          key={win.id}
          bounds="parent"
          dragHandleClassName="window-drag-handle"
          enableResizing={!win.isMaximized}
          disableDragging={false}
          size={
            win.isMaximized
              ? { width: '100%', height: '100%' }
              : { width: win.size?.width || 500, height: win.size?.height || 300 }
          }
          position={
            win.isMaximized
              ? { x: 0, y: 0 }
              : { x: win.position?.x ?? 100, y: win.position?.y ?? 100 }
          }
          style={{
            display: win.isMinimized ? 'none' : 'flex',
            border: focusedWindow === win.id ? '2px solid #673AB7' : '1px solid #ccc',
            backgroundColor: themeSettings.windowColor,
            flexDirection: 'column',
            boxShadow:
              focusedWindow === win.id ? '0 4px 8px rgba(0, 0, 0, 0.5)' : 'none',
            outline: previewMaximizing === win.id ? '3px solid #00b0ff' : 'none',
            zIndex: win.zIndex + 1,
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
          onDrag={(e, data) => {
            handleDragPreviewThrottled(data, win);
          }}
          onDragStop={(e, data) => {
            const screenWidth = window.innerWidth;
            const leftBoundary = screenWidth * 0.25;
            const rightBoundary = screenWidth * 0.75;
            const thresholdY = 10;
            const windowWidth = win.size?.width || 500;
            const windowCenterX = data.x + windowWidth / 2;

            // Se o dispositivo não for touch, maximiza automaticamente se arrastar para o topo central
            if (!isTouchDevice) {
              if (
                data.y <= thresholdY &&
                windowCenterX >= leftBoundary &&
                windowCenterX <= rightBoundary
              ) {
                toggleMaximize(win.id);
                setPreviewMaximizing(null);
                return;
              }
            }
            setPreviewMaximizing(null);
            handleDragStop(win, data);
          }}
          onResizeStop={(e, direction, ref, delta, position) =>
            handleResizeStop(win, ref, position)
          }
        >
          {!(isTouchDevice && isPortrait) && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: themeSettings.navbarColor,
                color: 'white',
                padding: '2px',
                userSelect: 'none',
              }}
              {...(isTouchDevice
                ? { onTouchEnd: () => handleTitleTouchEnd(win.id) }
                : { onDoubleClick: () => handleDoubleClick(win.id) })}
            >
              <Box
                className="window-drag-handle"
                sx={{
                  flex: 1,
                  cursor: isTouchDevice ? 'default' : 'move',
                  touchAction: 'none',
                }}
              >
                <Typography sx={{ fontSize: isTouchDevice ? '0.8rem' : '1rem' }}>
                  {win.title || 'Nova Janela'}
                </Typography>
              </Box>
              {isTouchDevice ? (
                <IconButton
                  size="small"
                  onClick={(e) => handleOpenActionsMenu(e, win.id)}
                  sx={{ color: 'white', pointerEvents: 'auto' }}
                >
                  <MoreVertIcon />
                </IconButton>
              ) : (
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => minimizeWindow(win.id)}
                    sx={{ color: 'white' }}
                  >
                    <MinimizeIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDoubleClick(win.id)}
                    sx={{ color: 'white' }}
                  >
                    {win.isMaximized ? <RestoreIcon /> : <CropSquareIcon />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => closeWindow(win.id)}
                    sx={{ color: 'white' }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
          )}
          <Box sx={{ flex: 1 }}>
            <iframe
              key={refreshKey[win.id] || 0}
              src={win.content.props.src}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={win.title}
            />
          </Box>
        </Rnd>
      ))}

      {/* Menu de ações para tablet */}
      <Menu
        open={Boolean(menuAnchor.anchorEl)}
        anchorEl={menuAnchor.anchorEl}
        onClose={handleCloseActionsMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleMenuMinimize}>Minimizar</MenuItem>
        <MenuItem onClick={handleMenuMaximize}>
          {windows.find((w) => w.id === menuAnchor.windowId)?.isMaximized
            ? 'Restaurar'
            : 'Maximizar'}
        </MenuItem>
        <MenuItem onClick={handleMenuCloseWin} sx={{ color: 'red' }}>
          Fechar
        </MenuItem>
      </Menu>

      <Dialog open={confirmOpen} onClose={handleCancelReload}>
        <DialogTitle>Confirmar Atualização</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você deseja atualizar a página? Esta ação será confirmada automaticamente em {confirmTimer}{' '}
            segundo(s).
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelReload} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmReload} color="secondary" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default WindowManager;
