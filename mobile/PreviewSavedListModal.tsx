import React from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Assuming this path is correct
import { styles } from './app/(tabs)/style';
import { formatDecimal } from './app/utils';
import { Item } from './constants'; // Importa a interface Item centralizada

interface PreviewSavedListModalProps {
  visible: boolean;
  previewData: { name: string; items: Item[] } | null;
  onLoadList: (items: Item[]) => void;
  onCancel: () => void;
}

export const PreviewSavedListModal: React.FC<PreviewSavedListModalProps> = ({
  visible,
  previewData,
  onLoadList,
  onCancel,
}) => {
  if (!previewData) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={localStyles.modalOverlay}>
        <View style={[localStyles.modalContent, { maxHeight: '60%', width: '80%', padding: 15 }]}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#1B5E20', marginBottom: 10, textAlign: 'center' }}>
            {previewData.name}
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 5 }}>
            <Text style={{ fontWeight: 'bold', color: '#1B5E20', flex: 1 }}>Produtos</Text>
            <Text style={{ fontWeight: 'bold', color: '#1B5E20' }}>Quantidades</Text>
          </View>

          <FlatList
            data={previewData.items}
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
              onPress={onCancel}
            >
              <Text style={styles.addBtnText}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, { flex: 1, backgroundColor: '#4CAF50', height: 45 }]}
              onPress={() => onLoadList(previewData.items)}
            >
              <Text style={styles.addBtnText}>Usar Lista</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '85%', alignItems: 'center' },
});