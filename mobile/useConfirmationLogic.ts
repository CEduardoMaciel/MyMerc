import { useState, useEffect, useMemo } from 'react';
import { LayoutAnimation, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { USER_CRED_KEY, getActiveListKey, getSavedKey, formatDecimal } from './app/utils';
import { Item as BaseItem } from './constants'; 

// Extend Item interface for confirmation screen specific properties
interface Item extends BaseItem {
  status: 'pending' | 'confirmed' | 'not_purchased';
  isConfirming?: boolean;
  isConfirmed?: boolean;
}

interface UseConfirmationLogicProps {
  sortBy: 'none' | 'alphabetical';
  router: any; // Expo router instance
}

interface UseConfirmationLogicResult {
  shoppingList: Item[];
  setShoppingList: React.Dispatch<React.SetStateAction<Item[]>>;
  loading: boolean;
  editingItem: Item | null;
  setEditingItem: React.Dispatch<React.SetStateAction<Item | null>>;
  newQuantity: string;
  setNewQuantity: React.Dispatch<React.SetStateAction<string>>;
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  showSummaryModal: boolean;
  setShowSummaryModal: React.Dispatch<React.SetStateAction<boolean>>;
  showNotPurchasedModal: boolean;
  setShowNotPurchasedModal: React.SetStateAction<boolean>;
  summaryData: {
    totalItems: number;
    confirmedItems: number;
    notPurchasedItemsCount: number;
    remainingItems: number;
  } | null;
  setSummaryData: React.Dispatch<React.SetStateAction<{
    totalItems: number;
    confirmedItems: number;
    notPurchasedItemsCount: number;
    remainingItems: number;
  } | null>>;
  isSaveModalVisible: boolean;
  setIsSaveModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  saveName: string;
  setSaveName: React.Dispatch<React.SetStateAction<string>>;
  sortedNotPurchasedItems: Item[];
  sortedActiveItems: Item[];
  handleConfirmItem: (id: string) => void;
  handleCancelConfirm: (id: string) => void;
  handleMoveToNotPurchased: (item: Item) => void;
  handleMoveBack: (item: Item) => void;
  openEditModal: (item: Item) => void;
  saveEdit: () => void;
  handleSavePurchase: () => Promise<void>;
  handleFinishShopping: () => void;
}

export const useConfirmationLogic = ({ sortBy, router }: UseConfirmationLogicProps): UseConfirmationLogicResult => {
  const [shoppingList, setShoppingList] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showNotPurchasedModal, setShowNotPurchasedModal] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    totalItems: number;
    confirmedItems: number;
    notPurchasedItemsCount: number;
    remainingItems: number;
  } | null>(null);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [saveName, setSaveName] = useState('');

  useEffect(() => {
    const loadItems = async () => {
      const creds = await SecureStore.getItemAsync(USER_CRED_KEY);
      const user = creds ? JSON.parse(creds).u : 'admin';
      const activeKey = getActiveListKey(user);

      const stored = await SecureStore.getItemAsync(activeKey);
      if (stored) {
        const parsedItems: Item[] = JSON.parse(stored).map((item: Item) => ({
          ...item,
          status: item.status || 'pending',
          isConfirmed: item.status === 'confirmed'
        }));
        setShoppingList(parsedItems);
      }

      setTimeout(() => {
        setLoading(false);
      }, 800);
    };
    loadItems();
  }, []);

  useEffect(() => {
    const persistCurrentProgress = async () => {
      try {
        const creds = await SecureStore.getItemAsync(USER_CRED_KEY);
        const user = creds ? JSON.parse(creds).u : 'admin';
        const activeKey = getActiveListKey(user);

        if (shoppingList.length > 0) {
          await SecureStore.setItemAsync(activeKey, JSON.stringify(shoppingList));
        }
      } catch (error) {
        console.error('Erro ao salvar progresso:', error);
      }
    };
    persistCurrentProgress();
  }, [shoppingList]);

  const sortedNotPurchasedItems = useMemo(() => {
    const list = shoppingList.filter(item => item.status === 'not_purchased');
    return [...list].sort((a, b) => {
      const groupCompare = a.grupo.localeCompare(b.grupo);
      if (groupCompare !== 0) return groupCompare;
      if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [shoppingList, sortBy]);

  const sortedActiveItems = useMemo(() => {
    const list = shoppingList.filter(item => item.status === 'pending' || item.status === 'confirmed');
    return [...list].sort((a, b) => {
      const groupCompare = a.grupo.localeCompare(b.grupo);
      if (groupCompare !== 0) return groupCompare;
      if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [shoppingList, sortBy]);

  const handleConfirmItem = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShoppingList(prev => prev.map(i => i.id === id ? { ...i, isConfirming: true } : i));

    setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      setShoppingList(prev =>
        prev.map(i => i.id === id ? { ...i, status: 'confirmed', isConfirmed: true, isConfirming: false } : i)
      );
    }, 600);
  };

  const handleCancelConfirm = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShoppingList(prev => prev.map(i => i.id === id ? { ...i, status: 'pending', isConfirmed: false, isConfirming: false } : i));
  };

  const handleMoveToNotPurchased = (item: Item) => {
    setShoppingList(prev => prev.map(i => i.id === item.id ? { ...i, status: 'not_purchased' } : i));
  };

  const handleMoveBack = (item: Item) => {
    setShoppingList(prev => prev.map(i => i.id === item.id ? { ...i, status: 'pending' } : i));
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setNewQuantity(item.quantidade);
    setModalVisible(true);
  };

  const saveEdit = () => {
    const update = (list: Item[]) => list.map(i => i.id === editingItem?.id ? { ...i, quantidade: formatDecimal(newQuantity) } : i);
    setShoppingList(update);
    setModalVisible(false);
  };

  const handleSavePurchase = async () => {
    if (!saveName.trim()) {
      Alert.alert('Erro', 'Dê um nome para esta compra');
      return;
    }

    try {
      const creds = await SecureStore.getItemAsync(USER_CRED_KEY);
      const user = creds ? JSON.parse(creds).u : 'admin';
      const key = getSavedKey(user);

      const saved = await SecureStore.getItemAsync(key);
      let savedLists = saved ? JSON.parse(saved) : [];

      if (savedLists.some((p: any) => p.name.toLowerCase() === saveName.trim().toLowerCase())) {
        Alert.alert('Erro', 'Já existe uma compra salva com este nome');
        return;
      }

      if (savedLists.length >= 5) {
        Alert.alert('Limite atingido', 'Você já possui 5 compras salvas.');
        setIsSaveModalVisible(false);
        setShowSummaryModal(true);
        return;
      }

      const itemsToSave = shoppingList
        .filter(item => item.status === 'confirmed')
        .map(i => ({ ...i, status: 'pending', isConfirmed: false, isConfirming: false }));
      savedLists.push({ name: saveName.trim(), items: itemsToSave });

      await SecureStore.setItemAsync(key, JSON.stringify(savedLists));
      setIsSaveModalVisible(false);
      setShowSummaryModal(true);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar a compra');
    }
  };

  const handleFinishShopping = () => {
    const confirmed = shoppingList.filter(item => item.status === 'confirmed').length;
    const notPurchased = shoppingList.filter(item => item.status === 'not_purchased').length;
    const remaining = shoppingList.filter(item => item.status === 'pending').length;

    const onConfirmFinish = () => {
      setSummaryData({
        totalItems: shoppingList.length,
        confirmedItems: confirmed,
        notPurchasedItemsCount: notPurchased,
        remainingItems: remaining,
      });

      if (confirmed > 0) {
        Alert.alert(
          'Salvar Itens Comprados?',
          'Deseja salvar apenas os itens comprados para usar em uma lista futura?',
          [
            { text: 'Não', onPress: () => setShowSummaryModal(true) },
            { text: 'Sim, Salvar', onPress: () => setIsSaveModalVisible(true) }
          ]
        );
      } else {
        setShowSummaryModal(true);
      }
    };

    if (confirmed === 0) {
      Alert.alert(
        'Atenção',
        'Você não marcou nenhum item como comprado. Deseja finalizar assim mesmo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sim, finalizar', onPress: onConfirmFinish },
        ]
      );
      return;
    }

    Alert.alert(
      'Finalizar Compras',
      'Deseja realmente finalizar as compras e ver o resumo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Finalizar', onPress: onConfirmFinish },
      ]
    );
  };

  return {
    shoppingList,
    setShoppingList,
    loading,
    editingItem,
    setEditingItem,
    newQuantity,
    setNewQuantity,
    modalVisible,
    setModalVisible,
    showSummaryModal,
    setShowSummaryModal,
    showNotPurchasedModal,
    setShowNotPurchasedModal,
    summaryData,
    setSummaryData,
    isSaveModalVisible,
    setIsSaveModalVisible,
    saveName,
    setSaveName,
    sortedNotPurchasedItems,
    sortedActiveItems,
    handleConfirmItem,
    handleCancelConfirm,
    handleMoveToNotPurchased,
    handleMoveBack,
    openEditModal,
    saveEdit,
    handleSavePurchase,
    handleFinishShopping,
  };
};