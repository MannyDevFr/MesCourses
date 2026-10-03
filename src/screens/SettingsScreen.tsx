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
      contentContainerStyle={{ padding: 24, gap: 24 }}
    >
      <Text
        style={{
          fontSize: 20,
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
            label={`${label}${language === code ? ' ✓' : ''}`}
            secondary={language !== code}
            disabled={busy}
            onPress={() =>
              void useShoppingListStore.getState().setLanguage(code)
            }
          />
        ))}
      </View>
      <Text
        style={{
          fontSize: 20,
          fontFamily: 'OpenSans-Semibold',
          color: colors.primary,
        }}
      >
        {t.confirmations}
      </Text>
      {(
        [
          ['list', t.confirmLists, !skipLists],
          ['product', t.confirmProducts, !skipProducts],
        ] as const
      ).map(([kind, label, value]) => (
        <View
          key={kind}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
        >
          <Text style={{ flex: 1, fontSize: 16, color: colors.text }}>
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
      <Text style={{ fontSize: 14, color: colors.secondary, lineHeight: 22 }}>
        {t.offline}
      </Text>
    </ScrollView>
  );
}
