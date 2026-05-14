import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './style'; // Assuming this path is correct
import { AUTH_KEY } from '../utils'; // Importar AUTH_KEY de utils
import { useAuthAndDataLoading } from '../../useAuthAndDataLoading';


interface LoginScreenProps {
  onLogin?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { settings } = useAuthAndDataLoading();

  const isDark = settings.theme === 'dark';
  const theme = {
    background: isDark ? '#1E1E1E' : '#fff',
    text: isDark ? '#D4D4D4' : '#333',
    title: isDark ? '#4CAF50' : '#1B5E20',
    inputBg: isDark ? '#3C3C3C' : '#f9f9f9',
    inputBorder: isDark ? '#333' : '#eee',
    placeholder: isDark ? '#888' : '#999',
  };

  const handleLogin = async () => {
    if (username.trim().toLowerCase() === 'admin' && password === '!@Legiao160210') {
      try {
        await SecureStore.setItemAsync(AUTH_KEY, 'true');
      } catch (error) {
        console.error('Erro ao salvar login:', error);
      }

      if (onLogin) {
        onLogin();
      } else {
        router.replace('/');
      }
    } else {
      Alert.alert('Erro', 'Usuário ou senha incorretos');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.title }]}>Login</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
        placeholder="Usuário"
        placeholderTextColor={theme.placeholder}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.inputBg,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.inputBorder,
      }}>
        <TextInput
          style={[styles.input, { flex: 1, width: 'auto', marginBottom: 0, borderWidth: 0, backgroundColor: 'transparent', color: theme.text }]}
          placeholder="Senha"
          placeholderTextColor={theme.placeholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ paddingRight: 15 }}>
          <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={22} color={theme.placeholder} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.addBtn} onPress={handleLogin}>
        <Text style={styles.addBtnText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;