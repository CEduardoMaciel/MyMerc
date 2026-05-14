import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthAndDataProvider, useAuthAndDataLoading } from '../useAuthAndDataLoading';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function RootLayoutContent() {
  const { settings, isAuthLoading } = useAuthAndDataLoading();

  if (isAuthLoading) return null; // Mantém a splash nativa até carregar o tema e evitar clarões brancos

  const isDark = settings.theme === 'dark';

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="confirmacao" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthAndDataProvider>
      <RootLayoutContent />
    </AuthAndDataProvider>
  );
}
