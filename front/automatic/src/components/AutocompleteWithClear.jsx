import React, { useState, useEffect } from 'react';
import {
  TextField,
  IconButton,
  ListItem,
  Typography,
  Box,
  Paper,
  Grid,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { useThemeConfig } from '../contexts/ThemeContext';
import AutoResizeTextArea from './CustomTextArea'; // importe o componente criado

const AutocompleteWithClear = ({
  label,
  options,
  displayField,
  getOptionLabel,
  value,
  onChange,
  onSelect,
  onClear,
  required = false,
  disabled = false,
  multiline = false, // comportamento padrão fora do Android
  rows = 2,          // número mínimo de linhas desejado
}) => {
  const { themeSettings, theme } = useThemeConfig() || {};
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isTouched, setIsTouched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Detecta se o dispositivo é Android
  const isAndroid ='ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  useEffect(() => {
    if (value) {
      const displayValue = getOptionLabel
        ? getOptionLabel(value)
        : typeof value === 'string'
        ? value
        : value[displayField];
      setInputValue(displayValue || '');
    } else {
      setInputValue('');
    }
  }, [value, displayField, getOptionLabel]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue) {
      const lowerValue = newValue.toLowerCase();
      const filtered = options.filter((option) => {
        const optionValue = getOptionLabel
          ? getOptionLabel(option)
          : typeof option === 'string'
          ? option
          : option[displayField];
        return optionValue?.toLowerCase().includes(lowerValue);
      });
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions([]);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setFilteredOptions([]);
    if (onClear) onClear();
    if (onChange) onChange(null);
  };

  const handleSelect = (option) => {
    const selectedValue = getOptionLabel
      ? getOptionLabel(option)
      : typeof option === 'string'
      ? option
      : option[displayField];
    setInputValue(selectedValue);
    setFilteredOptions([]);
    setIsFocused(false);

    if (onSelect) onSelect(option);
    if (onChange) onChange(option);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (!inputValue) {
      setFilteredOptions(options);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setFilteredOptions([]);
      setIsFocused(false);
    }, 150);
  };

  const isError = required && isTouched && !inputValue;

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={10}>
          <TextField
            label={label}
            variant="outlined"
            fullWidth
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required={required}
            disabled={disabled}
            error={isError}
            InputProps={{
              autoComplete: 'off',
              // Se for Android, utiliza o AutoResizeTextArea para autoajuste
              ...(isAndroid && {
                inputComponent: AutoResizeTextArea,
                inputProps: { minRows: rows },
              }),
            }}
         
            {...(!isAndroid && multiline ? { multiline: true, rows } : {})}
          />
        </Grid>

        <Grid item xs={2}>
          <IconButton
            onClick={handleClear}
            disabled={disabled}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            <ClearIcon
              sx={{
                color: themeSettings?.mode === 'dark' ? '#FFFFFF' : '#000',
              }}
            />
            <Typography variant="caption" sx={{ mt: 0.5 }} noWrap>
              LIMPAR
            </Typography>
          </IconButton>
        </Grid>
      </Grid>

      {isFocused && filteredOptions.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: 200,
            overflowY: 'auto',
            backgroundColor:
              themeSettings?.mode === 'dark'
                ? '#333333'
                : themeSettings?.mode === 'custom'
                ? themeSettings.windowColor || '#ffffff'
                : '#ffffff',
            border: `1px solid ${theme?.palette?.primary?.main || '#673AB7'}`,
            zIndex: 10,
            boxShadow: '0px 4px 6px rgba(0,0,0,0.2)',
          }}
        >
          {filteredOptions.map((option, index) => (
            <ListItem
              key={option.id || index}
              button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(option)}
              sx={{
                backgroundColor:
                  themeSettings?.mode === 'dark'
                    ? '#424242'
                    : themeSettings?.mode === 'custom'
                    ? themeSettings.windowColor || '#ffffff'
                    : '#ffffff',
                '&:hover': {
                  backgroundColor: theme?.palette?.action?.hover || '#EEE',
                },
              }}
            >
              <Typography
                sx={{
                  color:
                    themeSettings?.mode === 'dark'
                      ? '#FFFFFF'
                      : theme?.palette?.text?.primary || '#000',
                }}
              >
                {getOptionLabel
                  ? getOptionLabel(option)
                  : typeof option === 'string'
                  ? option
                  : option[displayField] || 'Opção não definida'}
              </Typography>
            </ListItem>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default AutocompleteWithClear;
