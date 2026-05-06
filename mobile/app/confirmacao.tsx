import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet, Animated, LayoutAnimation, Platform, UIManager, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { styles } from './(tabs)/style';
import { Logo } from '../components/logo';

const USER_CRED_KEY = 'userCredentials';
const getSavedKey = (user: string) => {
  const sanitized = (user || 'default').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `savedPurchases${sanitized}`;
};
const getActiveListKey = (user: string) => {
  const sanitized = (user || 'default').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `activeList${sanitized}`;
};
const formatDecimal = (val: string) => {
  if (!val) return '0.00';
  const num = parseFloat(val.replace(',', '.'));
  return isNaN(num) ? '0.00' : num.toFixed(2);
};
const STORAGE_KEY = 'shoppingList';

// Habilita animações de layout no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Item {
  id: string;
  name: string;
  quantidade: string;
  grupo: 'Alimentício' | 'Higiene' | 'Frios' | 'Frutas' | 'Padaria' | 'Bebidas' | 'PetShop' | 'Utilidades' | 'Escolar';
  status: 'pending' | 'confirmed' | 'not_purchased';
  isConfirming?: boolean;
  isConfirmed?: boolean;
}

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
};

const ConfirmationOverlay = ({ isConfirmed, isConfirming }: { isConfirmed?: boolean; isConfirming?: boolean }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reinicia e dispara a animação sempre que o estado mudar
    anim.setValue(0);
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 40,
    }).start();
  }, [isConfirmed, isConfirming]);

  if (isConfirming) {
    return (
      <Animated.View style={[localStyles.centeredOverlay, { opacity: anim, transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.3] }) }] }]}>
        <MaterialIcons name="thumb-up" size={44} color="#00DF82" />
      </Animated.View>
    );
  }

  if (isConfirmed) {
    return (
      <Animated.Text style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        fontSize: 45,
        fontWeight: 'bold',
        color: 'rgba(27, 94, 32, 0.1)', // Verde escuro com 10% de opacidade para melhor visibilidade
        textAlign: 'center',
        textAlignVertical: 'center',
        opacity: anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 1] }),
        transform: [{ rotate: '-15deg' }, { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [3, 1] }) }]
      }}>OK</Animated.Text>
    );
  }

  return null;
};

