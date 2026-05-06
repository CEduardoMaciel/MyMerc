import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet, Animated, LayoutAnimation, Platform, UIManager, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './(tabs)/style';

const STORAGE_KEY = 'shoppingList';

// Habilita animações de layout no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Item {
  id: string;
  name: string;
  quantidade: string;
  grupo: 'Alimentício' | 'Higiene';
  status: 'pending' | 'confirmed' | 'not_purchased';
  isConfirming?: boolean;
  isConfirmed?: boolean;
}

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
        color: 'rgba(0, 0, 0, 0.05)',
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

export default function ConfirmacaoScreen() {
  const router = useRouter();
  const { sortBy } = useLocalSearchParams<{ sortBy: 'none' | 'group' }>();
  const [shoppingList, setShoppingList] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    totalItems: number;
    confirmedItems: number;
    notPurchasedItemsCount: number;
    remainingItems: number;
  } | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      const stored = await SecureStore.getItemAsync(STORAGE_KEY);
      if (stored) {
        const parsedItems: Item[] = JSON.parse(stored).map((item: Item) => ({
          ...item,
          status: item.status || 'pending', // Garante que o status esteja definido
          isConfirmed: item.status === 'confirmed' // Inicializa o estado visual
        }));
        setShoppingList(parsedItems);
      }
    };
    loadItems();
  }, []);

  // Salva a lista sempre que houver alterações no status ou quantidade
  useEffect(() => {
    const saveItems = async () => {
      if (shoppingList.length > 0) {
        await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(shoppingList));
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
    const update = (list: any[]) => list.map(i => i.id === editingItem.id ? { ...i, quantidade: newQuantity } : i);
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

  const handleFinishShopping = () => {
    Alert.alert(
      'Finalizar Compras',
      'Deseja realmente finalizar as compras e ver o resumo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          onPress: () => {
            const confirmed = shoppingList.filter(item => item.status === 'confirmed').length;
            const notPurchased = shoppingList.filter(item => item.status === 'not_purchased').length;
            const remaining = shoppingList.filter(item => item.status === 'pending').length;

            setSummaryData({
              totalItems: shoppingList.length,
              confirmedItems: confirmed,
              notPurchasedItemsCount: notPurchased,
              remainingItems: remaining,
            });
            setShowSummaryModal(true);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { 
        fontSize: 28, 
        fontWeight: '900', 
        color: '#1B5E20', 
        letterSpacing: -1,
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10 
      }]}>Itens para Comprar</Text>
      <FlatList
        data={sortedActiveItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.itemContainer, (item.status === 'confirmed' || item.isConfirming) && { backgroundColor: '#d4edda', borderColor: '#c3e6cb' }]}>
            <ConfirmationOverlay isConfirmed={item.status === 'confirmed'} isConfirming={item.isConfirming} />
            <View style={styles.itemContent}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemText, (item.status === 'confirmed' || item.isConfirming) && { color: '#155724', fontWeight: item.status === 'confirmed' ? 'bold' : 'normal' }]}>{item.name} ({item.quantidade})</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>{item.grupo}</Text>
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
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginVertical: 10 }}>Nenhum item pendente.</Text>}
      />

      {sortedNotPurchasedItems.length > 0 && (
        <>
          <Text style={[styles.title, { 
            marginTop: 20,
            fontSize: 24, 
            fontWeight: '900', 
            color: '#1B5E20', 
            letterSpacing: -1,
            textShadowColor: 'rgba(255, 255, 255, 0.8)',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 10 
          }]}>Não comprados</Text>
          <FlatList
            data={sortedNotPurchasedItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.itemContainer, { opacity: 0.7 }]}>
                <View style={styles.itemContent}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemText}>{item.name} ({item.quantidade})</Text>
                  </View>
                  <ActionButton icon="settings-backup-restore" color="#9E9E9E" onPress={() => handleMoveBack(item)} />
                </View>
              </View>
            )}
          />
        </>
      )}

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

      <SummaryModal
        visible={showSummaryModal}
        summary={summaryData}
        onClose={() => setShowSummaryModal(false)}
        onGoHome={async () => { await SecureStore.deleteItemAsync(STORAGE_KEY); setShowSummaryModal(false); router.replace('/'); }}
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