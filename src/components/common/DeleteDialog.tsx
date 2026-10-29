import { useState } from 'react';
import { Text, View, Switch } from 'react-native';
import { ModalCard } from './ModalCard';
import { Button } from './Button';
import { useTranslations } from '../../hooks/useTranslations';
import { colors } from '../../constants/colors';
export function DeleteDialog({
  kind,
  busy,
  onConfirm,
  onClose,
  name,
}: {
  kind: 'list' | 'product';
  name?: string;
  busy: boolean;
  onConfirm: (skip: boolean) => Promise<boolean>;
  onClose: () => void;
}) {
  const t = useTranslations(),
    [skip, setSkip] = useState(false),
    [failed, setFailed] = useState(false);
  return (
    <ModalCard
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontFamily: 'OpenSans-Semibold',
          color: colors.primary,
        }}
      >
        {t.remove}
      </Text>
      {!!name && (
        <Text
          style={{
            color: colors.text,
            fontSize: 18,
            marginTop: 12,
            fontFamily: 'OpenSans-Semibold',
          }}
        >
          {name}
        </Text>
      )}
      <Text
        style={{ fontSize: 16, color: colors.secondary, marginVertical: 12 }}
      >
        {kind === 'list' ? t.deleteList : t.deleteProduct}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Switch
          accessibilityLabel={t.dontAsk}
          disabled={busy}
          value={skip}
          onValueChange={setSkip}
          trackColor={{ true: colors.primary }}
        />
        <Text style={{ flex: 1, color: colors.text }}>{t.dontAsk}</Text>
      </View>
      {failed && (
        <Text
          accessibilityRole="alert"
          style={{ color: colors.error, marginBottom: 12 }}
        >
          {t.error}
        </Text>
      )}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button
          label={t.cancel}
          secondary
          disabled={busy}
          onPress={onClose}
          style={{ flex: 1 }}
        />
        <Button
          label={t.remove}
          disabled={busy}
          onPress={() => {
            void onConfirm(skip).then((success) => setFailed(!success));
          }}
          style={{ flex: 1, backgroundColor: colors.error }}
        />
      </View>
    </ModalCard>
  );
}
