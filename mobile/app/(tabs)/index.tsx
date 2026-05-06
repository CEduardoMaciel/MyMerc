
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, Modal, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './style';
import { sugestoes } from './constants';
import SplashScreen from '../SplashScreen';

interface Item {
  id: string;
  name: string;
  quantidade: string;
  grupo: 'Alimentício' | 'Higiene'; // Assumindo que estes são os únicos dois grupos
  // Adiciona status para consistência se os itens forem passados para a tela de confirmação
  // status?: 'pending' | 'confirmed' | 'not_purchased';
  // isConfirming?: boolean;
}

const STORAGE_KEY = 'shoppingList';
const AUTH_KEY = 'isLoggedIn';

export default function HomeScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [input, setInput] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState<'none' | 'group'>('none');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const auth = await SecureStore.getItemAsync(AUTH_KEY);
        setIsLoggedIn(auth === 'true');
      } catch (error) {
        console.error('Erro ao carregar estado de login:', error);
      } finally {
        setIsAuthLoading(false);
      }
    };

    const loadItems = async () => {
      try {
        const storedItems = await SecureStore.getItemAsync(STORAGE_KEY);
        if (storedItems) {
          setItems(JSON.parse(storedItems));
        }
      } catch (error) {
        console.error('Erro ao carregar lista:', error);
      }
    };

    loadAuth();
    loadItems();
  }, []);

  useEffect(() => {
    const saveItems = async () => {
      try {
        await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Erro ao salvar lista:', error);
      }
    };
    saveItems();
  }, [items]);

  const handleLoginSuccess = async () => {
    try {
      await SecureStore.setItemAsync(AUTH_KEY, 'true');
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Erro ao salvar login:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync(AUTH_KEY);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    }
  };

  const handleAddItem = () => {
    if (!input.trim() || !quantidade.trim()) {
      return;
    }

    const inputValue = input.trim();

    // Verificar se o item já existe na lista (case-insensitive)
    const existingItem = items.find(i => i.name.toLowerCase() === inputValue.toLowerCase());
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
      itens.includes(inputValue)
    );

    const grupo: Item['grupo'] = (matchedGroup?.[0] as Item['grupo']) ?? 'Alimentício';

    const newItem: Item = {
      id: `${Date.now()}-${Math.random()}`,
      name: inputValue,
      quantidade: quantidade.trim(),
      grupo,
    };

    setItems((current) => [newItem, ...current]);
    setInput('');
    setQuantidade('');
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
    setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, quantidade: editQuantity } : i));
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

  const handleConfirm = () => {
    router.push({
      pathname: '/confirmacao',
      params: { sortBy }
    });
  };

  const handleSortChange = (value: 'none' | 'group') => {
    setSortBy(value);
  };

  const filteredSuggestions = useMemo(() => {
    if (!input.trim()) {
      return [];
    }

    const query = input.toLowerCase();
    return Object.entries(sugestoes)
      .flatMap(([grupo, itens]) => itens.map((item) => ({ item, grupo } as const)))
      .filter(({ item }) => item.toLowerCase().includes(query))
      .slice(0, 6);
  }, [input]);

  const sortedItems = useMemo(() => {
    if (sortBy === 'group') {
      return [...items].sort((a, b) => a.grupo.localeCompare(b.grupo));
    }
    return items;
  }, [items, sortBy]);

  if (isAuthLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Carregando...</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return <SplashScreen onFinish={handleLoginSuccess} />;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { 
        fontSize: 32, 
        fontWeight: '900', 
        color: '#1B5E20', 
        letterSpacing: -1,
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10 
      }]}>MyMerc</Text>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: '#666', marginBottom: 8 }}>O que vamos comprar hoje?</Text>
      <View style={{ zIndex: 10 }}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Nome do item"
          value={input}
          onChangeText={(value) => {
            setInput(value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <View style={[styles.suggestionBox, { position: 'absolute', top: 50, left: 0, right: 0, backgroundColor: 'white', zIndex: 11, elevation: 5 }]}>
            {filteredSuggestions.map(({ item }) => (
              <TouchableOpacity
                key={item}
                style={styles.suggestionItem}
                onPress={() => {
                  setInput(item);
                  setShowSuggestions(false);
                }}>
                <Text>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <TextInput
            style={styles.quantidadeText}
            placeholder="Quantidade"
            value={quantidade}
            onChangeText={setQuantidade}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddItem}>
            <MaterialIcons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 }}>
        <Text style={[styles.title, { 
          marginBottom: 0,
          fontSize: 24, 
          fontWeight: '900', 
          color: '#1B5E20', 
          letterSpacing: -1,
          textShadowColor: 'rgba(255, 255, 255, 0.8)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 10 
        }]}>Sua lista</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={handleDeleteAll} style={{ padding: 5 }}>
            <MaterialIcons name="delete-sweep" size={28} color="#F44336" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleSortChange(sortBy === 'group' ? 'none' : 'group')}
            style={{ padding: 5 }}
          >
            <MaterialIcons 
              name="sort" 
              size={28} 
              color={sortBy === 'group' ? '#4CAF50' : '#333'} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={sortedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const showHeader = sortBy === 'group' && (index === 0 || sortedItems[index - 1].grupo !== item.grupo);
          return (
            <View>
              {showHeader && (
                <View style={{
                  backgroundColor: '#f1f8e9',
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  marginTop: 15,
                  marginBottom: 8,
                  borderRadius: 6,
                  borderLeftWidth: 5,
                  borderLeftColor: '#1B5E20'
                }}>
                <Text style={{ fontWeight: '900', color: '#1B5E20', textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.5 }}>{item.grupo}</Text>
                </View>
              )}
              <View style={styles.itemContainer}>
                <View style={styles.itemContent}>
                  <View>
                    <Text style={styles.itemText}>{item.name}</Text>
                    <View style={{ marginTop: 4 }}>
                      <Text style={[styles.itemText, { fontSize: 14, color: '#666', fontWeight: 'bold' }]}>Qtd: {item.quantidade}</Text>
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  <TouchableOpacity onPress={() => openEditModal(item)} style={{ padding: 5 }}>
                    <MaterialIcons name="edit" size={24} color="#2196F3" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteItem(item)} style={{ padding: 5 }}>
                    <MaterialIcons name="delete-outline" size={24} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text>Nenhum item salvo.</Text>}
        style={styles.list}
      />

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <TouchableOpacity style={[styles.addBtn, { flex: 1, backgroundColor: '#9e9e9e' }]} onPress={handleLogout}>
          <Text style={styles.addBtnText}>Sair</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.addBtn, { flex: 1 }, items.length === 0 && { backgroundColor: '#ccc' }]} 
          onPress={handleConfirm}
          disabled={items.length === 0}
        >
          <Text style={styles.addBtnText}>Confirmar</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isEditModalVisible} transparent animationType="fade">
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <Text style={[styles.title, { 
              fontSize: 24, 
              fontWeight: '900', 
              color: '#1B5E20', 
              letterSpacing: -1,
              textShadowColor: 'rgba(255, 255, 255, 0.8)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 10 
            }]}>Editar Item</Text>
            <Text style={{ marginBottom: 15, fontSize: 16 }}>{editingItem?.name}</Text>
            <TextInput
              style={[styles.input, { width: '100%' }]}
              value={editQuantity}
              onChangeText={setEditQuantity}
              placeholder="Nova quantidade"
              keyboardType="numeric"
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity 
                style={[styles.addBtn, { flex: 1, backgroundColor: '#ccc' }]} 
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.addBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.addBtn, { flex: 1 }]} 
                onPress={handleSaveEdit}
              >
                <Text style={styles.addBtnText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const localStyles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '85%', alignItems: 'center' },
});