const SummaryModal = ({ visible, summary, onClose, onGoHome }: {
  visible: boolean;
  summary: {
    totalItems: number;
    confirmedItems: number;
    notPurchasedItemsCount: number;
    remainingItems: number;
  } | null;
  onClose: () => void;
  onGoHome: () => void;
}) => {
  if (!summary) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
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
          }]}>Resumo das Compras</Text>
          <Text style={{ fontSize: 16, marginBottom: 5 }}>Total de itens na lista: {summary.totalItems}</Text>
          <Text style={{ fontSize: 16, marginBottom: 5 }}>Itens comprados: {summary.confirmedItems}</Text>
          <Text style={{ fontSize: 16, marginBottom: 5 }}>Itens não comprados: {summary.notPurchasedItemsCount}</Text>
          <Text style={{ fontSize: 16, marginBottom: 15 }}>Itens restantes: {summary.remainingItems}</Text>

          <TouchableOpacity style={styles.addBtn} onPress={onGoHome}>
            <Text style={styles.addBtnText}>Voltar para o Início</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const NotPurchasedModal = ({ visible, items, onClose, onRestore }: {
  visible: boolean;
  items: Item[];
  onClose: () => void;
  onRestore: (item: Item) => void;
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={localStyles.modalOverlay}>
        <View style={[localStyles.modalContent, { height: '65%', width: '90%' }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#1B5E20' }}>Não Comprados</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 5 }}>
              <MaterialIcons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            style={{ width: '100%' }}
            renderItem={({ item }) => (
              <View style={[styles.itemContainer, { marginBottom: 10, opacity: 0.9, backgroundColor: '#FFF3E0', borderColor: '#FFE0B2' }]}>
                <View style={styles.itemContent}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemText, { color: '#E65100' }]}>{item.name}</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>Qtd: {formatDecimal(item.quantidade)}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => onRestore(item)}
                    style={{ backgroundColor: '#4CAF50', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}
                  >
                    <MaterialIcons name="settings-backup-restore" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>Nenhum item nesta lista.</Text>}
          />
        </View>
      </View>
    </Modal>
  );
};

export default function ConfirmacaoScreen() {
  useKeepAwake(); // Mantém a tela ligada enquanto esta tela estiver aberta

  const router = useRouter();
  const { sortBy } = useLocalSearchParams<{ sortBy: 'none' | 'group' }>();
  const [shoppingList, setShoppingList] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
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
          status: item.status || 'pending', // Garante que o status esteja definido
          isConfirmed: item.status === 'confirmed' // Inicializa o estado visual
        }));
        setShoppingList(parsedItems);
      }
      
      // Simula um carregamento fake rápido para uma transição mais fluida
      setTimeout(() => {
        setLoading(false);
      }, 800);
    };
    loadItems();
  }, []);

  // Salva a lista sempre que houver alterações no status ou quantidade
  useEffect(() => {
    const saveItems = async () => {
      if (shoppingList.length > 0) {
        const creds = await SecureStore.getItemAsync(USER_CRED_KEY);
        const user = creds ? JSON.parse(creds).u : 'admin';
        const activeKey = getActiveListKey(user);
        await SecureStore.setItemAsync(activeKey, JSON.stringify(shoppingList));
      }
    };
    saveItems();
  }, [shoppingList]);

  const sortedActiveItems = useMemo(() => {
    const list = shoppingList.filter(item => item.status === 'pending' || item.status === 'confirmed');
    return sortBy === 'group' ? list.sort((a, b) => a.grupo.localeCompare(b.grupo)) : list;
  }, [shoppingList, sortBy]);

  const sortedNotPurchasedItems = useMemo(() => {
    const list = shoppingList.filter(item => item.status === 'not_purchased');
    return sortBy === 'group' ? list.sort((a, b) => a.grupo.localeCompare(b.grupo)) : list;
  }, [shoppingList, sortBy]);

  const handleConfirmItem = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShoppingList(prev => prev.map(i => i.id === id ? { ...i, isConfirming: true } : i));
    
    setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      setShoppingList(prev => 
        prev.map(i => i.id === id ? { ...i, status: 'confirmed', isConfirmed: true, isConfirming: false } : i)
      );
    }, 600); // Reduzi levemente o tempo para a transição parecer mais rápida
  };

  const handleCancelConfirm = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShoppingList(prev => prev.map(i => i.id === id ? { ...i, status: 'pending', isConfirmed: false, isConfirming: false } : i));
  };

  const handleMoveToNotPurchased = (item: any) => {
    setShoppingList(prev => prev.map(i => i.id === item.id ? { ...i, status: 'not_purchased' } : i));
  };

  const handleMoveBack = (item: any) => {
    setShoppingList(prev => prev.map(i => i.id === item.id ? { ...i, status: 'pending' } : i));
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setNewQuantity(item.quantidade);
    setModalVisible(true);
  };

  const saveEdit = () => {
    const update = (list: any[]) => list.map(i => i.id === editingItem.id ? { ...i, quantidade: formatDecimal(newQuantity) } : i);
    setShoppingList(update);
    setModalVisible(false);
  };

  const ActionButton = ({ icon, color, onPress, size = 24 }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      style={{ 
        backgroundColor: color, 
        width: 36, height: 36, borderRadius: 18, 
        justifyContent: 'center', alignItems: 'center', marginLeft: 8 
      }}
    >
      <MaterialIcons name={icon} size={size} color="white" />
    </TouchableOpacity>
  );

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

      // Salvamos o estado original dos itens para que possam ser reusados como "pendentes" no futuro
      const itemsToSave = shoppingList.map(i => ({ ...i, status: 'pending', isConfirmed: false, isConfirming: false }));
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
      
      Alert.alert(
        'Salvar Lista?',
        'Deseja salvar esta lista de compras para usar novamente no futuro?',
        [
          { text: 'Não', onPress: () => setShowSummaryModal(true) },
          { text: 'Sim, Salvar', onPress: () => setIsSaveModalVisible(true) }
        ]
      );
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

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }]}>
        <View style={{ marginBottom: 20 }}>
          <Logo />
        </View>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ 
          marginTop: 15, 
          color: '#1B5E20', 
          fontWeight: '900', 
          fontSize: 16,
          textTransform: 'uppercase'
        }}>
          Organizando Carrinho...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingTop: 10 }}>
        <Logo />
        {sortedNotPurchasedItems.length > 0 && (
          <TouchableOpacity 
            onPress={() => setShowNotPurchasedModal(true)}
            style={{ position: 'relative', padding: 5, marginRight: 5 }}
          >
            <MaterialIcons name="shopping-basket" size={32} color="#FF9800" />
            <View style={{ 
              position: 'absolute', top: 0, right: 0, 
              backgroundColor: '#F44336', borderRadius: 10, 
              minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center',
              paddingHorizontal: 4, borderWidth: 2, borderColor: '#fff'
            }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{sortedNotPurchasedItems.length}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={sortedActiveItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const showHeader = sortBy === 'group' && (index === 0 || sortedActiveItems[index - 1].grupo !== item.grupo);
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
              <View style={[styles.itemContainer, (item.status === 'confirmed' || item.isConfirming) && { backgroundColor: '#d4edda', borderColor: '#c3e6cb' }]}>
                <ConfirmationOverlay isConfirmed={item.status === 'confirmed'} isConfirming={item.isConfirming} />
                <View style={styles.itemContent}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemText, (item.status === 'confirmed' || item.isConfirming) && { color: '#155724', fontWeight: item.status === 'confirmed' ? 'bold' : 'normal' }]}>{item.name}</Text>
                    <View style={{ marginTop: 4 }}>
                      <Text style={[styles.itemText, { fontSize: 14, color: '#666', fontWeight: 'bold' }, (item.status === 'confirmed' || item.isConfirming) && { color: '#155724' }]}>Qtd: {formatDecimal(item.quantidade)}</Text>
                    </View>
                    {sortBy !== 'group' && <Text style={{ fontSize: 12, color: '#666' }}>{item.grupo}</Text>}
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    {item.status === 'confirmed' || item.isConfirming ? (
                      <ActionButton icon="remove" color="#F44336" onPress={() => handleCancelConfirm(item.id)} />
                    ) : (
                      <>
                        <ActionButton icon="check" color="#4CAF50" onPress={() => handleConfirmItem(item.id)} />
                        <ActionButton icon="edit" color="#2196F3" onPress={() => openEditModal(item)} size={20} />
                        <ActionButton icon="warning" color="#FF9800" onPress={() => handleMoveToNotPurchased(item)} size={20} />
                      </>
                    )}
                  </View>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginVertical: 10 }}>Nenhum item pendente.</Text>}
      />

      <Modal visible={modalVisible} transparent animationType="fade">
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
            }]}>Editar Quantidade</Text>
            <Text style={{ marginBottom: 10 }}>{editingItem?.name}</Text>
            <TextInput
              style={[styles.input, { width: '100%' }]}
              value={newQuantity}
              onChangeText={setNewQuantity}
              keyboardType="numeric"
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
              <TouchableOpacity 
                style={[styles.addBtn, { flex: 1, backgroundColor: '#ccc' }]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.addBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.addBtn, { flex: 1 }]} 
                onPress={saveEdit}
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
            <Text style={[styles.title, { fontSize: 22, color: '#1B5E20' }]}>Salvar esta Compra</Text>
            <TextInput
              style={[styles.input, { width: '100%' }]}
              value={saveName}
              onChangeText={setSaveName}
              placeholder="Ex: Compras Semanal"
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
              <TouchableOpacity 
                style={[styles.addBtn, { flex: 1, backgroundColor: '#ccc' }]} 
                onPress={() => { setIsSaveModalVisible(false); setShowSummaryModal(true); }}
              >
                <Text style={styles.addBtnText}>Pular</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.addBtn, { flex: 1, backgroundColor: '#4CAF50' }]} 
                onPress={handleSavePurchase}
              >
                <Text style={styles.addBtnText}>Gravar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <SummaryModal
        visible={showSummaryModal}
        summary={summaryData}
        onClose={() => setShowSummaryModal(false)}
        onGoHome={async () => { 
          const creds = await SecureStore.getItemAsync(USER_CRED_KEY);
          const user = creds ? JSON.parse(creds).u : 'admin';
          const activeKey = getActiveListKey(user);
          await SecureStore.deleteItemAsync(activeKey); 
          setShowSummaryModal(false); 
          router.replace('/'); 
        }}
      />

      <NotPurchasedModal
        visible={showNotPurchasedModal}
        items={sortedNotPurchasedItems}
        onClose={() => setShowNotPurchasedModal(false)}
        onRestore={handleMoveBack}
      />

      <TouchableOpacity style={styles.addBtn} onPress={() => router.back()}>
        <Text style={styles.addBtnText}>Voltar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#4CAF50' }]} onPress={handleFinishShopping}>
        <Text style={styles.addBtnText}>Finalizar Compras</Text>
      </TouchableOpacity>
    </View>
  );
}

const localStyles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%', alignItems: 'center' },
  centeredOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 5 },
});