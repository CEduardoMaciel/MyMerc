import React from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Assuming this path is correct
import { createStyles } from './app/(tabs)/style';
import { formatDecimal } from './app/utils';
import { Item } from './constants'; // Importa a interface Item centralizada
import { useAppTheme } from './ThemeContext';

interface PreviewSavedListModalProps {
  visible: boolean;
  previewData: { name: string; items: Item[] } | null;
  onLoadList?: (items: Item[]) => void;
  onCancel: () => void;
}

export const PreviewSavedListModal: React.FC<PreviewSavedListModalProps> = ({
  visible,
  previewData,
  onLoadList,
  onCancel,
}) => {
  if (!previewData) return null;

  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={localStyles.modalOverlay}>
        <View style={[localStyles.modalContent, { maxHeight: '60%', width: '80%', padding: 15, backgroundColor: theme.modalBg }]}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: theme.title, marginBottom: 10, textAlign: 'center' }}>
            {previewData.name}
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: theme.border, marginBottom: 5 }}>
            <Text style={{ fontWeight: 'bold', color: theme.title, flex: 1 }}>Produtos</Text>
            <Text style={{ fontWeight: 'bold', color: theme.title }}>Quantidades</Text>
          </View>

          <FlatList
            data={previewData.items}
            keyExtractor={item => item.id}
            style={{ width: '100%', marginBottom: 15 }}
            renderItem={({ item }) => ( // @ts-ignore
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                <Text style={{ color: theme.text, fontSize: 14, flex: 1 }}>{item.name}</Text>
                <Text style={{ color: theme.text, fontSize: 14, fontWeight: 'bold' }}>{formatDecimal(item.quantidade)}</Text>
              </View>
            )}
          />

          <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
            <TouchableOpacity
              style={[styles.addBtn, { flex: 1, backgroundColor: theme.cancelBtn, height: 45 }]}
              onPress={onCancel}
            >
              <Text style={styles.addBtnText}>Voltar</Text>
            </TouchableOpacity>
            {onLoadList && (
              <TouchableOpacity
                style={[styles.addBtn, { flex: 1, backgroundColor: theme.accent, height: 45 }]}
                onPress={() => onLoadList(previewData.items)}
              >
                <Text style={styles.addBtnText}>Usar Lista</Text>
              </TouchableOpacity>
            )}
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