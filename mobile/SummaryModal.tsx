import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './app/(tabs)/style';
import { SummaryData } from './useConfirmationLogic';
import { useAuthAndDataLoading } from './useAuthAndDataLoading';

interface SummaryModalProps {
  visible: boolean;
  summary: SummaryData | null;
  onClose: () => void;
  onGoHome: () => void;
  onSaveQuickList: () => Promise<boolean>;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  visible,
  summary,
  onClose,
  onGoHome,
  onSaveQuickList,
}) => {
  if (!summary) return null;
  const { settings } = useAuthAndDataLoading();
  const isDark = settings.theme === 'dark';
  const theme = {
    background: isDark ? '#1E1E1E' : '#fff',
    text: isDark ? '#D4D4D4' : '#333',
    title: isDark ? '#4CAF50' : '#1B5E20',
    card: isDark ? '#2D2D2D' : '#FFF3E0',
    accent: '#4CAF50',
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
          }]}>Resumo das Compras</Text>
          <Text style={{ fontSize: 16, marginBottom: 5, color: theme.text }}>Total de itens na lista: {summary.totalItems}</Text>
          <Text style={{ fontSize: 16, marginBottom: 5, color: theme.text }}>Itens comprados: {summary.confirmedItems}</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
            <Text style={{ fontSize: 16, color: theme.text }}>Itens não comprados: {summary.notPurchasedItemsCount}</Text>
            {summary.notPurchasedItemsCount > 0 && (
              <TouchableOpacity 
                onPress={async () => {
                  if (typeof onSaveQuickList === 'function') {
                    const success = await onSaveQuickList();
                    if (success) {
                      onGoHome();
                    }
                  }
                }}
                style={{ padding: 6, backgroundColor: theme.card, borderRadius: 10, marginLeft: 10 }}
              >
                <MaterialIcons name="flash-on" size={22} color="#EF6C00" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={{ fontSize: 16, marginBottom: 15, color: theme.text }}>Itens restantes: {summary.remainingItems}</Text>

          <View style={{ width: '100%', gap: 10 }}>
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.accent }]} onPress={onGoHome}>
              <Text style={styles.addBtnText}>Reiniciar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%', alignItems: 'center' },
});