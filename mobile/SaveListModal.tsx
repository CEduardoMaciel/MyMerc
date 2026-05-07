import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { styles } from './app/(tabs)/style';

interface SaveListModalProps {
  visible: boolean;
  saveName: string;
  setSaveName: (name: string) => void;
  savedPurchasesCount: number;
  onSave: () => void;
  onCancel: () => void;
}

export const SaveListModal: React.FC<SaveListModalProps> = ({
  visible,
  saveName,
  setSaveName,
  savedPurchasesCount,
  onSave,
  onCancel,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={localStyles.modalOverlay}>
        <View style={localStyles.modalContent}>
          <Text style={[styles.title, { fontSize: 22, color: '#1B5E20' }]}>Salvar Lista Atual</Text>
          <Text style={{ marginBottom: 15, textAlign: 'center' }}>Dê um nome para identificar esta compra futuramente.</Text>
          <TextInput
            style={[styles.input, { width: '100%' }]}
            value={saveName}
            onChangeText={setSaveName}
            placeholder="Ex: Lista 1"
            autoFocus
          />
          <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
            {savedPurchasesCount}/5 listas salvas
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
            <TouchableOpacity
              style={[styles.addBtn, { flex: 1, backgroundColor: '#ccc' }]}
              onPress={onCancel}
            >
              <Text style={styles.addBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, { flex: 1, backgroundColor: '#FF9800' }]}
              onPress={onSave}
            >
              <Text style={styles.addBtnText}>Gravar</Text>
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