export const USER_CRED_KEY = 'userCredentials';
export const AUTH_KEY = 'isLoggedIn';
export const PROFILES_KEY = 'myMercProfilesList';

export const getSavedKey = (user: string) => {
  const sanitized = (user || 'default').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `savedPurchases${sanitized}`;
};

export const getActiveListKey = (user: string) => {
  const sanitized = (user || 'default').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `activeList${sanitized}`;
};

export const getQuickListsKey = (user: string) => {
  const sanitized = (user || 'default').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `quickLists${sanitized}`;
};

export const getSettingsKey = (user: string) => {
  const sanitized = (user || 'default').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `settings${sanitized}`;
};

export const formatDecimal = (val: string) => {
  if (!val) return '0.00';
  const num = parseFloat(val.replace(',', '.'));
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

export const normalizeString = (str: string) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};