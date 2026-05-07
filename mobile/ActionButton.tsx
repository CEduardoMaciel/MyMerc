import React from 'react';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Assuming this path is correct

interface ActionButtonProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  onPress: () => void;
  size?: number;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ icon, color, onPress, size = 24 }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: color,
      width: 36, height: 36, borderRadius: 18,
      justifyContent: 'center', alignItems: 'center', marginLeft: 8
    }}
  >
    <MaterialIcons name={icon} size={size} color="white" />
  </TouchableOpacity>
);