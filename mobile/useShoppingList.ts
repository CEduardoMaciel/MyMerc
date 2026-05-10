import { useState, useMemo } from 'react';
import { Alert, TextInput } from 'react-native';
import { formatDecimal } from './app/utils';
import { Item } from './constants'; // Assuming this path is correct
import { sugestoes } from './sugestoes';

interface UseShoppingListProps {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  inputRef: React.RefObject<TextInput>;
  quantidadeInputRef: React.RefObject<TextInput>;
}

interface UseShoppingListResult {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  quantidade: string;
  setQuantidade: React.Dispatch<React.SetStateAction<string>>;
  showSuggestions: boolean;
  setShowSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
  pendingItemName: string;
  setPendingItemName: React.Dispatch<React.SetStateAction<string>>;
  pendingItemQuantity: string;
  setPendingItemQuantity: React.Dispatch<React.SetStateAction<string>>;
  isGroupModalVisible: boolean;
  setIsGroupModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  editingItem: Item | null;
  setEditingItem: React.Dispatch<React.SetStateAction<Item | null>>;
  editQuantity: string;
  setEditQuantity: React.Dispatch<React.SetStateAction<string>>;
  isEditModalVisible: boolean;
  setIsEditModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  filteredSuggestions: { item: string; grupo: string }[];
  handleAddItem: () => void;
  finalizeAddItem: (grupo: Item['grupo']) => void;
  handleDeleteItem: (item: Item) => void;
  openEditModal: (item: Item) => void;
  handleSaveEdit: () => void;
  handleDeleteAll: () => void;
}

const normalizeString = (str: string) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const useShoppingList = ({
  items,
  setItems,
  inputRef,
  quantidadeInputRef,
}: UseShoppingListProps): UseShoppingListResult => {
  const [input, setInput] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [pendingItemName, setPendingItemName] = useState('');
  const [pendingItemQuantity, setPendingItemQuantity] = useState('');

  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const handleAddItem = () => {
    if (!input.trim() || !quantidade.trim()) {
      return;
    }

    const inputValue = input.trim();
    const lowerInput = inputValue.toLowerCase();

    const existingItem = items.find(i => i.name.toLowerCase() === lowerInput);
    if (existingItem) {
      Alert.alert(
        'Item já adicionado',
        `o produto "${existingItem.name}" já está na sua lista. Deseja editar a quantidade?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Editar Quantidade', onPress: () => openEditModal(existingItem) }
        ]
      );
      return;
    }

    const matchedGroup = Object.entries(sugestoes).find(([, itens]) =>
      itens.some(s => s.toLowerCase() === lowerInput)
    );

    if (matchedGroup) {
      const grupo = matchedGroup[0] as Item['grupo'];
      const newItem: Item = {
        id: `${Date.now()}-${Math.random()}`,
        name: inputValue,
        quantidade: formatDecimal(quantidade),
        grupo,
      };
      setItems((current) => [newItem, ...current]);
      setInput('');
      setQuantidade('');
      setShowSuggestions(false);
      inputRef.current?.focus();
      quantidadeInputRef.current?.blur();
    } else {
      setPendingItemName(inputValue);
      setPendingItemQuantity(quantidade);
      setIsGroupModalVisible(true);
    }
  };

  const finalizeAddItem = (grupo: Item['grupo']) => {
    const newItem: Item = {
      id: `${Date.now()}-${Math.random()}`,
      name: pendingItemName,
      quantidade: formatDecimal(pendingItemQuantity),
      grupo,
    };

    setItems((current) => [newItem, ...current]);
    setInput('');
    setQuantidade('');
    setPendingItemName('');
    setPendingItemQuantity('');
    setIsGroupModalVisible(false);
    inputRef.current?.focus();
    setShowSuggestions(false);
  };

  const handleDeleteItem = (item: Item) => {
    Alert.alert(
      'Excluir Item',
      `Tem certeza que deseja excluir "${item.name}" da sua lista?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => setItems((current) => current.filter((i) => i.id !== item.id)),
        },
      ]
    );
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setEditQuantity(item.quantidade);
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, quantidade: formatDecimal(editQuantity) } : i));
    setIsEditModalVisible(false);
    setEditingItem(null);
  };

  const handleDeleteAll = () => {
    if (items.length === 0) return;
    Alert.alert(
      'Limpar Lista',
      'Tem certeza que deseja excluir todos os itens da sua lista?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir Tudo', style: 'destructive', onPress: () => setItems([]) },
      ]
    );
  };

  const filteredSuggestions = useMemo(() => {
    if (!input.trim()) {
      return [];
    }

    const query = normalizeString(input.trim().toLowerCase());
    const allSuggestions = Object.entries(sugestoes)
      .flatMap(([grupo, itens]) => itens.map((item) => ({ item, grupo } as const)));

    const startsWithMatches: { item: string; grupo: string }[] = [];
    const includesMatches: { item: string; grupo: string }[] = [];
    const seen = new Set<string>();

    allSuggestions.forEach(({ item, grupo }) => {
      if (seen.has(item)) return;
      const normalizedItem = normalizeString(item.toLowerCase());
      if (normalizedItem.startsWith(query)) {
        startsWithMatches.push({ item, grupo });
        seen.add(item);
      }
    });

    allSuggestions.forEach(({ item, grupo }) => {
      if (seen.has(item)) return;
      const normalizedItem = normalizeString(item.toLowerCase());
      if (normalizedItem.includes(query)) {
        includesMatches.push({ item, grupo });
        seen.add(item);
      }
    });

    return [...startsWithMatches, ...includesMatches].slice(0, 6);
  }, [input]);

  return {
    input,
    setInput,
    quantidade,
    setQuantidade,
    showSuggestions,
    setShowSuggestions,
    pendingItemName,
    setPendingItemName,
    pendingItemQuantity,
    setPendingItemQuantity,
    isGroupModalVisible,
    setIsGroupModalVisible,
    editingItem,
    setEditingItem,
    editQuantity,
    setEditQuantity,
    isEditModalVisible,
    setIsEditModalVisible,
    filteredSuggestions,
    handleAddItem,
    finalizeAddItem,
    handleDeleteItem,
    openEditModal,
    handleSaveEdit,
    handleDeleteAll,
  };
};