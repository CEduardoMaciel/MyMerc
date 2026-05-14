import { useState, useEffect, useMemo } from 'react';
import { LayoutAnimation, Alert } from 'react-native';
import { getItemAsync, setItemAsync } from 'expo-secure-store';
import { USER_CRED_KEY, getActiveListKey, getSavedKey, getQuickListsKey, formatDecimal } from './app/utils'; // Import formatDecimal
import { Item as BaseItem } from './constants'; 
import { sugestoes } from './sugestoes'; // Importar sugestoes
import { useAuthAndDataLoading } from './useAuthAndDataLoading';

// Extend Item interface for confirmation screen specific properties
interface Item extends BaseItem {
  status: 'pending' | 'confirmed' | 'not_purchased';
  isConfirming?: boolean;
  isConfirmed?: boolean;
  isTemp?: boolean;
}

export interface SummaryData {
  totalItems: number;
  confirmedItems: number;
  notPurchasedItemsCount: number;
  remainingItems: number;
  notPurchasedItems: Item[];
  allItemsList: Item[];
  confirmedItemsList: Item[];
  remainingItemsList: Item[];
}

interface UseConfirmationLogicProps {
  sortBy: 'none' | 'alphabetical';
  router: any; // Expo router instance
}

export type ConfirmationListRow = 
  | { type: 'header'; id: string; grupo: Item['grupo']; count: number; allConfirmed: boolean; isExpanded: boolean }
  | { type: 'item'; id: string; item: Item };

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
  summaryData: SummaryData | null;
  setSummaryData: React.Dispatch<React.SetStateAction<SummaryData | null>>;
  tempInput: string;
  setTempInput: React.Dispatch<React.SetStateAction<string>>;
  tempQuantidade: string;
  setTempQuantidade: React.Dispatch<React.SetStateAction<string>>;
  showTempSuggestions: boolean;
  setShowTempSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
  isTempAddModalVisible: boolean;
  setIsTempAddModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isSaveModalVisible: boolean;
  setIsSaveModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  saveName: string;
  setSaveName: React.Dispatch<React.SetStateAction<string>>;
  sortedNotPurchasedItems: Item[];
  displayList: ConfirmationListRow[];
  expandedGroups: Record<string, boolean>;
  toggleGroup: (grupo: string) => void;
  toggleAllGroups: (expand: boolean) => void;
  tempItems: Item[];
  isTempGroupModalVisible: boolean;
  setTempGroupModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  pendingTempItemName: string;
  pendingTempItemQuantity: string;
  filteredTempSuggestions: { item: string; grupo: string }[];
  handleConfirmItem: (id: string) => void;
  handleCancelConfirm: (id: string) => void;
  handleMoveToNotPurchased: (item: Item) => void;
  handleMoveBack: (item: Item) => void;
  openEditModal: (item: Item) => void;
  saveEdit: () => void;
  handleSavePurchase: () => Promise<void>;
  handleFinishShopping: () => void;
  handleAddNewTempItem: () => void;
  finalizeAddNewTempItem: (grupo: Item['grupo']) => void;
  handleDeleteTempItem: (id: string) => void;
  handleCancelShopping: () => void;
  handleSaveQuickList: () => Promise<boolean>;
  normalizeString: (str: string) => string;
}

