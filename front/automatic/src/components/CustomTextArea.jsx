// AutoResizeTextArea.js
import React from 'react';
import TextareaAutosize from '@mui/material/TextareaAutosize';

const AutoResizeTextArea = React.forwardRef((props, ref) => {
  return (
    <TextareaAutosize
      ref={ref}
      {...props}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        resize: 'none',            // Impede o redimensionamento manual
        overflow: 'auto',          // Mostra barra de rolagem se necessário
        whiteSpace: 'normal',      // Permite quebra de linha
        wordWrap: 'break-word',    // Força a quebra de palavras longas
        ...props.style,            // Mescla com estilos passados por props
      }}
    />
  );
});

export default AutoResizeTextArea;
