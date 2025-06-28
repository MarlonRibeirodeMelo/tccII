// services/authStorage.js
import { Preferences } from '@capacitor/preferences'; // Capacitor Storage para persistência de dados
// import db from './db'; // Alternativamente, use IndexedDB se preferir

export const setToken = async (token) => {
  await Preferences.set({
    key: 'token',
    value: token,
  });
};

export const getToken = async () => {
  const { value } = await Preferences.get({ key: 'token' });
  return value;
};

export const removeToken = async () => {
  await Preferences.remove({ key: 'token' });
};

export const setUserData = async (userData) => {
  await Preferences.set({
    key: 'userData',
    value: JSON.stringify(userData),
  });
};

export const getUserData = async () => {
  const { value } = await Preferences.get({ key: 'userData' });
  return value ? JSON.parse(value) : null;
};

export const clearUserData = async () => {
  await Preferences.clear(); // Limpa todos os dados persistidos, caso necessário
};
