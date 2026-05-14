import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { createStyles } from './app/(tabs)/style';
import { useAppTheme } from './ThemeContext';

import { useAuthAndDataLoading } from './useAuthAndDataLoading';
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
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={localStyles.modalOverlay}>
        <View style={[localStyles.modalContent, { backgroundColor: theme.modalBg }]}>
          <Text style={[styles.title, { fontSize: 22 }]}>Salvar Lista Atual</Text>
          <Text style={{ marginBottom: 15, textAlign: 'center', color: theme.subtitle }}>Dê um nome para identificar esta compra futuramente.</Text>
          <TextInput
            style={[styles.input, { width: '100%' }]}
            value={saveName}
            onChangeText={setSaveName}
            placeholder="Ex: Lista 1" // @ts-ignore
            placeholderTextColor={theme.subtitle}
            autoFocus
          />
          <Text style={{ fontSize: 12, color: theme.subtitle, marginTop: 5 }}>
            {savedPurchasesCount}/5 listas salvas
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
            <TouchableOpacity
              style={[styles.addBtn, { flex: 1, backgroundColor: theme.cancelBtn }]}
              onPress={onCancel}
            >
              <Text style={styles.addBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, { flex: 1, backgroundColor: theme.orange }]}
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