import React from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Assuming this path is correct
import { styles } from './app/(tabs)/style';
import { Item } from './constants'; // Importa a interface Item centralizada

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
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={localStyles.modalOverlay}>
        <View style={[localStyles.modalContent, { maxHeight: '70%', width: '90%' }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 15, alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#1B5E20' }}>Listas Salvas</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 5 }}>
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
                  onPress={() => onOpenPreview(item)}
                  style={{ flex: 1, backgroundColor: '#F1F8E9', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#C8E6C9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Text style={{ fontSize: 16, color: '#2E7D32', fontWeight: 'bold' }}>{item.name}</Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>{item.items.length} itens</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onDeleteList(item.name)}
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
  );
};

const localStyles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '85%', alignItems: 'center' },
});