import axios from 'axios';
import db from './db'; // Importe seu serviço de IndexedDB
import { encryptData, decryptData } from './cryptoUtils';
// Criar uma instância do Axios
const api = axios.create({
baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8564/',
 //baseURL: process.env.REACT_APP_API_URL || 'https://rest.integracenter.com.br/mobile',
});

// Função para buscar o token do IndexedDB
const getTokenFromDB = async () => {
  try {
    const currentUser = await db.currentUser.get('currentUser');
    if(currentUser){
const restoredUser = {
                            token: decryptData(currentUser.token),
                            empresa: decryptData(currentUser.empresa),
                            matriz: decryptData(currentUser.matriz),
                            
                        }; 
    return restoredUser ? restoredUser.token : null;
    }else{
      return null;
    }
     
  } catch (error) {
    console.error('Erro ao buscar o token do IndexedDB:', error);
    return null;
  }
};

// Interceptar requisições para adicionar o token no cabeçalho
api.interceptors.request.use(
  async (config) => {
    const token = await getTokenFromDB(); // Buscar o token do IndexedDB
    console.log(token)
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



export default api;
