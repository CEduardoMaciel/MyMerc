import * as SecureStore from 'expo-secure-store';
import { USER_CRED_KEY, getActiveListKey, getSavedKey, getQuickListsKey } from './app/utils';

export const storageService = {
  async getCurrentUser() {
    const creds = await SecureStore.getItemAsync(USER_CRED_KEY);
    return creds ? JSON.parse(creds).u : 'admin';
  },

  async getActiveList(user: string) {
    const data = await SecureStore.getItemAsync(getActiveListKey(user));
    return data ? JSON.parse(data) : null;
  },

  async saveActiveList(user: string, items: any[]) {
    await SecureStore.setItemAsync(getActiveListKey(user), JSON.stringify(items));
  },

  async deleteActiveList(user: string) {
    await SecureStore.deleteItemAsync(getActiveListKey(user));
  },

  async getSavedPurchases(user: string) {
    const data = await SecureStore.getItemAsync(getSavedKey(user));
    return data ? JSON.parse(data) : [];
  },

  async savePurchases(user: string, lists: any[]) {
    await SecureStore.setItemAsync(getSavedKey(user), JSON.stringify(lists));
  },

  async getQuickLists(user: string) {
    const data = await SecureStore.getItemAsync(getQuickListsKey(user));
    return data ? JSON.parse(data) : [];
  },

  async saveQuickLists(user: string, lists: any[]) {
    await SecureStore.setItemAsync(getQuickListsKey(user), JSON.stringify(lists));
  }
};