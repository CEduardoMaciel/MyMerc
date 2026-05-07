import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { styles } from './app/(tabs)/style';

interface SummaryModalProps {
  visible: boolean;
  summary: {
    totalItems: number;
    confirmedItems: number;
    notPurchasedItemsCount: number;
    remainingItems: number;
  } | null;
  onClose: () => void;
  onGoHome: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  visible,
  summary,
  onClose,
  onGoHome,
}) => {
  if (!summary) return null;

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
          }]}>Resumo das Compras</Text>
          <Text style={{ fontSize: 16, marginBottom: 5 }}>Total de itens na lista: {summary.totalItems}</Text>
          <Text style={{ fontSize: 16, marginBottom: 5 }}>Itens comprados: {summary.confirmedItems}</Text>
          <Text style={{ fontSize: 16, marginBottom: 5 }}>Itens não comprados: {summary.notPurchasedItemsCount}</Text>
          <Text style={{ fontSize: 16, marginBottom: 15 }}>Itens restantes: {summary.remainingItems}</Text>

          <TouchableOpacity style={styles.addBtn} onPress={onGoHome}>
            <Text style={styles.addBtnText}>Reiniciar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%', alignItems: 'center' },
});