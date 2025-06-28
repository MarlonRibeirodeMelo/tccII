import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useConnectivity } from '../contexts/ConnectivityProvider';
import { useNotification } from '../contexts/NotificationContext';
import { completeSync } from '../services/sync/completeDataSync';
import { format } from 'date-fns';

const SyncContext = createContext();

export const SyncProvider = ({ children }) => {
  const { user, setUser, isAuthenticated } = useAuth();
  const { isOnline } = useConnectivity();
  const { showNotification } = useNotification();

  // Inicialmente, carregamos do localStorage se “já sincronizou”.
  const [hasSynced, setHasSynced] = useState(
    localStorage.getItem('hasSyncedd') === 'true'
  );

  // Ref para prevenir chamadas simultâneas ao completeSync
  const syncRunningRef = useRef(false);

  /**
   * Função que realiza a sincronização completa.
   * Se o localStorage indicar que já sincronizou, a função não é executada.
   */
  const handleSync = async () => {
    // Se não há usuário logado ou se uma sincronização já está em andamento, aborta.
    if (!user || syncRunningRef.current) return;

    // Verifica diretamente no localStorage
    if (localStorage.getItem('hasSyncedd') === 'true') {
      console.log('Sincronização já realizada, ignorando...');
      return;
    }

    // Marca como em execução para prevenir chamadas simultâneas.
    syncRunningRef.current = true;
    try {
      // Atualiza o flag de sincronização no localStorage e no estado.
      localStorage.setItem('hasSyncedd', 'true');
      setHasSynced(true);

      showNotification('Iniciando sincronização completa...', 'info');
      await completeSync(showNotification, user);

      // Atualiza a data da última sincronização, se necessário.
      const novaDataSincronizacao = format(new Date(), 'dd/MM/yyyy HH:mm');
      setUser((prev) => ({
        ...prev,
        dataUltimaSincronizacao:
          prev?.dataUltimaSincronizacao !== novaDataSincronizacao
            ? novaDataSincronizacao
            : prev?.dataUltimaSincronizacao,
      }));

      showNotification('Sincronização concluída com sucesso!', 'success');
    } catch (error) {
      console.error('Erro na sincronização:', error);
      // Em caso de erro, reseta o flag para permitir nova tentativa.
      localStorage.removeItem('hasSyncedd');
      setHasSynced(false);
      showNotification('Erro na sincronização completa.', 'error');
    } finally {
      syncRunningRef.current = false;
    }
  };

  /**
   * useEffect para disparar a sincronização imediatamente
   * ao detectar que estamos online, há usuário logado e a autenticação é válida.
   */
  useEffect(() => {
    if (isOnline && user && isAuthenticated) {
      handleSync();
    }
  }, [isOnline, user, isAuthenticated]);

  /**
   * useEffect que, a cada 2 minutos, reseta o flag de sincronização
   * e dispara o handleSync se as condições (online, usuário, autenticação) forem atendidas.
   */
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('Resetando flag de sincronização');
      localStorage.removeItem('hasSyncedd');
      setHasSynced(false);

      if (isOnline && user && isAuthenticated) {
        handleSync();
      }
    }, 2 * 60 * 1000); // 2 minutos

    // Limpa o interval quando o componente for desmontado ou as dependências mudarem.
    return () => clearInterval(intervalId);
  }, [isOnline, user, isAuthenticated]);

  return (
    <SyncContext.Provider value={{}}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => useContext(SyncContext);
