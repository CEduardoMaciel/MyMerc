import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Easing, Dimensions, TextInput, Alert, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');
const AUTH_KEY = 'isLoggedIn';
const USER_CRED_KEY = 'userCredentials';
const USER_CRED_KEY_OLD = 'user_credentials'; // Chave antiga para credenciais do usuário
const PROFILES_KEY = 'myMercProfilesList';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const cartScale = useRef(new Animated.Value(0.1)).current;
  const cartMove = useRef(new Animated.Value(-200)).current;
  const cartShake = useRef(new Animated.Value(0)).current;
  const roadOpacity = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;

  // Animação da Mão e Produto
  const handAnimY = useRef(new Animated.Value(-150)).current;
  const handOpacity = useRef(new Animated.Value(0)).current;
  const productAnimY = useRef(new Animated.Value(-130)).current;
  const productOpacity = useRef(new Animated.Value(0)).current;

  // Animações do Login
  const loginOpacity = useRef(new Animated.Value(0)).current;
  const loginTranslateY = useRef(new Animated.Value(30)).current;
  
  // Partículas de poeira
  const particles = useRef([...Array(12)].map(() => new Animated.ValueXY({ x: 0, y: 0 }))).current;
  const particlesOpacity = useRef(new Animated.Value(0)).current;
  const userInputRef = useRef<TextInput>(null);

  // Estado do Login
  const [username, setUsername] = useState('');
  const [profiles, setProfiles] = useState<string[]>([]);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  const loadProfiles = useCallback(async () => {
    try {
      const stored = await SecureStore.getItemAsync(PROFILES_KEY);
      let list: string[] = stored ? JSON.parse(stored) : [];
      
      // Migração: Se não houver lista mas houver um usuário antigo no USER_CRED_KEY
      const oldCreds = await SecureStore.getItemAsync(USER_CRED_KEY);
      if (list.length === 0) {
        if (oldCreds) {
          const { u } = JSON.parse(oldCreds);
          list = [u];
        } else {
          list = ['Admin']; // Perfil padrão inicial
        }
        await SecureStore.setItemAsync(PROFILES_KEY, JSON.stringify(list));
      }
      
      setProfiles(list);
    } catch (error) {
      setProfiles(['Admin']);
    }
  }, []);

  useEffect(() => {
    loadProfiles();

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

      // 2.7 Mão colocando produto no carrinho (Estilo Coyote)
      Animated.sequence([
        Animated.parallel([
          Animated.timing(handOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(productOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(handAnimY, { toValue: -40, duration: 600, useNativeDriver: true }),
          Animated.timing(productAnimY, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
        Animated.timing(productOpacity, { toValue: 0, duration: 150, useNativeDriver: true }), // Produto "cai" no carrinho
        Animated.parallel([
          Animated.timing(handAnimY, { toValue: -150, duration: 500, useNativeDriver: true }),
          Animated.timing(handOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]),
      ]),

      // 3. Freio e Poeira (Partículas saindo do carrinho)
      Animated.parallel([
        Animated.timing(particlesOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        ...particles.map((p, i) => 
          Animated.parallel([
            Animated.timing(p.x, {
              toValue: (i % 2 === 0 ? -1 : 1) * (Math.random() * 100 + 50),
              duration: 800,
              easing: Easing.out(Easing.exp),
              useNativeDriver: true,
            }),
            Animated.timing(p.y, {
              toValue: -Math.random() * 100 - 20,
              duration: 800,
              easing: Easing.out(Easing.exp),
              useNativeDriver: true,
            })
          ])
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

  const handleSelectProfile = async (selectedUser: string) => {
    try {
      // Salva qual é o perfil atual para o index.tsx ler
      await SecureStore.setItemAsync(USER_CRED_KEY, JSON.stringify({ u: selectedUser }));
      
      // Efeito visual de sucesso
      Animated.parallel([
        Animated.timing(loginOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(logoScale, { toValue: 1.3, duration: 400, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start(async () => {
        await SecureStore.setItemAsync(AUTH_KEY, 'true');
        onFinish();
      });
    } catch (error) {
      Alert.alert('Erro', 'Falha ao selecionar perfil');
    }
  };

  const handleCreateProfile = async () => {
    const lowerUsername = username.trim().toLowerCase();
    if (!lowerUsername) {
      Alert.alert('Atenção', 'Digite um nome para o perfil');
      return;
    }

    try {
      if (profiles.includes(lowerUsername)) {
        Alert.alert('Atenção', 'Este perfil já existe.');
        return;
      }

      const newList = [...profiles, lowerUsername];
      await SecureStore.setItemAsync(PROFILES_KEY, JSON.stringify(newList));
      setProfiles(newList);
      
      Alert.alert('Sucesso', 'Perfil criado!', [{ 
        text: 'OK', 
        onPress: () => {
          setIsCreatingProfile(false);
          setUsername('');
        } 
      }]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o perfil');
    }
  };

  const renderProfileItem = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={localStyles.profileCard} 
      onPress={() => handleSelectProfile(item)}
    >
      <View style={localStyles.profileIcon}>
        <MaterialIcons name="person" size={24} color="#4CAF50" />
      </View>
      <Text style={localStyles.profileName}>{item.charAt(0).toUpperCase() + item.slice(1)}</Text>
      <MaterialIcons name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={localStyles.container}>
        <Animated.View style={[localStyles.roadContainer, { opacity: roadOpacity }]}>
          <View style={localStyles.roadLineLeft} />
          <View style={localStyles.roadLineRight} />
        </Animated.View>

        <Animated.View style={[localStyles.contentGroup, { transform: [{ translateY: logoTranslateY }] }]}>
          <Animated.View style={{
            position: 'absolute',
            top: 0,
            opacity: productOpacity,
            transform: [{ translateY: productAnimY }],
            zIndex: 5
          }}>
            <MaterialIcons name="archive" size={24} color="#FF9800" />
          </Animated.View>
          
          <Animated.View style={{
            position: 'absolute',
            top: 0,
            opacity: handOpacity,
            transform: [{ translateY: handAnimY }],
            zIndex: 6
          }}>
            <MaterialIcons name="pan-tool" size={40} color="#f1c27d" />
          </Animated.View>

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

          <Animated.View style={{ 
            opacity: logoOpacity, 
            transform: [{ scale: logoScale }],
            position: 'absolute',
            alignItems: 'center',
            zIndex: 10 // Garante que fica por cima
          }}>
          <Text style={localStyles.logoText}>MyMerc</Text>
            <Text style={localStyles.tagline}>Suas compras em ordem</Text>
          </Animated.View>
        </Animated.View>

        <Animated.View style={[localStyles.particlesContainer, { opacity: particlesOpacity }]}>
          {particles.map((p, i) => (
            <Animated.View 
              key={i} 
              style={[localStyles.particle, { transform: [{ translateX: p.x }, { translateY: p.y }] }]} 
            />
          ))}
        </Animated.View>

        <Animated.View style={{ 
          opacity: loginOpacity, 
          transform: [{ translateY: loginTranslateY }],
          width: '85%', 
          position: 'absolute',
          bottom: height * 0.10,
          maxHeight: height * 0.4,
          zIndex: 20 
        }}>
          {isCreatingProfile ? (
            <View>
              <Text style={localStyles.sectionTitle}>Novo Perfil</Text>
              <TextInput
                ref={userInputRef}
                style={localStyles.input}
                placeholder="Nome do Perfil"
                value={username}
                placeholderTextColor="#999"
                onChangeText={setUsername}
                autoFocus
              />
              <TouchableOpacity style={localStyles.enterBtn} onPress={handleCreateProfile}>
                <Text style={localStyles.enterBtnText}>Criar Perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsCreatingProfile(false)} style={{ marginTop: 15, alignItems: 'center' }}>
                <Text style={{ color: '#666' }}>Voltar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Text style={localStyles.sectionTitle}>Escolha seu Perfil</Text>
              <FlatList
                data={profiles}
                renderItem={renderProfileItem}
                keyExtractor={item => item}
                style={{ marginBottom: 15 }}
              />
            <TouchableOpacity 
                onPress={() => setIsCreatingProfile(true)}
                style={localStyles.addProfileBtn}
            >
                <MaterialIcons name="add-circle-outline" size={20} color="#4CAF50" />
                <Text style={localStyles.addProfileText}>Novo Perfil</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    width: '100%',
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 15,
    textAlign: 'center'
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee'
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  profileName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '600'
  },
  addProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 5
  },
  addProfileText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16
  }
});