import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './style';

const AUTH_KEY = 'isLoggedIn';

interface LoginScreenProps {
  onLogin?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#eee',
      }}>
        <TextInput
          style={[styles.input, { flex: 1, width: 'auto', marginBottom: 0, borderWidth: 0, backgroundColor: 'transparent' }]}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ paddingRight: 15 }}>
          <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={22} color="#999" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.addBtn} onPress={handleLogin}>
        <Text style={styles.addBtnText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;