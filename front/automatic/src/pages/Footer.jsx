import React, { useLayoutEffect, useState } from 'react';

export const Footer = () => {
  const [height, setHeight] = useState(50); // Valor padrão para altura

  useLayoutEffect(() => {
    const footerElement = document.querySelector('.footer-container');
    if (footerElement) {
      setHeight(footerElement.offsetHeight);
    }
  }, []);

  return (
    <div
      className="footer-container"
      style={{
        height: `${height}px`,
        width: '100%',
        backgroundColor: '#f0f0f0',
        borderTop: '1px solid #ddd',
        position: 'fixed',
        bottom: 0,
        left: 0,
        zIndex: 1000,
      }}
    >
      <p style={{ textAlign: 'center', padding: '10px 0' }}>Rodapé</p>
    </div>
  );
};
