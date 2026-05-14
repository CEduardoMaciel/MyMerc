import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { PROFILES_KEY, USER_CRED_KEY, getActiveListKey, getSavedKey } from './app/utils';

export const useProfileManager = () => {
  const [profiles, setProfiles] = useState<string[]>([]);
  const [username, setUsername] = useState('');
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  const loadProfiles = useCallback(async () => {
    try {
      const stored = await SecureStore.getItemAsync(PROFILES_KEY);
      let list: string[] = stored ? JSON.parse(stored) : [];
      
      const oldCreds = await SecureStore.getItemAsync(USER_CRED_KEY);
      if (list.length === 0) {
        if (oldCreds) {
          const parsed = JSON.parse(oldCreds);
          if (parsed?.u) list = [parsed.u];
        } else {
          list = ['Admin'];
        }
        await SecureStore.setItemAsync(PROFILES_KEY, JSON.stringify(list));
      }
      setProfiles(list);
    } catch (error) {
      setProfiles(['Admin']);
    }
  }, []);

  const handleCreateProfile = async () => {
    const lowerUsername = username.trim();
    if (!lowerUsername) {
      Alert.alert('Atenção', 'Digite um nome para o perfil');
      return false;
    }
    if (lowerUsername.toLowerCase() === 'admin') {
      Alert.alert('Atenção', 'O nome "Admin" é reservado para o sistema.');
      return false;
    }
    try {
      if (profiles.includes(lowerUsername)) {
        Alert.alert('Atenção', 'Este perfil já existe.');
        return false;
      }
      const newList = [...profiles, lowerUsername.toLowerCase()];
      await SecureStore.setItemAsync(PROFILES_KEY, JSON.stringify(newList));
      setProfiles(newList);
      setUsername('');
      setIsCreatingProfile(false);
      return true;
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o perfil');
      return false;
    }
  };

  const handleDeleteProfile = (profileToDelete: string) => {
    Alert.alert(
      'Excluir Perfil',
      `Tem certeza que deseja excluir o perfil "${profileToDelete.charAt(0).toUpperCase() + profileToDelete.slice(1)}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const newList = profiles.filter(p => p !== profileToDelete);
              await SecureStore.setItemAsync(PROFILES_KEY, JSON.stringify(newList));
              await SecureStore.deleteItemAsync(getActiveListKey(profileToDelete));
              await SecureStore.deleteItemAsync(getSavedKey(profileToDelete));
              setProfiles(newList);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o perfil');
            }
          }
        }
      ]
    );
  };

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  return { profiles, username, setUsername, isCreatingProfile, setIsCreatingProfile, handleCreateProfile, handleDeleteProfile };
};