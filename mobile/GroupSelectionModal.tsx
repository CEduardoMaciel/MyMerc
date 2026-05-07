import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Assuming this path is correct
import { styles } from './app/(tabs)/style';
import { groupIcons, Item } from './constants'; // Importa a interface Item e groupIcons centralizados

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
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={localStyles.modalOverlay}>
        <View style={[localStyles.modalContent, { width: '90%', maxHeight: '80%' }]}>
          <Text style={[styles.title, { fontSize: 20, color: '#1B5E20', marginBottom: 5 }]}>Selecione o Grupo</Text>
          <Text style={{ marginBottom: 15, color: '#666' }}>O item "{pendingItemName}" não foi reconhecido. Onde deseja encaixá-lo?</Text>

          <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {(Object.keys(groupIcons) as Array<Item['grupo']>).map((grupo) => (
              <TouchableOpacity
                key={grupo}
                style={{
                  width: '48%',
                  backgroundColor: '#F1F8E9',
                  padding: 12,
                  borderRadius: 10,
                  marginBottom: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#C8E6C9'
                }}
                onPress={() => onSelectGroup(grupo)}
              >
                <MaterialIcons name={groupIcons[grupo]} size={20} color="#2E7D32" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 13, color: '#2E7D32', fontWeight: 'bold' }}>{grupo}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.addBtn, { width: '100%', backgroundColor: '#ccc', marginTop: 10 }]}
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