import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Assuming this path is correct

interface ConfirmationOverlayProps {
  isConfirmed?: boolean;
  isConfirming?: boolean;
}

export const ConfirmationOverlay: React.FC<ConfirmationOverlayProps> = ({ isConfirmed, isConfirming }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 40,
    }).start();
  }, [isConfirmed, isConfirming]);

  if (isConfirming) {
    return (
      <Animated.View style={[localStyles.centeredOverlay, { opacity: anim, transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.3] }) }] }]}>
        <MaterialIcons name="thumb-up" size={44} color="#00DF82" />
      </Animated.View>
    );
  }

  if (isConfirmed) {
    return (
      <Animated.Text style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        fontSize: 45,
        fontWeight: 'bold',
        color: 'rgba(27, 94, 32, 0.1)',
        textAlign: 'center',
        textAlignVertical: 'center',
        opacity: anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 1] }),
        transform: [{ rotate: '-15deg' }, { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [3, 1] }) }]
      }}>OK</Animated.Text>
    );
  }

  return null;
};

const localStyles = StyleSheet.create({
  centeredOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 5 },
});