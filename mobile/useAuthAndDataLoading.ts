import { useState, useEffect, useRef } from 'react';
import { getItemAsync, setItemAsync, deleteItemAsync } from 'expo-secure-store';
import { AUTH_KEY, USER_CRED_KEY, getActiveListKey, getSavedKey } from './app/utils';
import { Item } from './constants'; // Assuming Item interface is shared

interface AuthAndDataLoadingResult {
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  userName: string;
  isUserContextLoaded: boolean;
  handleLoginSuccess: () => Promise<void>;
  handleLogout: () => Promise<void>;
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  savedPurchases: { name: string; items: Item[]; }[];
  setSavedPurchases: React.Dispatch<React.SetStateAction<{ name: string; items: Item[]; }[]>>;
}

export const useAuthAndDataLoading = (): AuthAndDataLoadingResult => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [isUserContextLoaded, setIsUserContextLoaded] = useState(false);

  // These setters will be passed to the main component to update its state
  const [items, setItems] = useState<Item[]>([]);
  const [savedPurchases, setSavedPurchases] = useState<{ name: string; items: Item[]; }[]>([]);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const auth = await getItemAsync(AUTH_KEY);

        if (auth === 'true') {
          const creds = await getItemAsync(USER_CRED_KEY);
          if (creds) {
            const parsed = JSON.parse(creds);
            const u = parsed?.u;
            if (u) {
              setUserName(u.charAt(0).toUpperCase() + u.slice(1));

              const activeKey = getActiveListKey(u);
              const storedItems = await getItemAsync(activeKey);
              if (storedItems) setItems(JSON.parse(storedItems));

              const savedKey = getSavedKey(u);
              const storedSaved = await getItemAsync(savedKey);
              if (storedSaved) setSavedPurchases(JSON.parse(storedSaved));

              setIsLoggedIn(true);
              setIsUserContextLoaded(true);
              return;
            }
          }
        }

        setIsLoggedIn(false);
        setIsUserContextLoaded(false);
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
        setIsLoggedIn(false);
      } finally {
        setIsAuthLoading(false);
      }
    };
    loadAuth();
  }, []);

  useEffect(() => {
    const persistActiveList = async () => {
      if (!isLoggedIn || !userName || !isUserContextLoaded) return;

      try {
        const activeKey = getActiveListKey(userName.toLowerCase());
        await setItemAsync(activeKey, JSON.stringify(items));
      } catch (error) {
        console.error('Erro ao salvar lista:', error);
      }
    };
    persistActiveList();
  }, [items, userName, isLoggedIn, isUserContextLoaded]);

  const handleLoginSuccess = async () => {
    try {
      await setItemAsync(AUTH_KEY, 'true');
      const creds = await getItemAsync(USER_CRED_KEY);
      if (creds) {
        const parsed = JSON.parse(creds);
        const u = parsed?.u;
        if (!u) throw new Error("Usuário não encontrado nas credenciais");

        setUserName(u.charAt(0).toUpperCase() + u.slice(1));

        // --- Migração Segura (Evitando Invalid Key) ---
        try {
          const oldKey = `saved_purchases_${u.toLowerCase()}`;
          if (oldKey && !/\s/.test(oldKey)) {
            const oldData = await getItemAsync(oldKey);
            if (oldData) {
              await setItemAsync(getSavedKey(u), oldData);
              await deleteItemAsync(oldKey);
            }
          }
        } catch (e) { /* Migração falhou ou chave era inválida, ignora silenciosamente */ }

        // --- Carregamento de Dados do Usuário ---
        const activeKey = getActiveListKey(u);
        const storedItems = await getItemAsync(activeKey);
        if (storedItems) {
          setItems(JSON.parse(storedItems));
        }

        const savedKey = getSavedKey(u);
        const storedSaved = await getItemAsync(savedKey);
        if (storedSaved) {
          setSavedPurchases(JSON.parse(storedSaved));
        }

        setIsLoggedIn(true);
        setIsUserContextLoaded(true);
      } else {
        setUserName('Admin');
        setIsLoggedIn(true);
        setIsUserContextLoaded(true);
      }
    } catch (error) {
      console.error('Erro ao salvar login:', error);
    }
  };

  const handleLogout = async () => {
    try {
      setIsUserContextLoaded(false);
      await deleteItemAsync(AUTH_KEY);
      setItems([]);
      setSavedPurchases([]);
      setUserName('');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    }
  };

  return {
    isLoggedIn,
    isAuthLoading,
    userName,
    isUserContextLoaded,
    handleLoginSuccess,
    handleLogout,
    items,
    setItems,
    savedPurchases,
    setSavedPurchases,
  };
};