import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthAndDataLoading } from '../../useAuthAndDataLoading';
import { Logo } from '@/components/logo';
import { useAppTheme } from '../../ThemeContext';
import { createStyles as createGlobalStyles } from './style'; // Renomeado para evitar conflito

export default function ConfiguracaoScreen() {
  const router = useRouter();
  const { settings, updateSettings, userName } = useAuthAndDataLoading();

  const theme = useAppTheme();
  const globalStyles = createGlobalStyles(theme); // Usando o novo nome
  const isDark = settings.theme === 'dark';

  const toggleTheme = () => {
    updateSettings({
      ...settings,
      theme: isDark ? 'light' : 'dark',
    });
  };

  const updateExpiration = (val: string) => {
    const days = parseInt(val) || 0;
    updateSettings({
      ...settings,
      expirationDays: days,
    });
  };

  return (
    <View style={[localStyles.container, { backgroundColor: theme.background }]}>
      <View style={{ alignSelf: 'flex-start', marginBottom: 20, marginLeft: -10 }}>
        <Logo />
      </View>
      
      <Text style={[localStyles.title, { color: theme.accent }]}>Configurações Gerais</Text>
      <Text style={[localStyles.subtitle, { color: theme.subtitle, marginBottom: 30 }]}>
        Personalize sua experiência no MyMerc
      </Text>

      <ScrollView style={{ flex: 1 }}>
        <View style={[localStyles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={localStyles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[localStyles.label, { color: theme.text }]}>Tema Escuro</Text>
              <Text style={[localStyles.description, { color: theme.subtitle }]}>
                Ativa o modo noturno para ambientes escuros
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isDark ? theme.accent : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={[localStyles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[localStyles.label, { color: theme.text }]}>Expiração de Listagens Rápidas</Text>
          <Text style={[localStyles.description, { color: theme.subtitle, marginBottom: 15 }]}>
            Quantidade de dias até uma listagem rápida ser marcada como expirada.
          </Text>
          <View style={localStyles.inputRow}>
            <TextInput
              style={[localStyles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
              keyboardType="numeric"
              value={settings.expirationDays.toString()}
              onChangeText={updateExpiration}
              maxLength={2}
            />
            <Text style={{ color: theme.text, marginLeft: 10 }}>Dias</Text>
          </View>
        </View>

        <View style={{ padding: 20, alignItems: 'center' }}>
          <MaterialIcons name="info-outline" size={24} color={theme.subtitle} />
          <Text style={{ color: theme.subtitle, textAlign: 'center', marginTop: 10, fontSize: 12 }}>
            As configurações são aplicadas globalmente para todos os perfis.
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={[localStyles.confirmBtn, { backgroundColor: theme.accent }]} 
        onPress={() => router.back()}
      >
        <Text style={localStyles.confirmBtnText}>Confirmar</Text>
      </TouchableOpacity>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '900', marginBottom: 5 },
  subtitle: { fontSize: 16 },
  section: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 18, fontWeight: 'bold' },
  description: { fontSize: 14, marginTop: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    width: 60,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  confirmBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});