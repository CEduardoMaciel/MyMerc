import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { createStyles } from './app/(tabs)/style';
import { Item } from './constants'; // Importa a interface Item centralizada
import { useAppTheme } from './ThemeContext';

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
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const isDark = theme.background !== '#fff';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={localStyles.modalOverlay}>
        <View style={[localStyles.modalContent, { backgroundColor: theme.modalBg }]}>
          <Text style={[styles.title, {
            fontSize: 24,
            fontWeight: '900',
            letterSpacing: -1
          }]}>Editar Item</Text>
          <Text style={{ marginBottom: 15, fontSize: 16, color: theme.text }}>{editingItem?.name}</Text>
          <TextInput
            style={[styles.input, { width: '100%' }]}
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
              style={[styles.addBtn, { flex: 1, backgroundColor: theme.accent }]}
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