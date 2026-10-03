import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';

import { useShoppingListStore } from '../stores/shoppingListStore';
import { useTranslations } from '../hooks/useTranslations';
import { Button } from '../components/common/Button';
import { colors } from '../constants/colors';
export default function App({ children }: { children: React.ReactNode }) {
  const ready = useShoppingListStore((s) => s.ready),
    error = useShoppingListStore((s) => s.error),
    busy = useShoppingListStore((s) => s.busy),
    t = useTranslations();
  const [fontsLoaded, fontError] = useFonts({
    'OpenSans-Regular': require('../../assets/fonts/OpenSans-Regular.ttf'),
    'OpenSans-Semibold': require('../../assets/fonts/OpenSans-Semibold.ttf'),
  });
  useEffect(() => {
    void useShoppingListStore.getState().initialize();
  }, []);
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        {!ready || (!fontsLoaded && !fontError) ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 24,
              gap: 16,
            }}
          >
            {error ? (
              <>
                <Text accessibilityRole="alert" style={{ color: colors.error }}>
                  {t.error}
                </Text>
                <Button
                  label={t.retry}
                  disabled={busy}
                  onPress={() =>
                    void useShoppingListStore.getState().initialize()
                  }
                />
              </>
            ) : (
              <>
                <ActivityIndicator color={colors.primary} />
                <Text>{t.loading}</Text>
              </>
            )}
          </View>
        ) : (
          <>
            {children}
            {error && (
              <View style={{ padding: 16, backgroundColor: colors.surface }}>
                <Text
                  accessibilityRole="alert"
                  style={{ color: colors.error, marginBottom: 8 }}
                >
                  {t.error}
                </Text>
                <Button
                  label="OK"
                  secondary
                  onPress={() => useShoppingListStore.getState().clearError()}
                />
              </View>
            )}
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
