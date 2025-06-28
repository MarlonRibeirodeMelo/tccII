import React, { useState, useRef } from 'react';
import { useGesture } from '@use-gesture/react';

const PinchZoom = ({ children }) => {
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(scale); // Referência para armazenar o estado atual do zoom

  // Atualiza o estado de escala e mantém o valor na referência
  const updateScale = (newScale) => {
    const clampedScale = Math.max(1, Math.min(newScale, 3)); // Limita o zoom entre 1x e 3x
    setScale(clampedScale);
    scaleRef.current = clampedScale;
  };

  // Configuração de gestos
  const bind = useGesture({
    onPinch: ({ offset: [distance] }) => {
      updateScale(1 + distance / 100);
    },
  });

  // Função para aumentar o zoom
  const handleZoomIn = () => {
    updateScale(scaleRef.current + 0.2); // Incrementa 0.2 no zoom atual
  };

  // Função para diminuir o zoom
  const handleZoomOut = () => {
    updateScale(scaleRef.current - 0.2); // Decrementa 0.2 no zoom atual
  };

  return (
    <div
      {...bind()}
      style={{
        transform: `scale(${scale})`,
        touchAction: 'none', // Previne comportamento padrão de toque
        width: '100%',
        height: '100%',
        overflow: 'hidden', // Garante que o conteúdo não ultrapasse os limites
        position: 'relative',
      }}
    >
      {/* Botões de controle de zoom */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          display: 'flex',
          gap: '5px',
        }}
      >
        <button
          onClick={handleZoomIn}
          style={{
            backgroundColor: '#673AB7',
            color: 'white',
            border: 'none',
            padding: '8px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          style={{
            backgroundColor: '#673AB7',
            color: 'white',
            border: 'none',
            padding: '8px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          -
        </button>
      </div>

      {children}
    </div>
  );
};

export default PinchZoom;
