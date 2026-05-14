import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, TextInput, Alert, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { AUTH_KEY, USER_CRED_KEY } from './utils';
import { useSplashAnimations } from '../useSplashAnimations';
import { useProfileManager } from '../useProfileManager';
import { useAppTheme } from '../ThemeContext';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const router = useRouter();
  const theme = useAppTheme();
  const {
    cartScale, cartMove, cartShake, roadOpacity, logoOpacity, logoScale, logoTranslateY,
    handAnimY, handOpacity, productAnimY, productOpacity,
    loginOpacity, loginTranslateY, particles, particlesOpacity,
    startEntranceSequence, startExitSequence
  } = useSplashAnimations();

  const { 
    profiles, username, setUsername, isCreatingProfile, setIsCreatingProfile, 
    handleCreateProfile, handleDeleteProfile 
  } = useProfileManager();

  useEffect(() => { startEntranceSequence(); }, []);

  const handleSelectProfile = async (selectedUser: string) => {
    try {
      await SecureStore.setItemAsync(USER_CRED_KEY, JSON.stringify({ u: selectedUser }));
      startExitSequence(async () => {
        await SecureStore.setItemAsync(AUTH_KEY, 'true');
        onFinish();
      });
    } catch (error) {
      Alert.alert('Erro', 'Falha ao selecionar perfil');
    }
  };
  
  // Centralização de estilos baseada no tema facilitada pelo Hook useAppTheme
  const isDark = theme.background !== '#fff';

  const renderProfileItem = ({ item }: { item: string }) => (
    <View style={localStyles.profileItemContainer}>
      <TouchableOpacity 
        style={[localStyles.profileCard, { backgroundColor: theme.card, borderColor: theme.inputBorder }]} 
        onPress={() => handleSelectProfile(item)}
      >
        <View style={[localStyles.profileIcon, { backgroundColor: theme.headerBg }]}>
          <MaterialIcons name="person" size={24} color={theme.logo} />
        </View>
        <Text style={[localStyles.profileName, { color: theme.text }]}>{item.charAt(0).toUpperCase() + item.slice(1)}</Text>
        <MaterialIcons name="chevron-right" size={24} color={theme.subtitle} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => handleDeleteProfile(item)}
        style={localStyles.deleteProfileBtn}
      >
        <MaterialIcons name="remove-circle-outline" size={22} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[localStyles.container, { backgroundColor: theme.background }]}>
        <TouchableOpacity 
          onPress={() => router.push('/configuracao')}
          style={{ position: 'absolute', top: 50, right: 20, zIndex: 100 }}
        >
          <MaterialIcons name="settings" size={32} color={theme.logo} />
        </TouchableOpacity>

        <Animated.View style={[localStyles.roadContainer, { opacity: roadOpacity }]}>
          <View style={[localStyles.roadLineLeft, { backgroundColor: theme.road }]} />
          <View style={[localStyles.roadLineRight, { backgroundColor: theme.road }]} />
        </Animated.View>

        <Animated.View style={[localStyles.contentGroup, { transform: [{ translateY: logoTranslateY }] }]}>
          <Animated.View style={{
            position: 'absolute',
            top: 0,
            opacity: productOpacity,
            transform: [{ translateY: productAnimY }],
            zIndex: 5
          }}>
            <MaterialIcons name="archive" size={24} color={theme.accent} />
          </Animated.View>
          
          <Animated.View style={{
            position: 'absolute',
            top: 0,
            opacity: handOpacity,
            transform: [{ translateY: handAnimY }],
            zIndex: 6
          }}>{/* Corrigido: A cor da mão deve ser definida no ThemeContext se for variável */}
            <MaterialIcons name="pan-tool" size={40} color={theme.orange} />
          </Animated.View>

          <Animated.View style={{
            transform: [
              { translateY: cartMove }, 
              { scale: cartScale },
              { translateX: cartShake }
            ],
            zIndex: 1
          }}>
            <MaterialIcons name="shopping-cart" size={40} color={theme.accent} />
          </Animated.View>

          <Animated.View style={{ 
            opacity: logoOpacity, 
            transform: [{ scale: logoScale }],
            position: 'absolute',
            alignItems: 'center',
            zIndex: 10 // Garante que fica por cima
          }}>
            <TouchableOpacity 
              activeOpacity={1} 
              onLongPress={() => handleSelectProfile('Admin')}
            >
              <Text style={[localStyles.logoText, { color: theme.logo }]}>MyMerc</Text>
            </TouchableOpacity>
            <Text style={[localStyles.tagline, { color: theme.subtitle }]}>Suas compras em ordem</Text>
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
              <Text style={[localStyles.sectionTitle, { color: theme.logo }]}>Novo Perfil</Text>
              <TextInput
                ref={userInputRef}
                style={[localStyles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                placeholder="Nome do Perfil"
                value={username}
                placeholderTextColor={isDark ? '#888' : '#999'}
                onChangeText={setUsername}
                autoFocus // useProfileManager controla o estado
              />{/* Corrigido: Adicionado backgroundColor do tema */}
              <TouchableOpacity style={[localStyles.enterBtn, { backgroundColor: theme.accent }]} onPress={handleCreateProfile}>
                <Text style={localStyles.enterBtnText}>Criar Perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsCreatingProfile(false)} style={{ marginTop: 15, alignItems: 'center' }}>
                <Text style={{ color: '#2196F3', fontWeight: 'bold' }}>Voltar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Text style={[localStyles.sectionTitle, { color: theme.logo }]}>Escolha seu Perfil</Text>
              <FlatList
                data={profiles.filter(p => p.toLowerCase() !== 'admin')}
                renderItem={renderProfileItem}
                keyExtractor={item => item}
                style={{ marginBottom: 15 }}
              />
            <TouchableOpacity 
                onPress={() => setIsCreatingProfile(true)}
                style={localStyles.addProfileBtn}
            >
                <MaterialIcons name="add-circle-outline" size={20} color={theme.accent} />{/* Corrigido: Cor do ícone */}
                <Text style={[localStyles.addProfileText, { color: theme.accent }]}>Novo Perfil</Text>{/* Corrigido: Cor do texto */}
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
    color: '#1B5E20', // Mantido para o modo light, mas o tema.logo já cobre isso
    letterSpacing: -1
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
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 3,
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
  profileItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  profileCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee'
  },
  deleteProfileBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#4CAF50', // Mantido para o modo light, mas o tema.accent já cobre isso
    fontWeight: 'bold',
    fontSize: 16
  }
});