import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Logo } from '@/components/logo';
import SplashScreen from '../SplashScreen';
import { formatDecimal } from '../utils';
import { groupIcons } from '../../constants'; // Importa groupIcons da raiz
import { useAuthAndDataLoading } from '../../useAuthAndDataLoading';
import { useShoppingList } from '../../useShoppingList';
import { useSavedLists } from '../../useSavedLists';
import { ItemEditModal } from '../../ItemEditModal';
import { SaveListModal } from '../../SaveListModal';
import { SavedListsModal } from '../../SavedListsModal';
import { PreviewSavedListModal } from '../../PreviewSavedListModal';
import { GroupSelectionModal } from '../../GroupSelectionModal';
import { createStyles } from './style';
import { useAppTheme } from '../../ThemeContext';

export default function HomeScreen() {
  const [sortBy, setSortBy] = useState<'none' | 'alphabetical'>('none');
  const [isQuickListsModalVisible, setIsQuickListsModalVisible] = useState(false);
  const quantidadeInputRef = useRef<TextInput>(null);
  const [previewQuickList, setPreviewQuickList] = useState<{ id: string, date: string, items: any[] } | null>(null);
  const [showQuickListPromptOnLogin, setShowQuickListPromptOnLogin] = useState(false); // Novo estado
  const router = useRouter();
  const initialCheckDone = useRef(false);
  const inputRef = useRef<TextInput>(null);

  const {
    isLoggedIn, isAuthLoading, userName, isUserContextLoaded,
    handleLoginSuccess, handleLogout, items, setItems,
    savedPurchases, setSavedPurchases,
    quickLists, handleDeleteQuickList, settings
  } = useAuthAndDataLoading();

  const {
    input, setInput, quantidade, setQuantidade, showSuggestions, setShowSuggestions,
    pendingItemName, setPendingItemName, pendingItemQuantity, setPendingItemQuantity,
    isGroupModalVisible, setIsGroupModalVisible,
    editingItem, setEditingItem, editQuantity, setEditQuantity,
    isEditModalVisible, setIsEditModalVisible,
    filteredSuggestions, handleAddItem, finalizeAddItem, handleDeleteItem,
    openEditModal, handleSaveEdit, handleDeleteAll,
    displayList, toggleGroup, totalItems, setExpandedGroups
  } = useShoppingList({ items, setItems, inputRef, quantidadeInputRef, sortBy });

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

  const theme = useAppTheme();
  const styles = createStyles(theme);
  const isDark = settings.theme === 'dark';

  // Handler modificado para ser chamado pelo SplashScreen
  const handleLoginSuccessAndPromptCheck = async () => {
    await handleLoginSuccess();
    setShowQuickListPromptOnLogin(true); // Ativa o flag para exibir o prompt após o login
  };

  useEffect(() => {
    // Este useEffect agora depende de 'showQuickListPromptOnLogin'
    if (isUserContextLoaded && showQuickListPromptOnLogin) {
      setShowQuickListPromptOnLogin(false); // Reseta o flag imediatamente para evitar repetição

      if (quickLists.length > 0) {
        const title = quickLists.length === 1 
          ? "Existe listagem de não comprados" 
          : `Existem ${quickLists.length} listagens de não comprados`;
        
        Alert.alert(
          title,
          "Deseja exibi-las?",
          [
            { text: "Agora não", style: "cancel" },
            { text: "Sim", onPress: () => setIsQuickListsModalVisible(true) }
          ]
        );
      }
    }
  }, [isUserContextLoaded, showQuickListPromptOnLogin, quickLists]);

  const handleConfirm = () => {
    router.push({
      pathname: '/confirmacao',
      params: { sortBy }
    });
  };
  
  const handleSortChange = () => {
    setSortBy(prev => prev === 'alphabetical' ? 'none' : 'alphabetical');
  };

  if (isAuthLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Logo />
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <SplashScreen onFinish={handleLoginSuccessAndPromptCheck} />; // Usa o novo handler
  }

  const getExpirationInfo = (ql: any) => {
    if (!ql.timestamp) return null;
    const daysElapsed = Math.floor((Date.now() - ql.timestamp) / (1000 * 60 * 60 * 24));
    const daysRemaining = settings.expirationDays - daysElapsed;
    return {
      daysRemaining,
      isExpired: daysRemaining <= 0,
      text: daysRemaining <= 0 ? 'Expirada' : `Expira em ${daysRemaining}d`
    };
  };

  return (
    <View style={styles.container}>
      <View style={{ alignSelf: 'flex-start', marginBottom: 10, marginLeft: -10 }}>
        <Logo />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: theme.title }}>
          Perfil {userName}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity 
            onPress={() => setIsSavedListsModalVisible(true)}
            style={{ padding: 8, backgroundColor: theme.headerBg, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <MaterialIcons name="list-alt" size={24} color={theme.logo} />
            {savedPurchases.length > 0 && (
              <View style={{ backgroundColor: '#F44336', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 }}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{savedPurchases.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          {quickLists.length > 0 && (
            <TouchableOpacity 
              onPress={() => setIsQuickListsModalVisible(true)}
              style={{ padding: 8, backgroundColor: theme.headerBg, borderRadius: 12, position: 'relative' }}
            >
              <MaterialIcons name="flash-on" size={24} color={theme.orange} />
              <View style={{ position: 'absolute', top: -5, right: -5, backgroundColor: theme.cancelBtn, borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{quickLists.length}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: theme.subtitle, marginBottom: 8 }}>O que vamos comprar hoje?</Text>
      <View style={{ zIndex: 10 }}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Nome do item"
          value={input}
          placeholderTextColor={isDark ? '#858585' : '#999'}
          onChangeText={(value) => {
            setInput(value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <View style={styles.suggestionBox}>
            {filteredSuggestions.map(({ item }) => (
              <TouchableOpacity
                key={item}
                style={styles.suggestionItem}
                onPress={() => {
                  setInput(item);
                  setShowSuggestions(false);
                  quantidadeInputRef.current?.focus(); // Foca na quantidade após selecionar a sugestão
                }}>
                <Text style={{ color: theme.text }}>{item}</Text>
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
            placeholderTextColor={isDark ? '#858585' : '#999'}
            onChangeText={setQuantidade}
            onFocus={() => setShowSuggestions(false)} // Esconde sugestões ao focar na quantidade
            keyboardType="numeric"
          />
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.accent }]} onPress={handleAddItem}>
            <MaterialIcons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 }}>
        <Text style={[styles.title, { marginBottom: 0, fontSize: 24, letterSpacing: -1 }]}>
          Sua lista ({totalItems})
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity 
            onPress={handleSortChange}
            style={{ padding: 5 }}
          >
            <MaterialIcons 
              name="sort" 
              size={28}
              color={sortBy === 'alphabetical' ? theme.accent : theme.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteAll} style={{ padding: 5 }}>
            <MaterialIcons name="delete-sweep" size={28} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={displayList}
        keyExtractor={(row) => row.id}
        renderItem={({ item: row }) => {
          if (row.type === 'header') {
            return (
              <TouchableOpacity onPress={() => toggleGroup(row.grupo)} style={styles.headerGroup}>
                <MaterialIcons name={groupIcons[row.grupo]} size={18} color={theme.title} />
                <Text style={styles.headerGroupText}>
                  {row.grupo} ({row.count})
                </Text>
                <MaterialIcons
                  name={row.isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                  size={24}
                  color={theme.title}
                  style={{ marginLeft: 'auto' }}
                />
              </TouchableOpacity>
            );
          } else {
            const item = row.item;
            return (
              <View style={styles.itemContainer}>
                <View style={styles.itemContent}>
                  <View>
                    <Text style={styles.itemText}>{item.name}</Text>
                    <View style={{ marginTop: 4 }}>
                      <Text style={[styles.itemText, { fontSize: 14, color: theme.subtitle, fontWeight: 'bold' }]}>
                        Qtd: {formatDecimal(item.quantidade)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  <TouchableOpacity onPress={() => openEditModal(item)} style={{ padding: 5, borderRadius: 5 }}>
                    <MaterialIcons name="edit" size={24} color={theme.buttonBlue} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteItem(item)} style={{ padding: 5, borderRadius: 5 }}>
                    <MaterialIcons name="delete-outline" size={24} color={theme.cancelBtn} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }
        }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: theme.subtitle, marginTop: 10 }}>Nenhum item salvo.</Text>}
        style={styles.list}
      />

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, paddingBottom: 10 }}>
        <TouchableOpacity style={[styles.addBtn, { flex: 1, backgroundColor: theme.cancelBtn }]} onPress={handleLogout}>
          <Text style={styles.addBtnText}>Sair</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.addBtn, { flex: 1, backgroundColor: theme.orange }, items.length === 0 && { backgroundColor: '#ccc' }]} 
          onPress={() => items.length > 0 && setIsSaveModalVisible(true)}
        >
          <Text style={styles.addBtnText}>Salvar Lista</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.addBtn, { flex: 1, backgroundColor: theme.accent }, items.length === 0 && { backgroundColor: '#ccc' }]} 
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

      <Modal visible={isQuickListsModalVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: theme.modalBg, padding: 20, borderRadius: 20, width: '90%', maxHeight: '80%' }}>
            <Text style={[styles.title, { color: theme.orange, fontSize: 22 }]}>Listagens Rápidas</Text>
            <Text style={{ marginBottom: 15, color: theme.subtitle }}>Itens não comprados em sessões anteriores.</Text>
            
            <FlatList
              data={quickLists}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                const exp = getExpirationInfo(item);
                return (
                <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: theme.cardBorder, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16, color: theme.text }}>{item.date}</Text>
                      {exp && (
                        <View style={{ backgroundColor: exp.isExpired ? theme.expiredBg : theme.notExpiredBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ fontSize: 10, color: exp.isExpired ? theme.expiredText : theme.notExpiredText, fontWeight: 'bold' }}>{exp.text}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ color: theme.subtitle, fontSize: 12 }}>{item.items.length} produtos pendentes</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={() => setPreviewQuickList(item)}>
                      <MaterialIcons name="visibility" size={28} color="#2196F3" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                      const loadQuickList = () => {
                        // Garante a unicidade dos itens (por nome, ignorando case)
                        const uniqueItems = item.items.filter((val, index, self) =>
                          index === self.findIndex((t) => t.name.toLowerCase() === val.name.toLowerCase())
                        );

                        setItems(uniqueItems);
                        setExpandedGroups({}); // Reseta expansão
                        handleDeleteQuickList(item.id);
                        setIsQuickListsModalVisible(false);
                        Alert.alert('Sucesso', 'A lista foi substituída pelos itens da listagem rápida.');
                      };

                      if (items.length > 0) {
                        Alert.alert(
                          'Substituir Lista?',
                          'Sua lista atual já possui itens. Deseja apagar tudo e carregar os itens desta listagem rápida?',
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            { text: 'Substituir Tudo', style: 'destructive', onPress: loadQuickList }
                          ]
                        );
                      } else {
                        loadQuickList();
                      }
                    }}>
                      <MaterialIcons name="add-task" size={28} color="#4CAF50" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteQuickList(item.id)} style={{ padding: 5 }}>
                      <MaterialIcons name="delete-outline" size={28} color={theme.cancelBtn} />
                    </TouchableOpacity>
                  </View>
                </View>
                );
              }}
              ListEmptyComponent={<Text style={{ textAlign: 'center', padding: 20, color: theme.subtitle }}>Nenhuma listagem rápida disponível.</Text>}
            />
            
            <TouchableOpacity
              style={[styles.addBtn, { marginTop: 15, backgroundColor: theme.cancelBtn }]}
              onPress={() => setIsQuickListsModalVisible(false)}
            >
              <Text style={styles.addBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <PreviewSavedListModal
        visible={!!previewQuickList}
        previewData={previewQuickList ? { name: `Itens de ${previewQuickList.date}`, items: previewQuickList.items } : null}
        onCancel={() => setPreviewQuickList(null)}
      />
    </View>
  );
}
