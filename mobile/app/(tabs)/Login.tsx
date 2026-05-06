import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { styles } from './style';

const AUTH_KEY = 'isLoggedIn';

interface LoginScreenProps {
  onLogin?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (username.trim().toLowerCase() === 'admin' && password === '123') {
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
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Usuário"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.addBtn} onPress={handleLogin}>
        <Text style={styles.addBtnText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;