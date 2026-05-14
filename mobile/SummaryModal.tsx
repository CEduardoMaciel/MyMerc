import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { createStyles } from './app/(tabs)/style';
import { SummaryData } from './useConfirmationLogic';
import { formatDecimal } from './app/utils';
import { Item } from './constants';
import { useAppTheme } from './ThemeContext';

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
  const [viewingList, setViewingList] = useState<{ title: string; items: Item[] } | null>(null);
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={localStyles.modalOverlay}>
        <View style={[localStyles.modalContent, { backgroundColor: theme.modalBg, maxHeight: '80%' }]}>
          <Text style={[styles.title, {
            fontSize: 24,
            fontWeight: '900',
            letterSpacing: -1
          }]}>
            {viewingList ? viewingList.title : "Resumo das Compras"}
          </Text>

          {viewingList ? (
            <View style={{ width: '100%', flexShrink: 1 }}>
              <FlatList
                data={viewingList.items}
                keyExtractor={(item) => item.id}
                style={{ marginBottom: 15 }}
                renderItem={({ item }) => (
                  <View style={[localStyles.listItem, { borderBottomColor: theme.cardBorder }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.text, fontSize: 16 }}>{item.name}</Text>
                    </View>
                    <Text style={{ color: theme.subtitle, fontSize: 14, fontWeight: 'bold' }}>
                      Qtd: {formatDecimal(item.quantidade)}
                    </Text>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={{ textAlign: 'center', color: theme.subtitle, marginVertical: 20 }}>
                    Nenhum item nesta lista.
                  </Text>
                }
              />
              <TouchableOpacity 
                style={[localStyles.actionButton, { backgroundColor: '#2196F3' }]} 
                onPress={() => setViewingList(null)}
              >
                <MaterialIcons name="arrow-back" size={24} color="white" />
                <Text style={localStyles.actionButtonText}>Voltar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
          <View style={[localStyles.statsContainer, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={localStyles.statRow}>
              <Text style={[localStyles.statLabel, { color: theme.text }]}>Total de itens:</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[localStyles.statValue, { color: theme.text }]}>{summary.totalItems}</Text>
                <TouchableOpacity
                  onPress={() => setViewingList({ title: 'Total de Itens', items: summary.allItemsList })}
                  style={[localStyles.iconButton, { backgroundColor: theme.buttonBlue }]}
                >
                  <MaterialIcons name="visibility" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={localStyles.statRow}>
              <Text style={[localStyles.statLabel, { color: theme.text }]}>Comprados:</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[localStyles.statValue, { color: '#4CAF50' }]}>{summary.confirmedItems}</Text>
                <TouchableOpacity
                  onPress={() => setViewingList({ title: 'Itens Comprados', items: summary.confirmedItemsList })}
                  style={[localStyles.iconButton, { backgroundColor: theme.accent }]}
                >
                  <MaterialIcons name="visibility" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={localStyles.statRow}>
              <Text style={[localStyles.statLabel, { color: theme.text }]}>Não comprados:</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[localStyles.statValue, { color: '#FF9800' }]}>{summary.notPurchasedItemsCount}</Text>
                {summary.notPurchasedItemsCount > 0 && (
                  <TouchableOpacity
                    onPress={async () => { // @ts-ignore
                      const success = await onSaveQuickList();
                      if (success) onGoHome();
                    }}
                    style={{
                      backgroundColor: '#EF6C00',
                      padding: 4,
                      borderRadius: 6,
                    }}
                  >
                    <MaterialIcons name="flash-on" size={16} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={[localStyles.statRow, { borderBottomWidth: 0 }]}>
              <Text style={[localStyles.statLabel, { color: theme.text }]}>Restantes:</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[localStyles.statValue, { color: theme.secondaryText }]}>{summary.remainingItems}</Text>
                <TouchableOpacity
                  onPress={() => setViewingList({ title: 'Itens Restantes', items: summary.remainingItemsList })}
                  style={[localStyles.iconButton, { backgroundColor: theme.subtitle }]} // Using subtitle for a gray tone
                >
                  <MaterialIcons name="visibility" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={{ width: '100%', gap: 12, marginTop: 10 }}>
            <TouchableOpacity
              style={[localStyles.actionButton, { backgroundColor: theme.buttonBlue }]} 
              onPress={onGoHome}
            >
              <MaterialIcons name="refresh" size={24} color="white" />
              <Text style={localStyles.actionButtonText}>Reiniciar</Text>
            </TouchableOpacity>
          </View>
          </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { padding: 20, borderRadius: 20, width: '85%', alignItems: 'center' },
  statsContainer: {
    width: '100%',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  iconButton: {
    padding: 4,
    borderRadius: 6,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});