// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from '../services/axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Button,
  useTheme,
} from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterfallChartIcon from '@mui/icons-material/WaterfallChart';
import OpacityIcon from '@mui/icons-material/Opacity';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useThemeConfig } from '../contexts/ThemeContext';

const Dashboard = () => {
  const { themeSettings } = useThemeConfig();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [leituras, setLeituras] = useState([]);
  const [umidadeSoloAtual, setUmidadeSoloAtual] = useState(null);
  const [loadingIrrigar, setLoadingIrrigar] = useState(false);
  const [msgIrrigacao, setMsgIrrigacao] = useState('');

  useEffect(() => {
    const buscarLeituras = () => {
      axios
        .get('/api/leituras/listarUltimas/1')
        .then((res) => {
          const dadosFormatados = res.data.map((item) => ({
            dataHora: item.dataHora?.substring(11, 16),
            temperatura: item.leitura1,
          }));
          setLeituras(dadosFormatados);
        })
        .catch((err) => {
          console.error('Erro ao buscar leituras de temperatura:', err);
        });

      axios
        .get('/api/leituras/listarUltimas/2')
        .then((res) => {
          if (res.data.length > 0) {
            setUmidadeSoloAtual(res.data[0].leitura1);
          }
        })
        .catch((err) => {
          console.error('Erro ao buscar umidade atual do solo:', err);
        });
    };

    buscarLeituras();
    const intervalo = setInterval(buscarLeituras, 30000);
    return () => clearInterval(intervalo);
  }, []);

  const handleIrrigar = async () => {
    setLoadingIrrigar(true);
    setMsgIrrigacao('');
    try {
      const res = await axios.post('/api/acoes/hirrigarHorta');
      setMsgIrrigacao('✅ Irrigação iniciada com sucesso!');
    } catch (err) {
      console.error('Erro ao iniciar irrigação:', err);
      setMsgIrrigacao('❌ Falha ao iniciar irrigação.');
    } finally {
      setLoadingIrrigar(false);
    }
  };

  const containerBg = isDark ? '#121212' : themeSettings.windowColor || '#f5f5f5';
  const cardBg = isDark ? '#1e1e1e' : themeSettings.windowColor || '#fff';
  const textColor = isDark ? '#fff' : themeSettings.textColor || '#000';
  const accentColor = themeSettings.navbarColor || (isDark ? '#BB86FC' : '#1976d2');

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: containerBg,
        height: '100%',
        color: textColor,
        overflowY: 'auto',
      }}
    >
      <Typography variant="h4" align="center" gutterBottom color={accentColor}>
        Dashboard Horta Automática
      </Typography>

      <Grid container spacing={4}>
        {/* Gráfico de Temperatura */}
        <Grid item xs={12}>
          <Card sx={{ backgroundColor: cardBg, border: `1px solid ${accentColor}`, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ThermostatIcon fontSize="large" sx={{ mr: 1, color: accentColor }} />
                <Typography variant="h6" fontWeight="bold" color={accentColor}>
                  Histórico de Temperatura
                </Typography>
              </Box>
              <Divider sx={{ mb: 2, borderColor: accentColor }} />
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={leituras} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <Line
                    type="monotone"
                    dataKey="temperatura"
                    stroke={accentColor}
                    strokeWidth={2}
                  />
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dataHora" stroke={textColor} />
                  <YAxis stroke={textColor} unit="°C" />
                  <Tooltip formatter={(value) => `${value}°C`} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Umidade do Solo (Atual) + Botão de Irrigação */}
        <Grid item xs={12}>
          <Card sx={{ backgroundColor: cardBg, border: `1px solid ${accentColor}`, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WaterfallChartIcon fontSize="large" sx={{ mr: 1, color: accentColor }} />
                <Typography variant="h6" fontWeight="bold" color={accentColor}>
                  Umidade do Solo (Atual)
                </Typography>
              </Box>
              <Divider sx={{ mb: 2, borderColor: accentColor }} />
              {umidadeSoloAtual === null ? (
                <Typography>Carregando...</Typography>
              ) : (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="h4">
                    {umidadeSoloAtual.toFixed(1)}%
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ mt: 1, color: umidadeSoloAtual >= 50 ? 'green' : 'orange' }}
                  >
                    {umidadeSoloAtual >= 50 ? '🌱 Solo Úmido' : '🌵 Solo Seco'}
                  </Typography>
                </Box>
              )}

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  startIcon={<OpacityIcon />}
                  onClick={handleIrrigar}
                  disabled={loadingIrrigar}
                  sx={{
                    backgroundColor: accentColor,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  {loadingIrrigar ? 'Aguarde...' : 'Iniciar Irrigação'}
                </Button>
                {msgIrrigacao && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {msgIrrigacao}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
