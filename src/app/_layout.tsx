import { Stack, router } from 'expo-router';
import App from '../bootstrap/App';
import { IconButton } from '../components/common/IconButton';
import { useTranslations } from '../hooks/useTranslations';
import { colors } from '../constants/colors';
export default function Layout() {
  const t = useTranslations();
  return (
    <App>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontFamily: 'OpenSans-Semibold' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'MesCourses+',
            headerRight: () => (
              <IconButton
                icon="settings-outline"
                label={t.settings}
                onPress={() => router.push('/settings')}
              />
            ),
          }}
        />
        <Stack.Screen name="shopping-list" options={{ title: t.lists }} />
        <Stack.Screen name="settings" options={{ title: t.settings }} />
      </Stack>
    </App>
  );
}
