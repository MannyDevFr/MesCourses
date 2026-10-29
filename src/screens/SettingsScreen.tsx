import { View, Text, Switch, ScrollView } from 'react-native';
import {
  useShoppingListStore,
  type Language,
} from '../stores/shoppingListStore';
import { useTranslations } from '../hooks/useTranslations';
import { Button } from '../components/common/Button';
import { colors } from '../constants/colors';
export function SettingsScreen() {
  const t = useTranslations(),
    language = useShoppingListStore((s) => s.language),
    busy = useShoppingListStore((s) => s.busy);
  const skipLists = useShoppingListStore((s) => s.skipListDelete),
    skipProducts = useShoppingListStore((s) => s.skipProductDelete);
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        padding: 10,
        gap: 8,
        width: '100%',
        maxWidth: 720,
        alignSelf: 'center',
      }}
    >
      <Text
        accessibilityRole="header"
        style={{
          fontSize: 22,
          fontFamily: 'OpenSans-Semibold',
          color: colors.primary,
        }}
      >
        {t.preferences}
      </Text>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 10,
          gap: 8,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontFamily: 'OpenSans-Semibold',
            color: colors.primary,
          }}
        >
          {t.language}
        </Text>
        <View style={{ gap: 8 }}>
          {(
            [
              ['en', 'English'],
              ['es', 'Español'],
              ['fr', 'Français'],
            ] as [Language, string][]
          ).map(([code, label]) => (
            <Button
              key={code}
              label={label}
              selected={language === code}
              secondary={language !== code}
              disabled={busy}
              onPress={() =>
                void useShoppingListStore.getState().setLanguage(code)
              }
            />
          ))}
        </View>
      </View>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 10,
          gap: 8,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontFamily: 'OpenSans-Semibold',
            color: colors.primary,
          }}
        >
          {t.confirmations}
        </Text>
        <Text style={{ color: colors.secondary, fontSize: 14, lineHeight: 20 }}>
          {t.safety}
        </Text>
        {(
          [
            ['list', t.confirmLists, !skipLists],
            ['product', t.confirmProducts, !skipProducts],
          ] as const
        ).map(([kind, label, value]) => (
          <View
            key={kind}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
          >
            <Text style={{ flex: 1, fontSize: 15, color: colors.text }}>
              {label}
            </Text>
            <Switch
              accessibilityLabel={label}
              value={value}
              disabled={busy}
              onValueChange={(v) =>
                void useShoppingListStore.getState().setSkipDelete(kind, !v)
              }
              trackColor={{ true: colors.primary }}
            />
          </View>
        ))}
      </View>
      <View
        style={{
          backgroundColor: colors.primarySoft,
          padding: 10,
          borderRadius: 12,
          gap: 8,
        }}
      >
        <Text
          style={{ fontFamily: 'OpenSans-Semibold', color: colors.primary }}
        >
          {t.privacy}
        </Text>
        <Text style={{ fontSize: 14, color: colors.secondary, lineHeight: 20 }}>
          {t.offline}
        </Text>
      </View>
    </ScrollView>
  );
}
