import { useState, useEffect } from 'react';

export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.screen.width, // Usa `screen.width` em vez de `window.innerWidth`
    height: window.screen.height,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.screen.width,
        height: window.screen.height,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return screenSize;
};
