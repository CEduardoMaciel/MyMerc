import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './app/(tabs)/style';
import { SummaryData } from './useConfirmationLogic';

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
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
            <Text style={{ fontSize: 16 }}>Itens não comprados: {summary.notPurchasedItemsCount}</Text>
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
                style={{ padding: 6, backgroundColor: '#FFF3E0', borderRadius: 10, marginLeft: 10 }}
              >
                <MaterialIcons name="flash-on" size={22} color="#EF6C00" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={{ fontSize: 16, marginBottom: 15 }}>Itens restantes: {summary.remainingItems}</Text>

          <View style={{ width: '100%', gap: 10 }}>
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#4CAF50' }]} onPress={onGoHome}>
              <Text style={styles.addBtnText}>Reiniciar e Sair</Text>
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