export const useConfirmationLogic = ({ sortBy, router }: UseConfirmationLogicProps): UseConfirmationLogicResult => {
  const [shoppingList, setShoppingList] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [originalList, setOriginalList] = useState<Item[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showNotPurchasedModal, setShowNotPurchasedModal] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [saveName, setSaveName] = useState('');

  // Estados para adicionar novo produto temporário
  const [tempItems, setTempItems] = useState<Item[]>([]);
  const [tempInput, setTempInput] = useState('');
  const [showTempSuggestions, setShowTempSuggestions] = useState(false);
  const [tempQuantidade, setTempQuantidade] = useState('');
  const [isTempAddModalVisible, setIsTempAddModalVisible] = useState(false);
  const [isTempGroupModalVisible, setTempGroupModalVisible] = useState(false);
  const [pendingTempItemName, setPendingTempItemName] = useState('');
  const [pendingTempItemQuantity, setPendingTempItemQuantity] = useState('');

  const { setQuickLists } = useAuthAndDataLoading();

  useEffect(() => {
    const loadItems = async () => {
      const creds = await getItemAsync(USER_CRED_KEY);
      const user = creds ? JSON.parse(creds).u : 'admin';
      const activeKey = getActiveListKey(user);

      const stored = await getItemAsync(activeKey);
      if (stored) {
        const items: Item[] = JSON.parse(stored);
        const parsedItems: Item[] = items.map((item: Item) => ({
          ...item,
          status: item.status || 'pending',
          isConfirmed: item.status === 'confirmed'
        }));
        setShoppingList(parsedItems);
        setOriginalList(parsedItems);
        setExpandedGroups({}); // Reseta expansão ao carregar
      }

      setTimeout(() => {
        setLoading(false);
      }, 800);
    };
    loadItems();
  }, []);

  useEffect(() => {
  }, []); 

  const sortedNotPurchasedItems = useMemo(() => {
    const allItems = [...shoppingList, ...tempItems];
    const list = allItems.filter(item => item.status === 'not_purchased');
    return [...list].sort((a, b) => {
      const groupCompare = a.grupo.localeCompare(b.grupo);
      if (groupCompare !== 0) return groupCompare;
      if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [shoppingList, tempItems, sortBy]);

  const displayList = useMemo(() => {
    const allItems = [...shoppingList, ...tempItems];
    const list = allItems.filter(item => item.status === 'pending' || item.status === 'confirmed');
    const sorted = [...list].sort((a, b) => {
      const groupCompare = a.grupo.localeCompare(b.grupo);
      if (groupCompare !== 0) return groupCompare;
      if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
      return 0;
    });

    const rows: ConfirmationListRow[] = [];
    let currentGroup: string | null = null;

    sorted.forEach(item => {
      if (item.grupo !== currentGroup) {
        currentGroup = item.grupo;
        const groupItems = sorted.filter(i => i.grupo === currentGroup);
        const allConfirmed = groupItems.every(i => i.status === 'confirmed');
        const isExpanded = !!expandedGroups[currentGroup];

        rows.push({
          type: 'header',
          id: `header-${currentGroup}`,
          grupo: currentGroup as Item['grupo'],
          count: groupItems.length,
          allConfirmed,
          isExpanded
        });
      }

      if (expandedGroups[currentGroup]) {
        rows.push({
          type: 'item',
          id: item.id,
          item
        });
      }
    });

    return rows;
  }, [shoppingList, tempItems, sortBy, expandedGroups]);

  const handleConfirmItem = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShoppingList(prev => prev.map(i => i.id === id ? { ...i, isConfirming: true } : i)); // Para itens originais
    setTempItems(prev => prev.map(i => i.id === id ? { ...i, isConfirming: true } : i)); // Para itens temporários

    setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      setShoppingList(prev =>
        prev.map(i => i.id === id ? { ...i, status: 'confirmed', isConfirmed: true, isConfirming: false } : i)
      );
      setTempItems(prev =>
        prev.map(i => i.id === id ? { ...i, status: 'confirmed', isConfirmed: true, isConfirming: false } : i)
      );
    }, 600);
  };

  const handleCancelConfirm = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShoppingList(prev => prev.map(i => i.id === id ? { ...i, status: 'pending', isConfirmed: false, isConfirming: false } : i));
    setTempItems(prev => prev.map(i => i.id === id ? { ...i, status: 'pending', isConfirmed: false, isConfirming: false } : i));
  };

  const handleMoveToNotPurchased = (item: Item) => {
    setShoppingList(prev => prev.map(i => i.id === item.id ? { ...i, status: 'not_purchased' } : i));
    setTempItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'not_purchased' } : i));
  };

  const handleMoveBack = (item: Item) => {
    setShoppingList(prev => prev.map(i => i.id === item.id ? { ...i, status: 'pending' } : i));
    setTempItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'pending' } : i));
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setNewQuantity(item.quantidade);
    setModalVisible(true);
  };

  const saveEdit = () => {
    const update = (list: Item[]) => list.map(i => i.id === editingItem?.id ? { ...i, quantidade: formatDecimal(newQuantity) } : i);
    setShoppingList(update);
    setTempItems(update); // Atualiza também os itens temporários
    setModalVisible(false);
  };

  const toggleGroup = (grupo: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [grupo]: !prev[grupo]
    }));
  };

  const toggleAllGroups = (expand: boolean) => {
    const allActive = [...shoppingList, ...tempItems].filter(i => i.status === 'pending' || i.status === 'confirmed');
    const groups = Array.from(new Set(allActive.map(i => i.grupo)));
    const newState: Record<string, boolean> = {};
    groups.forEach(g => { newState[g] = expand; });
    setExpandedGroups(newState);
  };

  const handleCancelShopping = () => {
    const hasStatusChanges = shoppingList.some(item => {
      const original = originalList.find(o => o.id === item.id);
      return original && original.status !== item.status;
    });

    const hasQuantityChanges = shoppingList.some(item => {
      const original = originalList.find(o => o.id === item.id);
      return original && original.quantidade !== item.quantidade;
    });

    const hasTempItems = tempItems.length > 0;

    if (hasStatusChanges || hasQuantityChanges || hasTempItems) {
      Alert.alert(
        'Cancelar Operação',
        'Existem alterações (itens marcados, editados ou novos produtos). Se você cancelar, todo o progresso desta sessão de compras será perdido. Deseja continuar?',
        [
          { text: 'Voltar à Compra', style: 'cancel' },
          { 
            text: 'Confirmar e Sair', 
            style: 'destructive', 
            onPress: () => router.back() 
          }
        ]
      );
    } else {
      router.back();
    }
  };

  const normalizeString = (str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const handleSavePurchase = async () => {
    if (!saveName.trim()) {
      Alert.alert('Erro', 'Dê um nome para esta compra');
      return;
    }

    try {
      const creds = await getItemAsync(USER_CRED_KEY);
      const user = creds ? JSON.parse(creds).u : 'admin';
      const key = getSavedKey(user);

      const saved = await getItemAsync(key);
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

      const itemsToSave = [...shoppingList, ...tempItems] // Inclui itens temporários na lista a ser salva
        .filter(item => item.status === 'confirmed')
        .map(i => ({ ...i, status: 'pending', isConfirmed: false, isConfirming: false }));
      savedLists.push({ name: saveName.trim(), items: itemsToSave });

      await setItemAsync(key, JSON.stringify(savedLists));
      setIsSaveModalVisible(false);
      setShowSummaryModal(true);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar a compra');
    }
  };

  const handleFinishShopping = () => {
    const allItems = [...shoppingList, ...tempItems]; // Considera todos os itens
    const confirmed = allItems.filter(item => item.status === 'confirmed').length;
    const notPurchasedItems = allItems.filter(item => item.status === 'not_purchased');
    const notPurchasedCount = notPurchasedItems.length;
    const remaining = allItems.filter(item => item.status === 'pending').length;

    const onConfirmFinish = () => {
      setSummaryData({
        totalItems: allItems.length,
        confirmedItems: confirmed,
        notPurchasedItemsCount: notPurchasedCount,
        remainingItems: remaining,
        notPurchasedItems: notPurchasedItems,
        allItemsList: allItems,
        confirmedItemsList: allItems.filter(item => item.status === 'confirmed'),
        remainingItemsList: allItems.filter(item => item.status === 'pending'),
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

  const handleSaveQuickList = async (): Promise<boolean> => {
    if (!summaryData || summaryData.notPurchasedItems.length === 0) return false;

    return new Promise((resolve) => {
      Alert.alert(
        'Gerar Listagem Rápida',
        'Deseja criar uma listagem rápida com os itens que não foram encontrados para facilitar sua próxima compra?',
        [
          { text: 'Não', onPress: () => resolve(false), style: 'cancel' },
          {
            text: 'Sim, Gerar',
            onPress: async () => {
              try {
                const creds = await getItemAsync(USER_CRED_KEY);
                const user = creds ? JSON.parse(creds).u : 'admin';
                const key = getQuickListsKey(user);

                const stored = await getItemAsync(key);
                let quickLists = stored ? JSON.parse(stored) : [];

                if (quickLists.length >= 3) {
                  Alert.alert('Limite atingido', 'Você já possui 3 listagens rápidas salvas. Exclua uma na tela inicial para poder gerar uma nova.');
                  return resolve(false);
                }

                const newList = {
                  id: Date.now().toString(),
                  date: new Date().toLocaleDateString('pt-BR'),
                  timestamp: Date.now(),
                  items: summaryData.notPurchasedItems.map(i => ({ ...i, status: 'pending', isConfirmed: false, isTemp: false })),
                };

                quickLists = [newList, ...quickLists];

                await setItemAsync(key, JSON.stringify(quickLists));
                setQuickLists(quickLists);
                Alert.alert('Sucesso', 'Listagem rápida gerada!');
                resolve(true);
              } catch (error) {
                Alert.alert('Erro', 'Não foi possível gerar a listagem rápida');
                resolve(false);
              }
            }
          }
        ]
      );
    });
  };

  const handleAddNewTempItem = () => {
    if (!tempInput.trim() || !tempQuantidade.trim()) {
      Alert.alert('Atenção', 'Preencha o nome e a quantidade do produto.');
      return;
    }

    const inputValue = tempInput.trim();
    const lowerInput = inputValue.toLowerCase();

    // Verificar se o item já existe em qualquer uma das listagens para evitar duplicatas
    const existingItem = [...shoppingList, ...tempItems].find(i => i.name.toLowerCase() === lowerInput);

    const startProcess = (isUpdate: boolean) => {
      const matchedGroup = Object.entries(sugestoes).find(([, itens]) =>
        itens.some(s => normalizeString(s.toLowerCase()) === normalizeString(lowerInput))
      );

      if (matchedGroup) {
        const grupo = matchedGroup[0] as Item['grupo'];
        if (isUpdate) {
          const update = (list: Item[]) => list.map(i => 
            i.name.toLowerCase() === lowerInput 
            ? { ...i, quantidade: formatDecimal(tempQuantidade), grupo, status: 'pending', isConfirmed: false, isConfirming: false } 
            : i
          );
          setShoppingList(update);
          setTempItems(update);
          Alert.alert('Sucesso', `"${existingItem?.name}" foi atualizado.`);
        } else {
          const newItem: Item = {
            id: `${Date.now()}-${Math.random()}`,
            name: inputValue,
            quantidade: formatDecimal(tempQuantidade),
            grupo,
            status: 'pending',
            isTemp: true,
          };
          setTempItems((current) => [newItem, ...current]);
          Alert.alert('Sucesso', `"${inputValue}" adicionado temporariamente.`);
        }
        setTempInput('');
        setTempQuantidade('');
        setIsTempAddModalVisible(false);
      } else {
        setPendingTempItemName(inputValue);
        setPendingTempItemQuantity(tempQuantidade);
        setTempGroupModalVisible(true);
      }
    };

    if (existingItem) {
      Alert.alert(
        'Item já existe',
        `O produto "${existingItem.name}" já está na sua listagem. Deseja substituir as informações atuais pelas novas?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Substituir', style: 'destructive', onPress: () => startProcess(true) }
        ]
      );
    } else {
      startProcess(false);
    }
  };

  const finalizeAddNewTempItem = (grupo: Item['grupo']) => {
    const lowerName = pendingTempItemName.toLowerCase();
    const existingItem = [...shoppingList, ...tempItems].find(i => i.name.toLowerCase() === lowerName);

    if (existingItem) {
      const update = (list: Item[]) => list.map(i => 
        i.name.toLowerCase() === lowerName 
        ? { ...i, quantidade: formatDecimal(pendingTempItemQuantity), grupo, status: 'pending', isConfirmed: false, isConfirming: false } 
        : i
      );
      setShoppingList(update);
      setTempItems(update);
      Alert.alert('Sucesso', `"${existingItem.name}" foi atualizado.`);
    } else {
      const newItem: Item = {
        id: `${Date.now()}-${Math.random()}`,
        name: pendingTempItemName,
        quantidade: formatDecimal(pendingTempItemQuantity),
        grupo,
        status: 'pending',
        isTemp: true,
      };
      setTempItems((current) => [newItem, ...current]);
      Alert.alert('Sucesso', `"${pendingTempItemName}" adicionado temporariamente.`);
    }

    setTempInput('');
    setTempQuantidade('');
    setPendingTempItemName('');
    setPendingTempItemQuantity('');
    setTempGroupModalVisible(false);
    setIsTempAddModalVisible(false); // Fecha o modal após adicionar
  };

  const handleDeleteTempItem = (id: string) => {
    setTempItems(prev => prev.filter(item => item.id !== id));
  };

  const filteredTempSuggestions = useMemo(() => {
    if (!tempInput.trim()) return [];
    const query = normalizeString(tempInput.trim().toLowerCase());
    const allSuggestions = Object.entries(sugestoes)
      .flatMap(([grupo, itens]) => itens.map((item) => ({ item, grupo } as const)));
    
    const matches = allSuggestions.filter(({ item }) => 
      normalizeString(item.toLowerCase()).startsWith(query) || 
      normalizeString(item.toLowerCase()).includes(query)
    );

    // Garante que os itens sejam únicos para evitar chaves duplicadas na interface
    const uniqueMatches: { item: string; grupo: string }[] = [];
    const seen = new Set<string>();
    for (const m of matches) {
      if (!seen.has(m.item)) {
        uniqueMatches.push(m);
        seen.add(m.item);
      }
      if (uniqueMatches.length >= 6) break;
    }

    return uniqueMatches;
  }, [tempInput]);

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
    tempInput,
    setTempInput,
    tempQuantidade,
    setTempQuantidade,
    showTempSuggestions,
    setShowTempSuggestions,
    isTempAddModalVisible,
    setIsTempAddModalVisible,
    isTempGroupModalVisible,
    setTempGroupModalVisible,
    saveName,
    setSaveName,
    sortedNotPurchasedItems,
    displayList,
    expandedGroups,
    toggleGroup,
    toggleAllGroups,
    handleConfirmItem,
    handleCancelConfirm,
    handleMoveToNotPurchased,
    tempItems,
    pendingTempItemName,
    pendingTempItemQuantity,
    filteredTempSuggestions,
    handleMoveBack,
    openEditModal,
    saveEdit,
    handleSavePurchase,
    handleFinishShopping,
    handleAddNewTempItem,
    finalizeAddNewTempItem,
    handleDeleteTempItem,
    handleCancelShopping,
    handleSaveQuickList,
    normalizeString,
  };
};