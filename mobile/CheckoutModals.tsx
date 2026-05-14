import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { createStyles } from './app/(tabs)/style';
import { Item } from './constants';
import { useAppTheme } from './ThemeContext';

interface EditModalProps {
  visible: boolean;
  item: Item | null;
  quantity: string;
  onClose: () => void;
  onSave: () => void;
  onChangeQuantity: (val: string) => void;
  theme: any;
}

export const EditQuantityModal = ({ visible, item, quantity, onClose, onSave, onChangeQuantity }: Omit<EditModalProps, 'theme'>) => {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  return (
  <Modal visible={visible} transparent animationType="fade">
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ backgroundColor: theme.modalBg, padding: 20, borderRadius: 10, width: '80%', alignItems: 'center' }}>
        <Text style={[styles.title, { fontSize: 24, fontWeight: '900' }]}>Editar Quantidade</Text>
        <Text style={{ marginBottom: 10, color: theme.text }}>{item?.name}</Text>
        <TextInput
          style={[styles.input, { width: '100%' }]}
          value={quantity}
          onChangeText={onChangeQuantity}
          keyboardType="numeric"
          autoFocus
        />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
          <TouchableOpacity style={[styles.addBtn, { flex: 1, backgroundColor: theme.cancelBtn }]} onPress={onClose}>
            <Text style={styles.addBtnText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addBtn, { flex: 1 }]} onPress={onSave}>
            <Text style={[styles.addBtnText, { backgroundColor: theme.accent }]} >Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
); };

interface SaveModalProps {
  visible: boolean;
  name: string;
  onClose: () => void;
  onSave: () => void;
  onChangeName: (val: string) => void;
}

export const SavePurchaseModal = ({ visible, name, onClose, onSave, onChangeName }: SaveModalProps) => {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  return (
  <Modal visible={visible} transparent animationType="slide">
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ backgroundColor: theme.modalBg, padding: 20, borderRadius: 10, width: '80%', alignItems: 'center' }}>
        <Text style={[styles.title, { fontSize: 22 }]}>Salvar Itens Comprados</Text>
        <Text style={{ marginBottom: 15, textAlign: 'center', color: theme.subtitle }}>
          Dê um nome para salvar apenas os itens que você marcou como comprados.
        </Text>
        <TextInput
          style={[styles.input, { width: '100%' }]}
          value={name}
          onChangeText={onChangeName}
          placeholder="Ex: Mercado Mensal"
          placeholderTextColor={theme.subtitle}
          autoFocus
        />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
          <TouchableOpacity style={[styles.addBtn, { flex: 1, backgroundColor: theme.buttonBlue }]} onPress={onClose}>
            <Text style={styles.addBtnText}>Voltar Resumo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addBtn, { flex: 1, backgroundColor: theme.accent }]} onPress={onSave}>
            <Text style={styles.addBtnText}>Gravar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
); };

interface ExtraItemModalProps {
  visible: boolean;
  input: string;
  quantity: string;
  onClose: () => void;
  onAdd: () => void;
  onChangeInput: (val: string) => void;
  onChangeQuantity: (val: string) => void;
  suggestions: any[];
  onSelectSuggestion: (item: string) => void;
}

export const ExtraItemModal = ({ visible, input, quantity, onClose, onAdd, onChangeInput, onChangeQuantity, suggestions, onSelectSuggestion }: ExtraItemModalProps) => {
    const theme = useAppTheme();
    const styles = createStyles(theme);
    return (
    <Modal visible={visible} transparent animationType="slide">
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ backgroundColor: theme.modalBg, padding: 20, borderRadius: 10, width: '85%', alignItems: 'center' }}>
        <Text style={[styles.title, { fontSize: 22, marginBottom: 10 }]}>Adicionar Item Extra</Text>
        <TextInput
          style={[styles.input, { width: '100%' }]}
          placeholder="Nome do produto"
          value={input}
          onChangeText={onChangeInput}
          placeholderTextColor={theme.subtitle}
        />
        <TextInput
          style={[styles.input, { width: '100%', marginTop: 10 }]}
          placeholder="Quantidade"
          value={quantity}
          onChangeText={onChangeQuantity}
          keyboardType="numeric"
          placeholderTextColor={theme.subtitle}
        />
        {/* Lógica de sugestões simplificada aqui para brevidade */}
      </View>
    </View>
  </Modal>
); };