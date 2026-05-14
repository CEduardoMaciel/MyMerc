import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Assuming this path is correct
import { styles } from './app/(tabs)/style';
import { groupIcons, Item } from './constants'; // Importa a interface Item e groupIcons centralizados

import { useAuthAndDataLoading } from './useAuthAndDataLoading';
interface GroupSelectionModalProps {
  visible: boolean;
  pendingItemName: string;
  onSelectGroup: (grupo: Item['grupo']) => void;
  onCancel: () => void;
}

export const GroupSelectionModal: React.FC<GroupSelectionModalProps> = ({
  visible,
  pendingItemName,
  onSelectGroup,
  onCancel,
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
    buttonCancel: '#F44336',
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={localStyles.modalOverlay}>
        <View style={[localStyles.modalContent, { width: '90%', maxHeight: '80%', backgroundColor: theme.modalBg }]}>
          <Text style={[styles.title, { fontSize: 20, color: theme.title, marginBottom: 5 }]}>Selecione o Grupo</Text>
          <Text style={{ marginBottom: 15, color: theme.subtitle }}>O item "{pendingItemName}" não foi reconhecido. Onde deseja encaixá-lo?</Text>

          <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {(Object.keys(groupIcons) as Array<Item['grupo']>).map((grupo) => (
              <TouchableOpacity
                key={grupo}
                style={{
                  width: '48%',
                  backgroundColor: theme.cardBg,
                  padding: 12,
                  borderRadius: 10,
                  marginBottom: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: theme.cardBorder,
                }}
                onPress={() => onSelectGroup(grupo)}
              >
                <MaterialIcons name={groupIcons[grupo]} size={20} color={theme.title} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 13, color: theme.text, fontWeight: 'bold' }}>{grupo}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.addBtn, { width: '100%', backgroundColor: theme.buttonCancel, marginTop: 10 }]}
            onPress={onCancel}
          >
            <Text style={styles.addBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '85%', alignItems: 'center' },
});