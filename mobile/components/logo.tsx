import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export function Logo() {
  return (
    <View style={styles.container}>
      <MaterialIcons 
        name="shopping-cart" 
        size={45} 
        color="#4CAF50" 
        style={styles.icon} 
      />
      <Text style={styles.text}>MyMerc</Text>
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
    letterSpacing: -1,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});