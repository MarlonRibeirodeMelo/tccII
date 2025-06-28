import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormGroup,
  Checkbox,
  TextField,
  Box 
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import axios from "../../services/axios";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSnackbar } from "notistack";

const diasDaSemana = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

const DispositivosHistorico = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [dispositivos, setDispositivos] = useState([]);
  const [dispositivoSelecionado, setDispositivoSelecionado] = useState(null);
  const [leiturasDoDispositivo, setLeiturasDoDispositivo] = useState([]);

  const [openConfig, setOpenConfig] = useState(false);
  const [modoRega, setModoRega] = useState("automatica");
  const [diasSelecionados, setDiasSelecionados] = useState([]);
  const [horario, setHorario] = useState("06:00");

  const [ultimaChuva, setUltimaChuva] = useState(null);

  useEffect(() => {
    axios
      .get("/api/dispositivos")
      .then((res) => setDispositivos(res.data))
      .catch((err) => console.error("Erro ao buscar dispositivos:", err));
  }, []);

  const buscarLeituras = async (id) => {
    try {
      const res = await axios.get(`/api/leituras/listarUltimas/${id}`);
      setLeiturasDoDispositivo(res.data);
    } catch (err) {
      console.error("Erro ao buscar leituras:", err);
    }
  };

  useEffect(() => {
    if (!dispositivoSelecionado) return;
    buscarLeituras(dispositivoSelecionado);
    const interval = setInterval(() => buscarLeituras(dispositivoSelecionado), 20000);
    return () => clearInterval(interval);
  }, [dispositivoSelecionado]);

  useEffect(() => {
    const buscarUltimaChuva = async () => {
      try {
        const res = await axios.get("/api/leituras/listarUltimas/3");
        const leituraChuva = res.data.find(l => l.leitura1 === true);
        if (leituraChuva) {
          setUltimaChuva(leituraChuva.dataHora);
        }
      } catch (error) {
        console.error("Erro ao buscar última chuva:", error);
      }
    };
    buscarUltimaChuva();
  }, []);

  const handleAbrirConfiguracao = async () => {
    setOpenConfig(true);
    if (dispositivoSelecionado) {
      try {
        const res = await axios.get(`/api/configuracoes/rega/${dispositivoSelecionado}`);
        const cfg = res.data;
        setModoRega(cfg.modo || "automatica");
        setDiasSelecionados(cfg.diasSemana ? cfg.diasSemana.split(",") : []);
        setHorario(cfg.horario || "06:00");
      } catch (error) {
        console.error("Erro ao buscar configuração existente:", error);
      }
    }
  };

  const handleFecharConfiguracao = () => {
    setOpenConfig(false);
  };

  const handleSalvarConfiguracao = async () => {
    console.log('entro')    
    const config = {
      dispositivoId: dispositivoSelecionado,
      modo: modoRega,
      diasSemana: diasSelecionados.join(","),
      horario: horario,
    };
    try {
      await axios.post("/api/configuracoes/rega", config);
      enqueueSnackbar("Configuração salva com sucesso!", { variant: "success" });
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      enqueueSnackbar("Erro ao salvar configuração", { variant: "error" });
    }
    setOpenConfig(false);
  };

  const toggleDia = (dia) => {
    setDiasSelecionados((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  useEffect(() => {
    // Buscar a última configuração ao abrir a tela
    const carregarConfiguracaoInicial = async () => {
      try {
        const res = await axios.get("/api/configuracoes/rega");
        const cfg = res.data;
        if (cfg) {
          setModoRega(cfg.modo || "automatica");
          setDiasSelecionados(cfg.diasSemana ? cfg.diasSemana.split(",") : []);
          setHorario(cfg.horario || "06:00");
        } else {
          const configPadrao = {
            modo: "automatica",
            diasSemana: "",
            horario: "06:00",
          };
          await axios.post("/api/configuracoes/rega", configPadrao);
          enqueueSnackbar("Configuração padrão salva com sucesso!", { variant: "info" });
        }
      } catch (error) {
        console.error("Erro ao buscar ou salvar configuração inicial:", error);
      }
    };

    carregarConfiguracaoInicial();
  }, []);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-white overflow-y-auto">
      <Typography variant="h4" align="center" gutterBottom>
        Histórico de Leitura por Dispositivo
      </Typography>

      {ultimaChuva && (
        <Typography variant="subtitle1" align="center" gutterBottom>
          Última chuva registrada: {new Date(ultimaChuva).toLocaleString()}
        </Typography>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card className="shadow-xl rounded-2xl">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dispositivos
              </Typography>
              {dispositivos.map((d) => (
                <Button
                  key={d.id}
                  variant={d.id === dispositivoSelecionado ? "contained" : "outlined"}
                  onClick={() => setDispositivoSelecionado(d.id)}
                  className="w-full mb-2"
                  fullWidth
                >
                  {d.nome || `Dispositivo ${d.id}`}
                </Button>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          {dispositivoSelecionado && (
            <Card className="shadow-xl rounded-2xl">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Histórico do Dispositivo {dispositivoSelecionado}
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={leiturasDoDispositivo}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="dataHora"
                      tickFormatter={(v) => v?.substring(11, 16)}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `${value}`}
                      labelFormatter={(label) =>
                        `Horário: ${label?.substring(11, 16)}`
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="leitura1"
                      stroke="#1976d2"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

     <Box display="flex" justifyContent="center" sx={{ mt: 4, mb: 3 }}>
  <Button
    variant="contained"
    color="primary"
    startIcon={<SettingsIcon />}
    onClick={handleAbrirConfiguracao}
  >
    Configurar Rega
  </Button>
</Box>

      <Dialog open={openConfig} onClose={handleFecharConfiguracao} maxWidth="sm" fullWidth>
        <DialogTitle>Configuração de Rega</DialogTitle>
        <DialogContent dividers>
          <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Modo de Rega</Typography>
            <RadioGroup
              value={modoRega}
              onChange={(e) => setModoRega(e.target.value)}
            >
              <FormControlLabel value="automatica" control={<Radio />} label="Automática" />
              <FormControlLabel value="manual" control={<Radio />} label="Manual" />
              <FormControlLabel value="agendada" control={<Radio />} label="Agendada" />
            </RadioGroup>
          </FormControl>

          {modoRega === "agendada" && (
            <>
              <Typography variant="subtitle1" gutterBottom>Dias da Semana</Typography>
              <FormGroup row>
                {diasDaSemana.map((dia) => (
                  <FormControlLabel
                    key={dia}
                    control={
                      <Checkbox
                        checked={diasSelecionados.includes(dia)}
                        onChange={() => toggleDia(dia)}
                      />
                    }
                    label={dia}
                  />
                ))}
              </FormGroup>

              <TextField
                label="Horário"
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                fullWidth
                sx={{ mt: 3 }}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 60 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharConfiguracao}>Cancelar</Button>
          <Button variant="contained" onClick={handleSalvarConfiguracao}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DispositivosHistorico;