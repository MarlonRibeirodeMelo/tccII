import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, CircularProgress, Button } from '@mui/material';
import { useConnectivity } from '../contexts/ConnectivityProvider';
import { completeSync }from '../services/sync/completeDataSync'
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
function SyncModal({ onClose }) {
  const { isOnline } = useConnectivity();
  const [loading, setLoading] = useState(true);
  const [confirmEnabled, setConfirmEnabled] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Sincronizando dados...');
  const { logout, user, setUser } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    let timer;

    if (isOnline) {
      // Inicia a sincronização quando o modal é aberto
      completeSync(showNotification,user)
        .then(() => {
          setSyncStatus('Sincronização concluída!');
        })
        .catch(() => {
          setSyncStatus('Erro ao sincronizar.');
        })
        .finally(() => {
          // Espera 5 segundos antes de liberar o botão "OK"
          
            setConfirmEnabled(true);
            setLoading(false);
         
        });
    } else {
      // Se estiver offline, apenas exibe a mensagem
      setSyncStatus('Você está offline!');
      setConfirmEnabled(true)
      
    }

    return () => clearTimeout(timer);
  }, [isOnline]);

  return (
    <Dialog open={true} onClose={confirmEnabled ? onClose : null} maxWidth="sm" fullWidth>
      <DialogTitle>Sincronização de Dados</DialogTitle>
      <DialogContent sx={{ textAlign: 'center', padding: 3 }}>
        <Typography>{syncStatus}</Typography>
        {loading && isOnline && <CircularProgress sx={{ marginTop: 2 }} />}
      </DialogContent>
      <Button 
        onClick={onClose} 
        disabled={!confirmEnabled} 
        variant="contained" 
        color="primary" 
        sx={{ margin: '10px auto', display: 'block' }}
      >
        OK
      </Button>
    </Dialog>
  );
}

export default SyncModal;
