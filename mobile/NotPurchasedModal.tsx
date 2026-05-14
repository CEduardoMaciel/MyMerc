import React from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Assuming this path is correct
import { styles } from './app/(tabs)/style';
import { formatDecimal } from './app/utils';
import { Item as BaseItem } from './constants'; // Importa a interface Item centralizada
import { useAppTheme } from './ThemeContext';
import { createStyles } from './app/(tabs)/style';

interface Item extends BaseItem { // Estende a interface Item para adicionar 'status'
  status: 'pending' | 'confirmed' | 'not_purchased';
}

interface NotPurchasedModalProps {
  visible: boolean;
  items: Item[];
  onClose: () => void;
  onRestore: (item: Item) => void;
}

export const NotPurchasedModal: React.FC<NotPurchasedModalProps> = ({
  visible,
  items,
  onClose,
  onRestore,
}) => {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={localStyles.modalOverlay}>
        <View style={[localStyles.modalContent, { height: '65%', width: '90%', backgroundColor: theme.modalBg }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '900', color: theme.title }}>Não Comprados</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 5 }}>
              <MaterialIcons name="close" size={28} color={theme.subtitle} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            style={{ width: '100%' }}
            renderItem={({ item }) => (
              <View style={[styles.itemContainer, { marginBottom: 10, opacity: 0.9, backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                <View style={styles.itemContent}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemText, { color: theme.text }]}>{item.name}</Text>
                    <Text style={{ fontSize: 12, color: theme.subtitle }}>Qtd: {formatDecimal(item.quantidade)}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onRestore(item)} // @ts-ignore
                    style={{ backgroundColor: theme.accent, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}
                  >
                    <MaterialIcons name="settings-backup-restore" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: theme.subtitle }}>Nenhum item nesta lista.</Text>}
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