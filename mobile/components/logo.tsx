import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthAndDataLoading } from '../useAuthAndDataLoading';

export function Logo() {
  const { settings } = useAuthAndDataLoading();
  const isDark = settings.theme === 'dark';

  const theme = {
    text: isDark ? '#A5D6A7' : '#1B5E20',
    icon: isDark ? '#4CAF50' : '#4CAF50'
  };

  return (
    <View style={styles.container}>
      <MaterialIcons 
        name="shopping-cart" 
        size={45} 
        color={theme.icon} 
        style={styles.icon} 
      />
      <Text style={[styles.text, { color: theme.text }]}>MyMerc</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 50,
  },
  icon: {
    position: 'absolute',
    opacity: 0.2,
  },
  text: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1B5E20',
    letterSpacing: -1
  },
});