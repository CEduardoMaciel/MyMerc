import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './(tabs)/style';

const STORAGE_KEY = 'shoppingList';

// Habilita animações de layout no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ConfirmationOverlay = ({ isConfirmed, isConfirming }: { isConfirmed: boolean; isConfirming: boolean }) => {
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
        <MaterialIcons name="thumb-up" size={44} color="#4CAF50" />
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

export default function ConfirmacaoScreen() {
  const router = useRouter();
  const { sortBy } = useLocalSearchParams<{ sortBy: 'none' | 'group' }>();
  const [items, setItems] = useState<any[]>([]);
  const [notPurchasedItems, setNotPurchasedItems] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadItems = async () => {
      const stored = await SecureStore.getItemAsync(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    };
    loadItems();
  }, []);

  const sortedItems = useMemo(() => {
    const list = [...items];
    return sortBy === 'group' ? list.sort((a, b) => a.grupo.localeCompare(b.grupo)) : list;
  }, [items, sortBy]);

  const sortedNotPurchased = useMemo(() => {
    const list = [...notPurchasedItems];
    return sortBy === 'group' ? list.sort((a, b) => a.grupo.localeCompare(b.grupo)) : list;
  }, [notPurchasedItems, sortBy]);

  const handleConfirmItem = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItems(prev => prev.map(i => i.id === id ? { ...i, isConfirming: true } : i));
    
    setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      setItems(prev => 
        prev.map(i => i.id === id ? { ...i, isConfirmed: true, isConfirming: false } : i)
      );
    }, 600); // Reduzi levemente o tempo para a transição parecer mais rápida
  };

  const handleCancelConfirm = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItems(prev => prev.map(i => i.id === id ? { ...i, isConfirmed: false, isConfirming: false } : i));
  };

  const handleMoveToNotPurchased = (item: any) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    setNotPurchasedItems(prev => [...prev, item]);
  };

  const handleMoveBack = (item: any) => {
    setNotPurchasedItems(prev => prev.filter(i => i.id !== item.id));
    setItems(prev => [...prev, item]);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setNewQuantity(item.quantidade);
    setModalVisible(true);
  };

  const saveEdit = () => {
    const update = (list: any[]) => list.map(i => i.id === editingItem.id ? { ...i, quantidade: newQuantity } : i);
    setItems(update);
    setNotPurchasedItems(update);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Itens para Comprar</Text>
      <FlatList
        data={sortedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.itemContainer, (item.isConfirmed || item.isConfirming) && { backgroundColor: '#d4edda', borderColor: '#c3e6cb' }]}>
            <ConfirmationOverlay isConfirmed={item.isConfirmed} isConfirming={item.isConfirming} />
            <View style={styles.itemContent}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemText, (item.isConfirmed || item.isConfirming) && { color: '#155724' }]}>{item.name} ({item.quantidade})</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>{item.grupo}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                {item.isConfirmed || item.isConfirming ? (
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

      {notPurchasedItems.length > 0 && (
        <>
          <Text style={[styles.title, { marginTop: 20 }]}>Não comprados</Text>
          <FlatList
            data={sortedNotPurchased}
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
            <Text style={styles.title}>Editar Quantidade</Text>
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

      <TouchableOpacity style={styles.addBtn} onPress={() => router.back()}>
        <Text style={styles.addBtnText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const localStyles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%', alignItems: 'center' },
  centeredOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 5 },
});