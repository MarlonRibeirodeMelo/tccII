import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';

const WindowManagerContext = createContext();
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
export const useWindowManager = () => useContext(WindowManagerContext);

export function WindowManagerProvider({ children }) {
      const [focusedWindow, setFocusedWindow] = useState(null);  
  const [windows, setWindows] = useState([]);
  // Contador global para evitar uso frequente de Math.max(...zIndexes)
  const zIndexRef = useRef(1);

  // Exemplo de refreshKey caso use iframes
  const [refreshKey, setRefreshKey] = useState({});

  // ====================================
  // 1. Lógica de persistência em localStorage (opcional)
  // ====================================
  useEffect(() => {
    const savedWindows = localStorage.getItem('windows');
    if (savedWindows) {
      setWindows(JSON.parse(savedWindows));
    }
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      localStorage.setItem('windows', JSON.stringify(windows));
    }, 500); // 0.5s de debounce
    return () => clearTimeout(handle);
  }, [windows]);
  

  // ====================================
  // 2. Ajuste automático em resize/orientação (para janelas maximizadas)
  // ====================================
  useEffect(() => {
    const handleResize = () => {
      const footerHeight = getFooterHeight();
      setWindows((prev) =>
        prev.map((win) => {
          if (win.isMaximized) {
            return {
              ...win,
              size: {
                width: window.innerWidth,
                height: window.innerHeight - footerHeight,
              },
              position: { x: 0, y: 0 },
            };
          }
          return win;
        })
      );
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ====================================
  // 3. Métodos auxiliares
  // ====================================
  const getFooterHeight = () => {
    // Ajuste o seletor de acordo com seu footer
    const footerElement = document.querySelector('.MuiBox-root.css-bs96na');
    return footerElement ? footerElement.offsetHeight : 65;
  };

  const refreshIframe = (id) => {
    // Exemplo para forçar refresh de um iframe específico
    setRefreshKey((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  // ====================================
  // 4. Ações do WindowManager
  // ====================================

  // Abrir nova janela  
  // Aqui, antes de abrir a nova janela, verificamos se estamos em modo retrato.
  // Se sim, minimizamos todas as janelas existentes e abrimos a nova já em modo maximizado.
  const openWindow = (id, title, content) => {
    console.log('aqui')
    const isPortrait = window.innerHeight > window.innerWidth;
    
    setWindows((prev) => {
      // Se já existe uma janela com esse id, traz para frente e atualiza seu estado.
      if (prev.some((w) => w.id === id)) {
        return prev.map((win) => {
          if (win.id === id) {
            zIndexRef.current += 1;
            setFocusedWindow(win.id)
            win.isMinimized=false;
            win.isMaximized=true;
            win.size= isPortrait
            ? {
                width: window.innerWidth,
                height: window.innerHeight - getFooterHeight(),
              }
            : win.size
            return win;
           /* return {
              ...win,
              // Restaura a janela (não minimizada) e, em retrato, garante que ela seja maximizada
              isMinimized: false,
              isMaximized: true,
              zIndex: zIndexRef.current,
              // Se estiver em retrato, força a posição e tamanho para ocupar toda a área
              size: isPortrait
                ? {
                    width: window.innerWidth,
                    height: window.innerHeight - getFooterHeight(),
                  }
                : win.size,
              position: isPortrait ? { x: 0, y: 0 } : win.position,
            };*/
                    
             } else  {
            // Em retrato, as outras janelas serão minimizadas.
            return { ...win, isMinimized: true, zIndex: 0 };
          }
          return win;
        });
      }
  
      // Se não existir, e se estivermos em retrato, minimiza todas as janelas existentes
      let newWindows = prev;
      if (isPortrait) {
        newWindows = prev.map((win) => ({ ...win, isMinimized: true, zIndex: 0 }));
      }
      zIndexRef.current += 1;
      return [
        ...newWindows,
        { 
          id,
          title,
          content,
          // Em retrato, a nova janela abre maximizada; caso contrário, com tamanho padrão.
          isMaximized: isPortrait,
          isMinimized: false,
          size: isPortrait
            ? {
                width: window.innerWidth,
                height: window.innerHeight - getFooterHeight(),
              }
            : { width: 600, height: 700 },
          position: isPortrait ? { x: 0, y: 0 } : { x: 65, y: 65 },
          zIndex: zIndexRef.current,
        },
      ];
    });
  };
  

  // Fechar janela
  const closeWindow = (id) => {
    setWindows((prev) => prev.filter((win) => win.id !== id));
  };

  // Minimizar apenas uma
  const minimizeWindow = (id) => {
    setWindows((prev) =>
      prev.map((win) =>
        win.id === id ? { ...win, isMinimized: true,isMaximized:false, zIndex: 0 } : win
      )
    );
  };

  // Restaurar apenas uma (se estiver minimizada)
  const restoreWindow = (id) => {
    zIndexRef.current += 1;
    setWindows((prev) =>
      prev.map((win) =>
        win.id === id
          ? { ...win, isMinimized: false, zIndex: zIndexRef.current }
          : win
      )
    );
  };

  // Minimizar todas
  const minimizeAllWindows = () => {
    setWindows((prev) =>
      prev.map((win) => ({
        ...win,
        isMinimized: true,
        zIndex: 0,
      }))
    );
  };

  // Restaurar todas
  const restoreAllWindows = () => {
    zIndexRef.current += 1;
    setWindows((prev) =>
      prev.map((win) => ({
        ...win,
        isMinimized: false,
        zIndex: zIndexRef.current,
      }))
    );
  };

  // Maximize/restaura
  const toggleMaximize = (id) => {
    zIndexRef.current += 1;
    setWindows((prev) =>
      prev.map((win) => {
        if (win.id !== id) return win;

        if (win.isMaximized) {
          // Restaura
          return {
            ...win,
            isMaximized: false,
            size: { width: 500, height: 400 },
            position: { x: 50, y: 50 },
            zIndex: zIndexRef.current,
          };
        } else {
          // Maximiza
          const footerHeight = getFooterHeight();
          return {
            ...win,
            isMaximized: true,
            size: {
              width: window.innerWidth,
              height: window.innerHeight - footerHeight,
            },
            position: { x: 0, y: 0 },
            zIndex: zIndexRef.current,
          };
        }
      })
    );
  };

  // Atualizar posição e/ou tamanho da janela
  // (por exemplo, após drag ou resize). Sem "clamp"
  // para permitir chegar no canto da tela.
  const updateWindowPosition = (id, position, options = {}) => {
    console.log('rta')
    setWindows((prev) =>
      prev.map((win) => {
        if (win.id !== id) return win;
  
      
        // Determina o novo valor de y:
        // Se a propriedade 'y' foi passada explicitamente, use-a; 
        // caso contrário, mantenha a posição atual.
        const newY = "y" in position ? position.y : win.position.y;
  
        // Aplica auto-maximização somente se:
        // 1. Não estivermos ignorando (skipAutoMaximize),
        // 2. O novo valor de y for 0,
        // 3. E a janela NÃO estava já no topo (win.position.y !== 0).
        if (!isTouchDevice && 
          !options.skipAutoMaximize && 
          newY === 0 && 
          win.position.y !== 0){
      
          zIndexRef.current += 1;
          const footerHeight = getFooterHeight();
         
          return {
            ...win,
            isMaximized: false,
            isMinimized:false,
            size: {
              width: window.innerWidth,
              height: window.innerHeight - footerHeight,
            },
            position: { x: 0, y: 0 },
            zIndex: zIndexRef.current,
          };
        }
        
        // Atualiza posição e tamanho conforme informado
        return {
          ...win,
          position: {
            x: "x" in position ? position.x : win.position.x,
            y: "y" in position ? position.y : win.position.y,
          },
          size: {
            width: position.width || win.size.width,
            height: position.height || win.size.height,
          },
        };
      })
    );
  };

   const restoreWindowState = (winId, savedState) => {
      setWindows((prev) =>
        prev.map((win) =>
          win.id === winId
            ? {
                ...win,
                size: savedState.size,
                position: savedState.position,
                isMaximized: savedState.isMaximized,
                isMinimized: savedState.isMinimized,
              }
            : win
        )
      );
    };

    
  
  // Exemplo: se você quiser "clicar" e trazer para frente:
  const bringToFront = (id) => {
    zIndexRef.current += 1;
    setWindows((prev) =>
      prev.map((win) =>
        win.id === id ? { ...win, zIndex: zIndexRef.current } : win
      )
    );
  };

  // ====================================
  // 5. Retorno do Provider
  // ====================================
  return (
    <WindowManagerContext.Provider
      value={{
        // Estado principal
        windows,

        // Métodos p/ manipular janelas individualmente
        openWindow,
        closeWindow,
        minimizeWindow,
        restoreWindow,
        toggleMaximize,
        updateWindowPosition,

        // Métodos p/ manipular janelas em lote
        minimizeAllWindows,
        restoreAllWindows,
        restoreWindowState,
        // Auxiliares
        refreshIframe,
        bringToFront,
        focusedWindow,
        setFocusedWindow
      }}
    >
      {children}
    </WindowManagerContext.Provider>
  );
}
