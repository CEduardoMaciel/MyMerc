import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { styles } from './app/(tabs)/style';
import { Item } from './constants'; // Importa a interface Item centralizada
import { useAuthAndDataLoading } from './useAuthAndDataLoading';

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
  const { settings } = useAuthAndDataLoading();
  const isDark = settings.theme === 'dark';
  const theme = {
    background: isDark ? '#1E1E1E' : '#fff',
    text: isDark ? '#D4D4D4' : '#333',
    title: isDark ? '#4CAF50' : '#1B5E20',
    inputBg: isDark ? '#3C3C3C' : '#fff',
    inputBorder: isDark ? '#333' : '#ddd',
    cancelBtn: '#F44336',
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={localStyles.modalOverlay}>
        <View style={[localStyles.modalContent, { backgroundColor: theme.background }]}>
          <Text style={[styles.title, {
            fontSize: 24,
            fontWeight: '900',
            color: theme.title,
            letterSpacing: -1
          }]}>Editar Item</Text>
          <Text style={{ marginBottom: 15, fontSize: 16, color: theme.text }}>{editingItem?.name}</Text>
          <TextInput
            style={[styles.input, { width: '100%', backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
            value={editQuantity}
            onChangeText={setEditQuantity}
            placeholder="Nova quantidade"
            placeholderTextColor={isDark ? '#888' : '#999'}
            keyboardType="numeric"
            autoFocus
          />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <TouchableOpacity
              style={[styles.addBtn, { flex: 1, backgroundColor: theme.cancelBtn }]}
              onPress={onCancel}
            >
              <Text style={styles.addBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, { flex: 1, backgroundColor: theme.title }]}
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