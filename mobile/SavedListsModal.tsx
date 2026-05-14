import React from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Assuming this path is correct
import { styles } from './app/(tabs)/style';
import { Item } from './constants'; // Importa a interface Item centralizada

import { useAuthAndDataLoading } from './useAuthAndDataLoading';
interface SavedListsModalProps {
  visible: boolean;
  savedPurchases: { name: string; items: Item[] }[];
  onOpenPreview: (list: { name: string; items: Item[] }) => void;
  onDeleteList: (listName: string) => void;
  onClose: () => void;
}

export const SavedListsModal: React.FC<SavedListsModalProps> = ({
  visible,
  savedPurchases,
  onOpenPreview,
  onDeleteList,
  onClose,
}) => {
  const { settings } = useAuthAndDataLoading();
  const isDark = settings.theme === 'dark';
  const theme = {
    modalBg: isDark ? '#1E1E1E' : '#fff',
    text: isDark ? '#D4D4D4' : '#333',
    title: isDark ? '#4CAF50' : '#1B5E20',
    subtitle: isDark ? '#858585' : '#666',
    cardBg: isDark ? '#2D2D2D' : '#F1F8E9',
    cardBorder: isDark ? '#333' : '#C8E6C9',
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={localStyles.modalOverlay}>
        <View style={[localStyles.modalContent, { maxHeight: '70%', width: '90%', backgroundColor: theme.modalBg }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 15, alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '900', color: theme.title }}>Listas Salvas</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 5 }}>
              <MaterialIcons name="close" size={28} color={theme.subtitle} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={savedPurchases}
            keyExtractor={p => p.name}
            style={{ width: '100%' }}
            renderItem={({ item }) => ( // @ts-ignore
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 }}> 
                <TouchableOpacity
                  onPress={() => onOpenPreview(item)}
                  style={{ flex: 1, backgroundColor: theme.cardBg, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: theme.cardBorder, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Text style={{ fontSize: 16, color: theme.text, fontWeight: 'bold' }}>{item.name}</Text>
                  <Text style={{ fontSize: 12, color: theme.subtitle }}>{item.items.length} itens</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onDeleteList(item.name)}
                  style={{ padding: 10 }}
                >
                  <MaterialIcons name="delete-outline" size={24} color="#F44336" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: theme.subtitle }}>Nenhuma lista salva ainda.</Text>}
          />
        </View>
      </View>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '85%', alignItems: 'center' },
});