import CryptoJS from 'crypto-js';


const SECRET_KEY = '1+1=3+11_=integraargetni';

// Função para criptografar dados
export const encryptData = (data) => {
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  } catch (error) {
    console.error('Erro ao criptografar os dados:', error);
    return null;
  }
};

// Função para descriptografar dados
export const decryptData = (cipherText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error('Erro ao descriptografar os dados:', error);
    return null;
  }
};
