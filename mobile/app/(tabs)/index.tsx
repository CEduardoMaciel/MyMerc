import React, { useState, useMemo, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Logo } from '@/components/logo';
import SplashScreen from '../SplashScreen';
import { formatDecimal } from '../utils';
import { groupIcons } from '../../constants';
import { useAuthAndDataLoading } from '../../useAuthAndDataLoading';
import { useShoppingList } from '../../useShoppingList';
import { useSavedLists } from '../../useSavedLists';
import { ItemEditModal } from '../../ItemEditModal';
import { SaveListModal } from '../../SaveListModal';
import { SavedListsModal } from '../../SavedListsModal';
import { PreviewSavedListModal } from '../../PreviewSavedListModal';
import { GroupSelectionModal } from '../../GroupSelectionModal';
import { styles } from './style';

export default function HomeScreen() {
  const [sortBy, setSortBy] = useState<'none' | 'alphabetical'>('none');
  const quantidadeInputRef = useRef<TextInput>(null);
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  const {
    isLoggedIn, isAuthLoading, userName, isUserContextLoaded,
    handleLoginSuccess, handleLogout, items, setItems,
    savedPurchases, setSavedPurchases
  } = useAuthAndDataLoading();

  const {
    input, setInput, quantidade, setQuantidade, showSuggestions, setShowSuggestions,
    pendingItemName, setPendingItemName, pendingItemQuantity, setPendingItemQuantity,
    isGroupModalVisible, setIsGroupModalVisible,
    editingItem, setEditingItem, editQuantity, setEditQuantity,
    isEditModalVisible, setIsEditModalVisible,
    filteredSuggestions, handleAddItem, finalizeAddItem, handleDeleteItem,
    openEditModal, handleSaveEdit, handleDeleteAll
  } = useShoppingList({ items, setItems, inputRef, quantidadeInputRef });

  const {
    isSavedListsModalVisible, setIsSavedListsModalVisible, isSaveModalVisible, setIsSaveModalVisible,
    saveName, setSaveName, isPreviewModalVisible, setIsPreviewModalVisible,
    previewData, handleSaveCurrentList, handleLoadSavedList, handleOpenPreview, handleDeleteSavedList
  } = useSavedLists({ 
    items, 
    setItems, 
    savedPurchases, 
    setSavedPurchases, 
    userName 
  });

  const handleConfirm = () => {
    router.push({
      pathname: '/confirmacao',
      params: { sortBy }
    });
  };
  
  const handleSortChange = () => {
    setSortBy(prev => prev === 'alphabetical' ? 'none' : 'alphabetical');
  };

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

      <ItemEditModal
        visible={isEditModalVisible}
        editingItem={editingItem}
        editQuantity={editQuantity}
        setEditQuantity={setEditQuantity}
        onSave={handleSaveEdit}
        onCancel={() => setIsEditModalVisible(false)}
      />

      <SaveListModal
        visible={isSaveModalVisible}
        saveName={saveName}
        setSaveName={setSaveName}
        savedPurchasesCount={savedPurchases.length}
        onSave={handleSaveCurrentList}
        onCancel={() => setIsSaveModalVisible(false)}
      />

      <SavedListsModal
        visible={isSavedListsModalVisible}
        savedPurchases={savedPurchases}
        onOpenPreview={handleOpenPreview}
        onDeleteList={handleDeleteSavedList}
        onClose={() => setIsSavedListsModalVisible(false)}
      />

      <PreviewSavedListModal
        visible={isPreviewModalVisible}
        previewData={previewData}
        onLoadList={handleLoadSavedList}
        onCancel={() => setIsPreviewModalVisible(false)}
      />

      <GroupSelectionModal
        visible={isGroupModalVisible}
        pendingItemName={pendingItemName}
        onSelectGroup={finalizeAddItem}
        onCancel={() => {
          setIsGroupModalVisible(false);
          setPendingItemName('');
          setPendingItemQuantity('');
        }}
      />
    </View>
  );
}
