import {
  Image,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { colors } from '../constants/colors';
import { useTranslations } from '../hooks/useTranslations';
import { Button } from '../components/common/Button';

export function StartupScreen({
  error,
  busy,
  onRetry,
}: {
  error: boolean;
  busy: boolean;
  onRetry: () => void;
}) {
  const t = useTranslations();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Image
        accessible={false}
        source={require('../../assets/splash-mark.png')}
        style={styles.mark}
        resizeMode="contain"
      />
      <Text accessibilityRole="header" style={styles.title}>
        MesCourses<Text style={{ color: colors.accent }}>+</Text>
      </Text>
      <Text style={styles.tagline}>{t.splashTagline}</Text>
      <View style={styles.status}>
        {error ? (
          <>
            <Text accessibilityRole="alert" style={styles.message}>
              {t.error}
            </Text>
            <Button label={t.retry} accent disabled={busy} onPress={onRetry} />
          </>
        ) : (
          <ActivityIndicator
            accessibilityLabel={t.loading}
            color={colors.accent}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primary },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  mark: { width: 128, height: 128, marginBottom: 24 },
  title: {
    fontSize: 28,
    color: colors.surface,
    fontWeight: '600',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.surface,
    textAlign: 'center',
    marginTop: 8,
  },
  status: {
    marginTop: 32,
    gap: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.surface,
  },
});
