import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/axios';
import { completeSync } from '../services/sync/completeDataSync';
import { useNotification } from '../contexts/NotificationContext';
import db from '../services/db';
import { encryptData, decryptData } from '../services/cryptoUtils';
import { format } from 'date-fns';
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const { showNotification } = useNotification();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restaurar sessão
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const storedUser = await db.currentUser.get('currentUser');
                if (storedUser) {
                    const vendedor = await db.vendedorModel.get(storedUser.vendedorModelId);

                    const restoredUser = {
                        token: decryptData(storedUser.token),
                        empresa: decryptData(storedUser.empresa),
                        matriz: decryptData(storedUser.matriz),
                        vendedorModel: vendedor,
                        dataUltimaSincronizacao:storedUser.dataUltimaSincronizacao
                    };

                    setIsAuthenticated(true);
                    setUser(restoredUser);
                    setSelectedCompany(decryptData(storedUser.selectedCompany) || null);

                    // Atualiza o estado no localStorage
                    localStorage.setItem('isAuthenticated', 'true');
                }
            } catch (error) {
                console.error('Erro ao restaurar sessão:', error);
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);

    // Sincronizar estado com localStorage
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'isAuthenticated' && event.newValue === 'false') {
                setIsAuthenticated(false);
                setUser(null);
                setSelectedCompany(null);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = async (credentials) => {
        try {
            console.log('entrou')
            const response = await api.post('/auth/login', credentials);
            const loginData = response.data;
    
          
           
            
           
            const currentUserData = {
                id: 'currentUser',
                token: encryptData(loginData.token),  
              
               
             
            };
    
            await db.currentUser.put(currentUserData);
          
    
            localStorage.setItem('isAuthenticated', 'true'); // Atualiza estado no localStorage
    
          
            setIsAuthenticated(true);
            setUser({
                username: loginData.login,
                ...loginData,
            });
    
        } catch (authError) {
            // Extrai a mensagem de erro corretamente
            const errorMessage = authError.response?.data?.message || 'Usuário ou senha inválidos.';
            console.error('Erro de autenticação:', authError);
    
            showNotification(errorMessage, 'error'); // Exibe apenas a string da mensagem
            throw new Error(errorMessage);
        }
    };
    

    const logout = async () => {
        setIsAuthenticated(false);
        setUser(null);

        try {
            await db.currentUser.delete('currentUser');
            localStorage.setItem('isAuthenticated', 'false'); // Atualiza estado no localStorage
        } catch (error) {
            console.error('Erro ao limpar dados do IndexedDB:', error);
        }
    };

    if (isLoading) {
        return <div>Carregando...</div>;
    }

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                selectedCompany,
                login,
                logout,
                setUser
                
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
