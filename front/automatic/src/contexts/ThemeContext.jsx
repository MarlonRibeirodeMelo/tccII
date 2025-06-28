import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import db from '../services/db';

const ThemeContext = createContext();

export const useThemeConfig = () => useContext(ThemeContext);

export function ThemeProviderComponent({ children }) {
  const [themeSettings, setThemeSettings] = useState(null); // Define inicialmente como `null`

  // Carregar configurações do banco de dados ao iniciar
  useEffect(() => {
    async function loadTheme() {
      try {
        const savedTheme = await db.themeSettings.get('default');
        if (savedTheme) {
          setThemeSettings(savedTheme);
        } else {
          // Se não existir, definir valores padrão e salvar
          const defaultSettings = {
            id: 'default',
            mode: 'light',
            navbarColor: '#673AB7',
            windowColor: '#FFFFFF',
            fontSize: 14,
          };
          await db.themeSettings.put(defaultSettings);
          setThemeSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações de tema:', error);
      }
    }
    loadTheme();
  }, []);

  function getContrastingTextColor(backgroundColor) {
    try {
      const color = backgroundColor.replace('#', '');
      const r = parseInt(color.substring(0, 2), 16) / 255;
      const g = parseInt(color.substring(2, 4), 16) / 255;
      const b = parseInt(color.substring(4, 6), 16) / 255;
  
      const luminance = (channel) =>
        channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
      const relativeLuminance = 0.2126 * luminance(r) + 0.7152 * luminance(g) + 0.0722 * luminance(b);
  
      return relativeLuminance > 0.5 ? '#000000' : '#FFFFFF';
    } catch (error) {
      console.error('Erro ao calcular cor contrastante:', error);
      return '#000000'; // Valor padrão seguro
    }
  }

  
  // Atualizar configurações no banco de dados
  const updateTheme = async (newSettings) => {
    try {
      const updatedSettings = { ...themeSettings, ...newSettings };
  
      if (updatedSettings.mode === 'custom') {
        // No modo personalizado, calcula automaticamente o texto baseado nas cores fornecidas
        updatedSettings.textColor = getContrastingTextColor(updatedSettings.navbarColor);
        updatedSettings.windowTextColor = getContrastingTextColor(updatedSettings.windowColor);
      } else if (updatedSettings.mode === 'light') {
        // Configurações para o modo claro
        updatedSettings.navbarColor = '#673AB7';
        updatedSettings.windowColor = '#FFFFFF';
        updatedSettings.textColor = '#000000';
        delete updatedSettings.windowTextColor; // Remove valores exclusivos do modo "custom"
      } else if (updatedSettings.mode === 'dark') {
        // Configurações para o modo escuro
        updatedSettings.navbarColor = '#333333';
        updatedSettings.windowColor = '#121212';
        updatedSettings.textColor = '#FFFFFF';
        delete updatedSettings.windowTextColor; // Remove valores exclusivos do modo "custom"
      }
  
      setThemeSettings(updatedSettings);
      await db.themeSettings.put({ ...updatedSettings, id: 'default' });
  
      console.log('Tema atualizado com sucesso:', updatedSettings);
    } catch (error) {
      console.error('Erro ao atualizar configurações de tema:', error);
    }
  };

  // 📌 Evita renderizar antes de carregar as configurações
  if (!themeSettings) {
    return <CssBaseline />; 
  }

  const theme = createTheme({
    palette: {
      mode: themeSettings?.mode === 'dark' ? 'dark' : 'light',
      primary: {
        main: themeSettings?.navbarColor || '#673AB7',
      },
      background: {
        default: themeSettings?.windowColor || '#FFFFFF',
        paper:
          themeSettings?.mode === 'dark'
            ? '#1E1E1E'
            : themeSettings?.windowColor || '#FFFFFF',
      },
      text: {
        primary: themeSettings?.textColor || '#000000',
        secondary: themeSettings?.mode === 'dark' ? '#FFFFFF' : '#6E6E6E',
      },
    },
    typography: {
      fontSize: themeSettings?.fontSize || 14,
    },
    components: {
      MuiInputLabel: {
        styleOverrides: {
          root: {
            // Define a cor da label com base no modo: branco para dark e '#6E6E6E' para light
            color: themeSettings?.mode === 'dark' ? '#FFFFFF' : '#6E6E6E',
            '&.Mui-focused': {
              color: themeSettings?.navbarColor || '#673AB7',
            },
            '&.Mui-error': {
              color: '#FF1744',
            },
          },
          shrink: ({ ownerState, theme }) => ({
            color: theme.palette.mode === 'dark' ? '#FFFFFF' : themeSettings?.navbarColor || '#673AB7',
          }),
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '& fieldset': {
              borderColor: themeSettings?.mode === 'dark' ? '#B0B0B0' : '#6E6E6E',
            },
            '&:hover fieldset': {
              borderColor: themeSettings?.mode === 'dark' ? '#FFFFFF' : '#000000',
            },
            '&.Mui-focused fieldset': {
              borderColor: themeSettings?.navbarColor || '#673AB7',
            },
          },
        },
      },
    },
  });
  
  
  
  
  
  

  return (
    <ThemeContext.Provider value={{ themeSettings, updateTheme, theme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
