import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Easing, Dimensions, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');
const AUTH_KEY = 'isLoggedIn';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const cartScale = useRef(new Animated.Value(0.1)).current;
  const cartMove = useRef(new Animated.Value(-200)).current;
  const cartShake = useRef(new Animated.Value(0)).current;
  const roadOpacity = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;

  // Animações do Login
  const loginOpacity = useRef(new Animated.Value(0)).current;
  const loginTranslateY = useRef(new Animated.Value(30)).current;
  
  // Partículas de poeira
  const particles = useRef([...Array(12)].map(() => new Animated.ValueXY({ x: 0, y: 0 }))).current;
  const particlesOpacity = useRef(new Animated.Value(0)).current;

  // Estado do Login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Sequência de Animação
    Animated.sequence([
      // 1. Estrada aparece
      Animated.timing(roadOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      
      // 2. Carrinho vem rápido e aumenta (perspectiva)
      Animated.parallel([
        Animated.timing(cartMove, {
          toValue: 20,
          duration: 1000,
          easing: Easing.bezier(0.1, 1, 0.3, 1), // Entrada rápida, parada brusca
          useNativeDriver: true,
        }),
        Animated.timing(cartScale, {
          toValue: 3,
          duration: 1000,
          easing: Easing.bezier(0.1, 1, 0.3, 1),
          useNativeDriver: true,
        }),
      ]),

      // 2.5 Efeito de Freio (Tremedeira estilo desenho animado)
      Animated.sequence([
        Animated.timing(cartShake, { toValue: 15, duration: 50, useNativeDriver: true }),
        Animated.timing(cartShake, { toValue: -15, duration: 50, useNativeDriver: true }),
        Animated.timing(cartShake, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(cartShake, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(cartShake, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]),

      // 3. Freio e Poeira (Partículas saindo do carrinho)
      Animated.parallel([
        Animated.timing(particlesOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        ...particles.map((p, i) => 
          Animated.timing(p, {
            toValue: { 
              x: (i % 2 === 0 ? -1 : 1) * (Math.random() * 100 + 50), 
              y: -Math.random() * 100 - 20 
            },
            duration: 800,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          })
        ),
        // 4. Poeira se transforma no Logo
        Animated.sequence([
          Animated.delay(200),
          Animated.parallel([
            Animated.timing(logoOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(logoScale, { toValue: 1, friction: 5, useNativeDriver: true }),
            Animated.timing(particlesOpacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
          ])
        ])
      ]),

      // 5. Transição para o Login (Logo sobe e campos aparecem)
      Animated.parallel([
        Animated.timing(logoTranslateY, { toValue: -120, duration: 800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(loginOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(loginTranslateY, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (username.trim().toLowerCase() === 'admin' && password === '123') {
      try {
        await SecureStore.setItemAsync(AUTH_KEY, 'true');
        onFinish();
      } catch (error) {
        console.error('Erro ao salvar login:', error);
      }
    } else {
      Alert.alert('Erro', 'Usuário ou senha incorretos');
    }
  };

  return (
    <View style={localStyles.container}>
      {/* Estrada (Linhas de perspectiva) */}
      <Animated.View style={[localStyles.roadContainer, { opacity: roadOpacity }]}>
        <View style={localStyles.roadLineLeft} />
        <View style={localStyles.roadLineRight} />
      </Animated.View>

      <Animated.View style={[localStyles.contentGroup, { transform: [{ translateY: logoTranslateY }] }]}>
        {/* Carrinho - Agora fica atrás no JSX ou com zIndex menor */}
        <Animated.View style={{
          transform: [
            { translateY: cartMove }, 
            { scale: cartScale },
            { translateX: cartShake }
          ],
          zIndex: 1
        }}>
          <MaterialIcons name="shopping-cart" size={40} color="#4CAF50" />
        </Animated.View>

        {/* Logo My Merc - Posicionado para cobrir o carrinho */}
        <Animated.View style={{ 
          opacity: logoOpacity, 
          transform: [{ scale: logoScale }],
          position: 'absolute',
          alignItems: 'center',
          zIndex: 10 // Garante que fica por cima
        }}>
          <Text style={localStyles.logoText}>My Merc</Text>
          <Text style={localStyles.tagline}>Suas compras em ordem</Text>
        </Animated.View>
      </Animated.View>

      {/* Poeira/Partículas */}
      <Animated.View style={[localStyles.particlesContainer, { opacity: particlesOpacity }]}>
        {particles.map((p, i) => (
          <Animated.View 
            key={i} 
            style={[localStyles.particle, { transform: [{ translateX: p.x }, { translateY: p.y }] }]} 
          />
        ))}
      </Animated.View>

      {/* Formulário de Login */}
      <Animated.View style={{ 
        opacity: loginOpacity, 
        transform: [{ translateY: loginTranslateY }],
        width: '85%', 
        position: 'absolute',
        bottom: height * 0.15,
        zIndex: 20 
      }}>
        <TextInput
          style={localStyles.input}
          placeholder="Usuário"
          value={username}
          placeholderTextColor="#999"
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={localStyles.input}
          placeholder="Senha"
          value={password}
          placeholderTextColor="#999"
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={localStyles.enterBtn} onPress={handleLogin}>
          <Text style={localStyles.enterBtnText}>Entrar</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  contentGroup: {
    height: 150,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roadContainer: {
    position: 'absolute',
    width: width,
    height: height,
    alignItems: 'center'
  },
  roadLineLeft: {
    position: 'absolute',
    bottom: 0,
    left: width * 0.2,
    width: 2,
    height: height,
    backgroundColor: '#eee',
    transform: [{ rotate: '15deg' }]
  },
  roadLineRight: {
    position: 'absolute',
    bottom: 0,
    right: width * 0.2,
    width: 2,
    height: height,
    backgroundColor: '#eee',
    transform: [{ rotate: '-15deg' }]
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#1B5E20', // Um verde mais escuro para destacar sobre o carrinho
    letterSpacing: -1,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginTop: -5
  },
  particlesContainer: {
    position: 'absolute',
    top: height * 0.55,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc'
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    fontSize: 16,
    width: '100%',
    color: '#333'
  },
  enterBtn: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 3
  },
  enterBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});