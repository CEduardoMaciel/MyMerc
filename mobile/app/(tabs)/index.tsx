
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './style';
import { sugestoes } from './constants';
import { Logo } from '@/components/logo';
import SplashScreen from '../SplashScreen';
import { AUTH_KEY, USER_CRED_KEY, getSavedKey, getActiveListKey, formatDecimal } from '../utils';

interface Item {
  id: string;
  name: string;
  quantidade: string;
  grupo: 'Alimentício' | 'Higiene' | 'Frios' | 'Frutas' | 'Padaria' | 'Bebidas' | 'PetShop' | 'Utilidades' | 'Escolar' | 'Outros'; 
}

// Helper function to remove diacritics and normalize string for comparison
const normalizeString = (str: string) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const groupIcons: Record<Item['grupo'], keyof typeof MaterialIcons.glyphMap> = {
  Alimentício: 'restaurant',
  Higiene: 'wash',
  Frios: 'ac-unit',
  Frutas: 'eco',
  Padaria: 'bakery-dining',
  Bebidas: 'local-drink',
  PetShop: 'pets',
  Utilidades: 'home-repair-service',
  Escolar: 'school',
  Outros: 'category',
};

export default function HomeScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [input, setInput] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState<'none' | 'alphabetical'>('none');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [isUserContextLoaded, setIsUserContextLoaded] = useState(false);
  const isAppFirstMount = useRef(true);

  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [pendingItemName, setPendingItemName] = useState('');
  const [pendingItemQuantity, setPendingItemQuantity] = useState('');

  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const [isSavedListsModalVisible, setIsSavedListsModalVisible] = useState(false);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [savedPurchases, setSavedPurchases] = useState<{name: string, items: Item[]}[]>([]);

  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState<{name: string, items: Item[]} | null>(null);

  const quantidadeInputRef = useRef<TextInput>(null);
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        if (isAppFirstMount.current) {
          // Requisito: Nunca entrar já logado ao iniciar o app (Fresh Start).
          await SecureStore.deleteItemAsync(AUTH_KEY);
          isAppFirstMount.current = false;
        }

        const auth = await SecureStore.getItemAsync(AUTH_KEY);
        
        if (auth === 'true') {
          const creds = await SecureStore.getItemAsync(USER_CRED_KEY);
          if (creds) {
            const parsed = JSON.parse(creds);
            const u = parsed?.u;
            if (u) {
              setUserName(u.charAt(0).toUpperCase() + u.slice(1));
              
              // Recarrega os dados do usuário para navegação interna
              const activeKey = getActiveListKey(u);
              const storedItems = await SecureStore.getItemAsync(activeKey);
              if (storedItems) setItems(JSON.parse(storedItems));

              const savedKey = getSavedKey(u);
              const storedSaved = await SecureStore.getItemAsync(savedKey);
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
        await SecureStore.setItemAsync(activeKey, JSON.stringify(items));
      } catch (error) {
        console.error('Erro ao salvar lista:', error);
      }
    };
    persistActiveList();
  }, [items, userName, isLoggedIn, isUserContextLoaded]);

  const handleLoginSuccess = async () => {
    try {
      await SecureStore.setItemAsync(AUTH_KEY, 'true');
      const creds = await SecureStore.getItemAsync(USER_CRED_KEY);
      if (creds) {
        const parsed = JSON.parse(creds);
        const u = parsed?.u;
        if (!u) throw new Error("Usuário não encontrado nas credenciais");

        setUserName(u.charAt(0).toUpperCase() + u.slice(1));
        
        // --- Migração Segura (Evitando Invalid Key) ---
        try {
          const oldKey = `saved_purchases_${u.toLowerCase()}`;
          // Apenas tenta ler se a chave antiga for estritamente alfanumérica/válida
          if (oldKey && !/\s/.test(oldKey)) {
            const oldData = await SecureStore.getItemAsync(oldKey);
            if (oldData) {
              await SecureStore.setItemAsync(getSavedKey(u), oldData);
              await SecureStore.deleteItemAsync(oldKey);
            }
          }
        } catch (e) { /* Migração falhou ou chave era inválida, ignora silenciosamente */ }

        // --- Carregamento de Dados do Usuário ---
        const activeKey = getActiveListKey(u);
        const storedItems = await SecureStore.getItemAsync(activeKey);
        if (storedItems) {
          setItems(JSON.parse(storedItems));
        }

        const savedKey = getSavedKey(u);
        const storedSaved = await SecureStore.getItemAsync(savedKey);
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
      setIsUserContextLoaded(false); // Reset on logout
      await SecureStore.deleteItemAsync(AUTH_KEY);
      setItems([]); // Limpa os itens do estado local
      setSavedPurchases([]); // Limpa as listas salvas da visão atual
      setUserName(''); // Limpa o nome do usuário
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
    const lowerInput = inputValue.toLowerCase();

    // Verificar se o item já existe na lista (case-insensitive)
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

    // Busca o grupo de forma case-insensitive nos arrays de sugestões
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
      quantidadeInputRef.current?.blur(); // Garante que o teclado feche se estava no campo de quantidade
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
    const creds = await SecureStore.getItemAsync(USER_CRED_KEY);
    const user = creds ? JSON.parse(creds).u : 'admin';
    
    await SecureStore.setItemAsync(getSavedKey(user), JSON.stringify(newList));
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

  const handleOpenPreview = (list: {name: string, items: Item[]}) => {
    setPreviewData(list);
    setIsPreviewModalVisible(true);
  };

  const handleDeleteSavedList = async (listName: string) => {
    Alert.alert('Excluir Lista Salva', `Tem certeza que deseja excluir "${listName}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        const newList = savedPurchases.filter(p => p.name !== listName);
        const creds = await SecureStore.getItemAsync(USER_CRED_KEY);
        const user = creds ? JSON.parse(creds).u : 'admin';
        await SecureStore.setItemAsync(getSavedKey(user), JSON.stringify(newList));
        setSavedPurchases(newList);
      }}
    ]);
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
  
  const handleSortChange = () => {
    setSortBy(prev => prev === 'alphabetical' ? 'none' : 'alphabetical');
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
  
    allSuggestions.forEach(({ item, grupo }) => {
      const normalizedItem = normalizeString(item.toLowerCase());
      if (normalizedItem.startsWith(query)) {
        startsWithMatches.push({ item, grupo });
      } else if (normalizedItem.includes(query)) {
        includesMatches.push({ item, grupo });
      }
    });
  
    // Combine startsWith matches first, then includes matches, and limit to 6
    return [...startsWithMatches, ...includesMatches].slice(0, 6);
  }, [input]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const groupComparison = a.grupo.localeCompare(b.grupo);
      if (groupComparison !== 0) return groupComparison;
      if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [items, sortBy]);

  if (isAuthLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Logo />
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <SplashScreen onFinish={handleLoginSuccess} />;
  }

  return (
    <View style={styles.container}>
      <View style={{ alignSelf: 'flex-start', marginBottom: 10, marginLeft: -10 }}>
        <Logo />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: '#1B5E20' }}>
          Olá, {userName}!
        </Text>
        <TouchableOpacity 
          onPress={() => setIsSavedListsModalVisible(true)}
          style={{ padding: 8, backgroundColor: '#E8F5E9', borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          <MaterialIcons name="list-alt" size={24} color="#2E7D32" />
          {savedPurchases.length > 0 && (
            <View style={{ backgroundColor: '#F44336', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{savedPurchases.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

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
                  quantidadeInputRef.current?.focus(); // Foca na quantidade após selecionar a sugestão
                }}>
                <Text>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <TextInput
            ref={quantidadeInputRef}
            style={[styles.quantidadeText, { width: 110 }]}
            placeholder="Quantidade"
            value={quantidade}
            onChangeText={setQuantidade}
            onFocus={() => setShowSuggestions(false)} // Esconde sugestões ao focar na quantidade
            keyboardType="numeric"
          />
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#4CAF50' }]} onPress={handleAddItem}>
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
          <TouchableOpacity 
            onPress={handleSortChange}
            style={{ padding: 5 }}
          >
            <MaterialIcons 
              name="sort" 
              size={28} 
              color={sortBy === 'alphabetical' ? '#4CAF50' : '#333'} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteAll} style={{ padding: 5 }}>
            <MaterialIcons name="delete-sweep" size={28} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={sortedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const showHeader = index === 0 || sortedItems[index - 1].grupo !== item.grupo;
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
                      borderLeftColor: '#1B5E20',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8
                }}>
                      <MaterialIcons name={groupIcons[item.grupo]} size={18} color="#1B5E20" />
                      <Text style={{ fontWeight: '900', color: '#1B5E20', textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.5 }}>{item.grupo}</Text>
                </View>
              )}
              <View style={styles.itemContainer}>
                <View style={styles.itemContent}>
                  <View>
                    <Text style={styles.itemText}>{item.name}</Text>
                    <View style={{ marginTop: 4 }}>
                      <Text style={[styles.itemText, { fontSize: 14, color: '#666', fontWeight: 'bold' }]}>Qtd: {formatDecimal(item.quantidade)}</Text>
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
          style={[styles.addBtn, { flex: 1, backgroundColor: '#FF9800' }, items.length === 0 && { backgroundColor: '#ccc' }]} 
          onPress={() => items.length > 0 && setIsSaveModalVisible(true)}
        >
          <Text style={styles.addBtnText}>Salvar Lista</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.addBtn, { flex: 1, backgroundColor: '#4CAF50' }, items.length === 0 && { backgroundColor: '#ccc' }]} 
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

      <Modal visible={isSaveModalVisible} transparent animationType="slide">
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <Text style={[styles.title, { fontSize: 22, color: '#1B5E20' }]}>Salvar Lista Atual</Text>
            <Text style={{ marginBottom: 15, textAlign: 'center' }}>Dê um nome para identificar esta compra futuramente.</Text>
            <TextInput
              style={[styles.input, { width: '100%' }]}
              value={saveName}
              onChangeText={setSaveName}
              placeholder="Ex: Lista 1"
              autoFocus
            />
            <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
              {savedPurchases.length}/5 listas salvas
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
              <TouchableOpacity 
                style={[styles.addBtn, { flex: 1, backgroundColor: '#ccc' }]} 
                onPress={() => setIsSaveModalVisible(false)}
              >
                <Text style={styles.addBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.addBtn, { flex: 1, backgroundColor: '#FF9800' }]} 
                onPress={handleSaveCurrentList}
              >
                <Text style={styles.addBtnText}>Gravar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isSavedListsModalVisible} transparent animationType="slide">
        <View style={localStyles.modalOverlay}>
          <View style={[localStyles.modalContent, { maxHeight: '70%', width: '90%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 15, alignItems: 'center' }}>
              <Text style={{ fontSize: 22, fontWeight: '900', color: '#1B5E20' }}>Listas Salvas</Text>
              <TouchableOpacity onPress={() => setIsSavedListsModalVisible(false)} style={{ padding: 5 }}>
                <MaterialIcons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={savedPurchases}
              keyExtractor={p => p.name}
              style={{ width: '100%' }}
              renderItem={({ item }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 }}>
                  <TouchableOpacity 
                    onPress={() => handleOpenPreview(item)}
                    style={{ flex: 1, backgroundColor: '#F1F8E9', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#C8E6C9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 16, color: '#2E7D32', fontWeight: 'bold' }}>{item.name}</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>{item.items.length} itens</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDeleteSavedList(item.name)}
                    style={{ padding: 10 }}
                  >
                    <MaterialIcons name="delete-outline" size={24} color="#F44336" />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>Nenhuma lista salva ainda.</Text>}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={isPreviewModalVisible} transparent animationType="fade">
        <View style={localStyles.modalOverlay}>
          <View style={[localStyles.modalContent, { maxHeight: '60%', width: '80%', padding: 15 }]}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#1B5E20', marginBottom: 10, textAlign: 'center' }}>
              {previewData?.name}
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 5 }}>
              <Text style={{ fontWeight: 'bold', color: '#1B5E20', flex: 1 }}>Produtos</Text>
              <Text style={{ fontWeight: 'bold', color: '#1B5E20' }}>Quantidades</Text>
            </View>

            <FlatList
              data={previewData?.items}
              keyExtractor={item => item.id}
              style={{ width: '100%', marginBottom: 15 }}
              renderItem={({ item }) => (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                  <Text style={{ color: '#333', fontSize: 14, flex: 1 }}>{item.name}</Text>
                  <Text style={{ color: '#666', fontSize: 14, fontWeight: 'bold' }}>{formatDecimal(item.quantidade)}</Text>
                </View>
              )}
            />

            <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
              <TouchableOpacity 
                style={[styles.addBtn, { flex: 1, backgroundColor: '#ccc', height: 45 }]} 
                onPress={() => setIsPreviewModalVisible(false)}
              >
                <Text style={styles.addBtnText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.addBtn, { flex: 1, backgroundColor: '#4CAF50', height: 45 }]} 
                onPress={() => previewData && handleLoadSavedList(previewData.items)}
              >
                <Text style={styles.addBtnText}>Usar Lista</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isGroupModalVisible} transparent animationType="slide">
        <View style={localStyles.modalOverlay}>
          <View style={[localStyles.modalContent, { width: '90%', maxHeight: '80%' }]}>
            <Text style={[styles.title, { fontSize: 20, color: '#1B5E20', marginBottom: 5 }]}>Selecione o Grupo</Text>
            <Text style={{ marginBottom: 15, color: '#666' }}>O item "{pendingItemName}" não foi reconhecido. Onde deseja encaixá-lo?</Text>
            
            <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {(Object.keys(groupIcons) as Array<Item['grupo']>).map((grupo) => (
                <TouchableOpacity 
                  key={grupo}
                  style={{ 
                    width: '48%', 
                    backgroundColor: '#F1F8E9', 
                    padding: 12, 
                    borderRadius: 10, 
                    marginBottom: 10, 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#C8E6C9'
                  }}
                  onPress={() => finalizeAddItem(grupo)}
                >
                  <MaterialIcons name={groupIcons[grupo]} size={20} color="#2E7D32" style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 13, color: '#2E7D32', fontWeight: 'bold' }}>{grupo}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.addBtn, { width: '100%', backgroundColor: '#ccc', marginTop: 10 }]} 
              onPress={() => {
                setIsGroupModalVisible(false);
                setPendingItemName('');
                setPendingItemQuantity('');
              }}
            >
              <Text style={styles.addBtnText}>Cancelar</Text>
            </TouchableOpacity>
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
