import { useEffect } from 'react';
import { View, Text, AccessibilityInfo } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { useShoppingListStore } from '../stores/shoppingListStore';
import { useTranslations } from '../hooks/useTranslations';
import { Button } from '../components/common/Button';
import { colors } from '../constants/colors';
import { StartupScreen } from './StartupScreen';

void SplashScreen.preventAutoHideAsync().catch(() => {});

function hideNativeSplash() {
  // The first React frame is already laid out, including startup error/retry UI.
  void SplashScreen.hideAsync().catch(() => {});
}
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
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((reduced) => {
        SplashScreen.setOptions({
          duration: reduced ? 0 : 200,
          fade: !reduced,
        });
      })
      .catch(() => SplashScreen.setOptions({ duration: 0, fade: false }));
  }, []);
  const starting = !ready || (!fontsLoaded && !fontError);
  return (
    <SafeAreaProvider>
      <StatusBar style={starting ? 'light' : 'dark'} />
      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        onLayout={hideNativeSplash}
        style={{
          flex: 1,
          backgroundColor: starting ? colors.primary : colors.background,
        }}
      >
        {starting ? (
          <StartupScreen
            error={error}
            busy={busy}
            onRetry={() => void useShoppingListStore.getState().initialize()}
          />
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
