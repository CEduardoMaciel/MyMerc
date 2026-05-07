import { useState } from 'react';
import { Alert } from 'react-native';
import { setItemAsync, getItemAsync } from 'expo-secure-store';
import { USER_CRED_KEY, getSavedKey } from './app/utils'; // Assuming this path is correct
import { Item } from './constants'; // Assuming this path is correct

interface UseSavedListsProps {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  savedPurchases: { name: string; items: Item[] }[];
  setSavedPurchases: React.Dispatch<React.SetStateAction<{ name: string; items: Item[] }[]>>;
  userName: string;
}

interface UseSavedListsResult {
  isSavedListsModalVisible: boolean;
  setIsSavedListsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isSaveModalVisible: boolean;
  setIsSaveModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  saveName: string;
  setSaveName: React.Dispatch<React.SetStateAction<string>>;
  isPreviewModalVisible: boolean;
  setIsPreviewModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  previewData: { name: string; items: Item[] } | null;
  setPreviewData: React.Dispatch<React.SetStateAction<{ name: string; items: Item[] } | null>>;
  handleSaveCurrentList: () => Promise<void>;
  handleLoadSavedList: (savedItems: Item[]) => void;
  handleOpenPreview: (list: { name: string; items: Item[] }) => void;
  handleDeleteSavedList: (listName: string) => Promise<void>;
}

export const useSavedLists = ({
  items,
  setItems,
  savedPurchases,
  setSavedPurchases,
  userName,
}: UseSavedListsProps): UseSavedListsResult => {
  const [isSavedListsModalVisible, setIsSavedListsModalVisible] = useState(false);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState<{ name: string; items: Item[] } | null>(null);

  const handleSaveCurrentList = async () => {
    if (items.length === 0) return;
    if (!saveName.trim()) {
      Alert.alert('Erro', 'Dê um nome para esta compra');
      return;
    }

    if (savedPurchases.some(p => p.name.toLowerCase() === saveName.trim().toLowerCase())) {
      Alert.alert('Erro', 'Já existe uma compra salva com este nome');
      return;
    }

    if (savedPurchases.length >= 5) {
      Alert.alert('Limite atingido', 'Você já possui 5 compras salvas. Exclua uma para salvar esta.');
      return;
    }

    const newList = [...savedPurchases, { name: saveName.trim(), items }];
    const user = userName.toLowerCase(); // Use the userName from props
    
    await setItemAsync(getSavedKey(user), JSON.stringify(newList));
    setSavedPurchases(newList);
    setIsSaveModalVisible(false);
    setSaveName('');
    Alert.alert('Sucesso', 'Lista salva com sucesso!');
  };

  const handleLoadSavedList = (savedItems: Item[]) => {
    Alert.alert('Carregar Lista', 'Isso substituirá sua lista atual. Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sim', onPress: () => {
        setItems(savedItems);
        setIsPreviewModalVisible(false);
        setIsSavedListsModalVisible(false);
      }}
    ]);
  };

  const handleOpenPreview = (list: { name: string; items: Item[] }) => {
    setPreviewData(list);
    setIsPreviewModalVisible(true);
  };

  const handleDeleteSavedList = async (listName: string) => {
    Alert.alert('Excluir Lista Salva', `Tem certeza que deseja excluir "${listName}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        const newList = savedPurchases.filter(p => p.name !== listName);
        const user = userName.toLowerCase(); // Use the userName from props
        await setItemAsync(getSavedKey(user), JSON.stringify(newList));
        setSavedPurchases(newList);
      }}
    ]);
  };

  return {
    isSavedListsModalVisible,
    setIsSavedListsModalVisible,
    isSaveModalVisible,
    setIsSaveModalVisible,
    saveName,
    setSaveName,
    isPreviewModalVisible,
    setIsPreviewModalVisible,
    previewData,
    setPreviewData,
    handleSaveCurrentList,
    handleLoadSavedList,
    handleOpenPreview,
    handleDeleteSavedList,
  };
};