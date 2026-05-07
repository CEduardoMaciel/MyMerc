import * as SecureStore from 'expo-secure-store';

export const USER_CRED_KEY = 'userCredentials';
export const AUTH_KEY = 'isLoggedIn';

export const getSavedKey = (user: string) => {
  const sanitized = (user || 'default').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `savedPurchases${sanitized}`;
};

export const getActiveListKey = (user: string) => {
  const sanitized = (user || 'default').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `activeList${sanitized}`;
};

export const formatDecimal = (val: string) => {
  if (!val) return '0.00';
  const num = parseFloat(val.replace(',', '.'));
  return isNaN(num) ? '0.00' : num.toFixed(2);
};