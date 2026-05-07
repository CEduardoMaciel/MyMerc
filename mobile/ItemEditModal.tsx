import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { styles } from './app/(tabs)/style';
import { Item } from './constants'; // Importa a interface Item centralizada

interface ItemEditModalProps {
  visible: boolean;
  editingItem: Item | null;
  editQuantity: string;
  setEditQuantity: (qty: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ItemEditModal: React.FC<ItemEditModalProps> = ({
  visible,
  editingItem,
  editQuantity,
  setEditQuantity,
  onSave,
  onCancel,
}) => {
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
          }]}>Editar Item</Text>
          <Text style={{ marginBottom: 15, fontSize: 16 }}>{editingItem?.name}</Text>
          <TextInput
            style={[styles.input, { width: '100%' }]}
            value={editQuantity}
            onChangeText={setEditQuantity}
            placeholder="Nova quantidade"
            keyboardType="numeric"
            autoFocus
          />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <TouchableOpacity
              style={[styles.addBtn, { flex: 1, backgroundColor: '#ccc' }]}
              onPress={onCancel}
            >
              <Text style={styles.addBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, { flex: 1 }]}
              onPress={onSave}
            >
              <Text style={styles.addBtnText}>Salvar</Text>
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