import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet, LayoutAnimation, Platform, UIManager, Alert, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { useRouter, useLocalSearchParams, Link } from 'expo-router';
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
import { GroupSelectionModal } from '../GroupSelectionModal'; // Importar GroupSelectionModal
import { useConfirmationLogic } from '../useConfirmationLogic';
import { useAuthAndDataLoading } from '../useAuthAndDataLoading';

// Habilita animações de layout no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}


export default function ConfirmacaoScreen() {
  useKeepAwake(); // Mantém a tela ligada enquanto esta tela estiver aberta
  const tempQuantidadeInputRef = useRef<TextInput>(null);

  const router = useRouter();
  const { sortBy } = useLocalSearchParams<{ sortBy: 'none' | 'alphabetical' }>();
  const { settings, setItems } = useAuthAndDataLoading();

  const isDark = settings.theme === 'dark';
  const theme = {
    background: isDark ? '#1E1E1E' : '#f5f5f5',
    surface: isDark ? '#252526' : '#fff',
    text: isDark ? '#D4D4D4' : '#333',
    title: isDark ? '#4CAF50' : '#1B5E20',
    subtitle: isDark ? '#858585' : '#666',
    inputBg: isDark ? '#3C3C3C' : '#fff',
    inputBorder: isDark ? '#333' : '#ddd',
    cardBorder: isDark ? '#333' : '#eee',
    headerBg: isDark ? '#2D2D2D' : '#f1f8e9',
    headerBorder: isDark ? '#4CAF50' : '#1B5E20',
    modalBg: isDark ? '#1E1E1E' : '#fff',
  };

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
  } = useConfirmationLogic({ sortBy, router });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }]}>
        <View style={{ marginBottom: 20 }}>
          <Logo />
        </View>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ 
          marginTop: 15, 
          color: theme.title, 
          fontWeight: '900', 
          fontSize: 16,
          textTransform: 'uppercase'
        }}>
          Organizando Carrinho...
        </Text>
      </View>
    );
  }

  const anyExpanded = Object.values(expandedGroups).some(v => v);

  const totalActiveItems = useMemo(() => {
    const activeInList = shoppingList.filter(i => i.status !== 'not_purchased').length;
    const activeInTemp = tempItems.filter(i => i.status !== 'not_purchased').length;
    return activeInList + activeInTemp;
  }, [shoppingList, tempItems]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingTop: 10 }}>
        <Logo />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 5 }}>
        <Text style={[styles.title, { 
          marginBottom: 0,
          fontSize: 24, 
          fontWeight: '900', 
          color: theme.title, 
          letterSpacing: -1
        }]}>Itens para Compra ({totalActiveItems})</Text>
        
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity 
            onPress={() => setIsTempAddModalVisible(true)} 
            style={{ 
              padding: 8, 
              backgroundColor: theme.title, 
              borderRadius: 12,
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.23,
              shadowRadius: 2.62,
            }}
          >
            <MaterialIcons 
              name="add-shopping-cart" 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => toggleAllGroups(!anyExpanded)} 
            style={{ padding: 6, backgroundColor: theme.headerBg, borderRadius: 10 }}
          >
            <MaterialIcons 
              name={anyExpanded ? "unfold-less" : "unfold-more"} 
              size={24} 
              color={theme.title} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={displayList}
        keyExtractor={(row) => row.id}
        renderItem={({ item: row }) => {
          if (row.type === 'header') {
            return (
              <TouchableOpacity onPress={() => toggleGroup(row.grupo)} style={{
                backgroundColor: theme.headerBg,
                paddingVertical: 4,
                paddingHorizontal: 10,
                marginTop: 12,
                marginBottom: 6,
                borderRadius: 6,
                borderLeftWidth: 4,
                borderLeftColor: theme.headerBorder,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8
              }}>
                <MaterialIcons name={groupIcons[row.grupo]} size={18} color={theme.title} />
                <Text style={{ fontWeight: '900', color: theme.title, textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.5 }}>
                  {row.grupo} ({row.count})
                </Text>
                <MaterialIcons
                  name={row.isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                  size={24}
                  color="#1B5E20"
                  style={{ marginLeft: 'auto' }}
                />
              </TouchableOpacity>
            );
          } else { // row.type === 'item'
            const item = row.item;
            return (
              <View style={[
                styles.itemContainer,
                (item.status === 'confirmed' || item.isConfirming) ? { backgroundColor: isDark ? '#1B3C24' : '#d4edda', borderColor: isDark ? '#2E7D32' : '#c3e6cb' } : { backgroundColor: theme.surface, borderColor: theme.cardBorder },
                { padding: 8, marginBottom: 6, borderLeftWidth: 0 }
              ]}>
                <ConfirmationOverlay isConfirmed={item.status === 'confirmed'} isConfirming={item.isConfirming} />
                <View style={styles.itemContent}>
                  <View style={{ flex: 1 }}>
                    <Text style={[
                      styles.itemText,
                      { fontSize: 15 },
                      (item.status === 'confirmed' || item.isConfirming) ? { color: isDark ? '#81C784' : '#155724', fontWeight: item.status === 'confirmed' ? 'bold' : 'normal' } : { color: theme.text }
                    ]}>
                      {item.isTemp && <MaterialIcons name="star-outline" size={14} color="#FF9800" />} {item.name}
                    </Text>
                    <View style={{ marginTop: 2 }}>
                      <Text style={[
                        styles.itemText,
                        { fontSize: 13, color: theme.subtitle, fontWeight: 'bold' },
                        (item.status === 'confirmed' || item.isConfirming) && { color: isDark ? '#81C784' : '#155724' }
                      ]}>Qtd: {formatDecimal(item.quantidade)}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    {item.status === 'confirmed' || item.isConfirming ? (
                      <ActionButton icon="remove" color="#F44336" onPress={() => handleCancelConfirm(item.id)} size={22} />
                    ) : (
                      <>
                        <ActionButton icon="check" color="#4CAF50" onPress={() => handleConfirmItem(item.id)} size={22} />
                        <ActionButton icon="edit" color="#2196F3" onPress={() => openEditModal(item)} size={18} />
                        {item.isTemp ? (
                          <ActionButton icon="delete" color="#F44336" onPress={() => handleDeleteTempItem(item.id)} size={18} />
                        ) : (
                          <ActionButton icon="warning" color="#FF9800" onPress={() => handleMoveToNotPurchased(item)} size={18} />
                        )}
                      </>
                    )}
                  </View>
                </View>
              </View>
            );
          }
        }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginVertical: 10, color: theme.subtitle }}>Nenhum item pendente.</Text>}
      />

      {/* Botões de Ação */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 20, paddingBottom: 20 }}>
        <TouchableOpacity style={[styles.addBtn, { flex: 1, backgroundColor: '#F44336' }]} onPress={handleCancelShopping}>
          <Text style={styles.addBtnText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.addBtn, { flex: 1, backgroundColor: '#4CAF50' }]} onPress={handleFinishShopping}>
          <Text style={styles.addBtnText}>Finalizar Compras</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para Adicionar Item Temporário */}
      <Modal visible={isTempAddModalVisible} transparent animationType="slide">
        <View style={localStyles.modalOverlay}>
          <View style={[localStyles.modalContent, { width: '85%', backgroundColor: theme.modalBg }]}>
            <Text style={[styles.title, { fontSize: 22, color: theme.title, marginBottom: 10 }]}>Adicionar Item Extra</Text>
            <Text style={{ fontSize: 12, color: theme.subtitle, marginBottom: 15, textAlign: 'center' }}>
              Este item é temporário e não afeta sua lista original.
            </Text>
            <View style={{ width: '100%', zIndex: 12 }}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                placeholder="Nome do produto"
                value={tempInput}
                placeholderTextColor={isDark ? '#858585' : '#999'}
                onChangeText={(value) => {
                  setTempInput(value);
                  setShowTempSuggestions(true);
                }}
                onFocus={() => setShowTempSuggestions(true)}
              />
              {showTempSuggestions && filteredTempSuggestions.length > 0 && tempInput.trim() !== '' && (
                <View style={[styles.suggestionBox, { position: 'absolute', top: 50, left: 0, right: 0, backgroundColor: theme.surface, borderColor: theme.inputBorder, zIndex: 13, elevation: 5 }]}>
                  {filteredTempSuggestions.map(({ item }) => (
                    <TouchableOpacity
                      key={item}
                      style={[styles.suggestionItem, { borderBottomColor: theme.cardBorder }]}
                      onPress={() => {
                        setTempInput(item);
                        setShowTempSuggestions(false);
                        tempQuantidadeInputRef.current?.focus();
                      }}>
                      <Text style={{ color: theme.text }}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <TextInput
              ref={tempQuantidadeInputRef}
              style={[styles.input, { width: '100%', marginTop: 10, backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
              placeholder="Quantidade"
              value={tempQuantidade}
              placeholderTextColor={isDark ? '#858585' : '#999'}
              onChangeText={setTempQuantidade}
              onFocus={() => setShowTempSuggestions(false)}
              keyboardType="numeric"
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 15, width: '100%' }}>
              <TouchableOpacity 
                style={[styles.addBtn, { flex: 1, backgroundColor: '#F44336' }]} 
                onPress={() => {
                  setIsTempAddModalVisible(false);
                  setTempInput('');
                  setTempQuantidade('');
                }}
              >
                <Text style={styles.addBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.addBtn, { flex: 1, backgroundColor: '#4CAF50' }]} 
                onPress={handleAddNewTempItem}
              >
                <Text style={styles.addBtnText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={localStyles.modalOverlay}>
          <View style={[localStyles.modalContent, { backgroundColor: theme.modalBg }]}>
            <Text style={[styles.title, { 
              fontSize: 24, 
              fontWeight: '900', 
              color: theme.title, 
              letterSpacing: -1
            }]}>Editar Quantidade</Text>
            <Text style={{ marginBottom: 10, color: theme.text }}>{editingItem?.name}</Text>
            <TextInput
              style={[styles.input, { width: '100%', backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
              value={newQuantity}
              onChangeText={setNewQuantity}
              keyboardType="numeric"
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
              <TouchableOpacity 
                style={[styles.addBtn, { flex: 1, backgroundColor: '#F44336' }]} 
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
          <View style={[localStyles.modalContent, { backgroundColor: theme.modalBg }]}>
            <Text style={[styles.title, { fontSize: 22, color: theme.title }]}>Salvar Itens Comprados</Text>
            <Text style={{ marginBottom: 15, textAlign: 'center', color: theme.subtitle }}>
              Dê um nome para salvar apenas os itens que você marcou como comprados nesta lista.
            </Text>
            <TextInput
              style={[styles.input, { width: '100%', backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
              value={saveName}
              onChangeText={setSaveName}
              placeholderTextColor={isDark ? '#858585' : '#999'}
              placeholder="Ex: Lista 1"
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
              <TouchableOpacity 
                style={[styles.addBtn, { flex: 1, backgroundColor: '#2196F3' }]} 
                onPress={() => { setIsSaveModalVisible(false); setShowSummaryModal(true); }}
              >
                <Text style={styles.addBtnText}>Voltar</Text>
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
        onSaveQuickList={handleSaveQuickList}
        onGoHome={async () => { 
          const creds = await SecureStore.getItemAsync(USER_CRED_KEY);
          const user = creds ? JSON.parse(creds).u : 'admin';
          const activeKey = getActiveListKey(user);
          await SecureStore.deleteItemAsync(activeKey); 
          setItems([]); // Limpa o estado global para que a tela inicial abra sem itens
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

      <GroupSelectionModal
        visible={isTempGroupModalVisible}
        pendingItemName={pendingTempItemName}
        onSelectGroup={finalizeAddNewTempItem}
        onCancel={() => {
          setTempGroupModalVisible(false);
          setPendingTempItemName('');
          setPendingTempItemQuantity('');
        }}
      />
    </View>
    </KeyboardAvoidingView>
  );
}

const localStyles = StyleSheet.create({ // Moved localStyles here
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%', alignItems: 'center' },
});