import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { completeSync } from '../services/sync/completeDataSync';
import { syncDataFromDB } from '../services/sync/completeDataSync';
import { useAuth } from '../contexts/AuthContext';
import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';
import { format } from 'date-fns';
const ConnectivityContext = createContext();

export const ConnectivityProvider = ({ children }) => {
   const { logout, user,setUser,isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const [isOnline, setIsOnline] = useState(false);

  
 
    

  const handleSync = async () => {
    const hasSynced = localStorage.getItem('hasSynced');

    if (hasSynced === 'true') {
      console.log('Sincronização já realizada, ignorando...');
      return;
    }

    try {
      localStorage.setItem('hasSynced', 'true'); // Marca a sincronização como realizada
      showNotification('Iniciando sincronização completa...', 'info');
      await completeSync(showNotification, user); // Sincronização principal
      const novaDataSincronizacao = format(new Date(), 'dd/MM/yyyy HH:mm');
     
      // **Atualizar estado do usuário globalmente**
      setUser((prevUser) => ({
          ...prevUser,
          dataUltimaSincronizacao: novaDataSincronizacao,
      }));
      
      //await syncDataFromDB(user); // Chama o syncDataFromDB para sincronização adicional
      showNotification('Sincronização concluída com sucesso!', 'success');
    } catch (error) {
      console.error('Erro na sincronização:', error);
      showNotification('Erro na sincronização completa.', 'error');
      localStorage.removeItem('hasSynced'); // Permite nova tentativa em caso de erro
    }
  };

  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();

    const handleOnline = async () => {
      setIsOnline(true);
      await handleSync(); // Dispara a sincronização ao ficar online
    };

    const handleOffline = () => {
      localStorage.setItem('hasSynced', 'false');
      setIsOnline(false);
      showNotification('Você está offline!', 'warning');
    };

    const initializeConnectivity = async () => {
      if (isNative) {
        const status = await Network.getStatus();
        setIsOnline(status.connected);

        const listener = Network.addListener('networkStatusChange', (status) => {
          setIsOnline(status.connected);
          if (status.connected) {
            handleOnline();
          } else {
            handleOffline();
          }
        });

        return () => listener.remove();
      } else {
        setIsOnline(navigator.onLine);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      }
    };

    const cleanup = initializeConnectivity();

    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [user]);

  return (
    <ConnectivityContext.Provider value={{ isOnline }}>
      {children}
    </ConnectivityContext.Provider>
  );
};

export const useConnectivity = () => useContext(ConnectivityContext);
