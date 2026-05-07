import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet, LayoutAnimation, Platform, UIManager, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { styles } from './(tabs)/style';
import { Logo } from '../components/logo'; // Assuming this path is correct
import { USER_CRED_KEY, getActiveListKey, formatDecimal } from './utils'; // formatDecimal agora é importado
import { groupIcons } from '../constants'; 
import { ConfirmationOverlay } from '../ConfirmationOverlay';
import { SummaryModal } from '../SummaryModal';
import { NotPurchasedModal } from '../NotPurchasedModal'; 
import { ActionButton } from '../ActionButton'; 
import { useConfirmationLogic } from '../useConfirmationLogic';

// Habilita animações de layout no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ConfirmationItem { // Renamed to avoid conflict with Item from constants
  id: string;
  name: string;
  quantidade: string;
  grupo: 'Alimentício' | 'Higiene' | 'Frios' | 'Frutas' | 'Padaria' | 'Bebidas' | 'PetShop' | 'Utilidades' | 'Escolar' | 'Outros';
  status: 'pending' | 'confirmed' | 'not_purchased';
  isConfirming?: boolean;
  isConfirmed?: boolean;
}


export default function ConfirmacaoScreen() {
  useKeepAwake(); // Mantém a tela ligada enquanto esta tela estiver aberta

  const router = useRouter();
  const { sortBy } = useLocalSearchParams<{ sortBy: 'none' | 'alphabetical' }>();

  const {
    shoppingList,
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
  } = useConfirmationLogic({ sortBy, router });

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
          const showHeader = index === 0 || (sortedActiveItems[index - 1] && sortedActiveItems[index - 1].grupo !== item.grupo);
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
              <View style={[styles.itemContainer, (item.status === 'confirmed' || item.isConfirming) ? { backgroundColor: '#d4edda', borderColor: '#c3e6cb' } : {}]}>
                <ConfirmationOverlay isConfirmed={item.status === 'confirmed'} isConfirming={item.isConfirming} />
                <View style={styles.itemContent}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemText, (item.status === 'confirmed' || item.isConfirming) && { color: '#155724', fontWeight: item.status === 'confirmed' ? 'bold' : 'normal' }]}>{item.name}</Text>
                    <View style={{ marginTop: 4 }}>
                      <Text style={[styles.itemText, { fontSize: 14, color: '#666', fontWeight: 'bold' }, (item.status === 'confirmed' || item.isConfirming) && { color: '#155724' }]}>Qtd: {formatDecimal(item.quantidade)}</Text>
                    </View> 
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    {item.status === 'confirmed' || item.isConfirming ? (
                      <ActionButton icon="remove" color="#F44336" onPress={() => handleCancelConfirm(item.id)} />
                    ) : (
                      <>
                        <ActionButton icon="check" color="#4CAF50" onPress={() => handleConfirmItem(item.id)} />
                        <ActionButton icon="edit" color="#2196F3" onPress={() => openEditModal(item as ConfirmationItem)} size={20} />
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
            <Text style={[styles.title, { fontSize: 22, color: '#1B5E20' }]}>Salvar Itens Comprados</Text>
            <Text style={{ marginBottom: 15, textAlign: 'center', color: '#666' }}>
              Dê um nome para salvar apenas os itens que você marcou como comprados nesta lista.
            </Text>
            <TextInput
              style={[styles.input, { width: '100%' }]}
              value={saveName}
              onChangeText={setSaveName}
              placeholder="Ex: Lista 1"
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
              <TouchableOpacity 
                style={[styles.addBtn, { flex: 1, backgroundColor: '#ccc' }]} 
                onPress={() => { setIsSaveModalVisible(false); setShowSummaryModal(true); }}
              >
                <Text style={styles.addBtnText}>Finalizar</Text>
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

const localStyles = StyleSheet.create({ // Moved localStyles here
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%', alignItems: 'center' },
});