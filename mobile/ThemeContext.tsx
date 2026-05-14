import React, { createContext, useContext, useMemo } from 'react';
import { useAuthAndDataLoading } from './useAuthAndDataLoading';

export const themeColors = {
  light: {
    background: '#fff',
    surface: '#fff',
    text: '#333',
    title: '#1B5E20',
    subtitle: '#666',
    secondaryText: '#666',
    inputBg: '#f9f9f9',
    inputBorder: '#eee',
    card: '#f9f9f9',
    cardBorder: '#eee',
    headerBg: '#f1f8e9',
    headerBorder: '#1B5E20',
    modalBg: '#fff',
    accent: '#4CAF50',
    road: '#eee',
    logo: '#1B5E20',
    cancelBtn: '#F44336',
    buttonBlue: '#2196F3',
    orange: '#FF9800',
    expiredBg: '#FFCDD2',
    notExpiredBg: '#E3F2FD',
    expiredText: '#C62828',
    notExpiredText: '#1976D2',
    border: '#eee',
  },
  dark: {
    background: '#1E1E1E',
    surface: '#252526',
    text: '#D4D4D4',
    title: '#4CAF50',
    subtitle: '#858585',
    secondaryText: '#B0BEC5',
    inputBg: '#3C3C3C',
    inputBorder: '#333',
    card: '#252526',
    cardBorder: '#333',
    headerBg: '#2D2D2D',
    headerBorder: '#4CAF50',
    modalBg: '#1E1E1E',
    accent: '#4CAF50',
    road: '#333',
    logo: '#A5D6A7',
    cancelBtn: '#F44336',
    buttonBlue: '#2196F3',
    orange: '#FF9800',
    expiredBg: '#FFCDD2',
    notExpiredBg: '#E3F2FD',
    expiredText: '#C62828',
    notExpiredText: '#1976D2',
    border: '#333',
  }
};

const ThemeContext = createContext<typeof themeColors.light | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useAuthAndDataLoading();
  const theme = useMemo(() => themeColors[settings.theme || 'light'], [settings.theme]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme deve ser usado dentro de um ThemeProvider');
  return context;
};