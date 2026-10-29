import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { ModalCard } from './ModalCard';
import { Button } from './Button';
import { useTranslations } from '../../hooks/useTranslations';
import { colors } from '../../constants/colors';
export function EditNameDialog({
  name,
  max,
  onSave,
  onClose,
  busy,
}: {
  name: string;
  max: number;
  onSave: (name: string) => Promise<boolean>;
  onClose: () => void;
  busy: boolean;
}) {
  const t = useTranslations(),
    [value, setValue] = useState(name),
    [invalid, setInvalid] = useState(false),
    [failed, setFailed] = useState(false);
  async function save() {
    if (!value.trim() || value.trim().length > max) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    const success = await onSave(value);
    if (success) onClose();
    else setFailed(true);
  }
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
        {t.edit}
      </Text>
      <Text style={{ marginTop: 12, color: colors.secondary }}>{t.name}</Text>
      <TextInput
        accessibilityLabel={t.name}
        autoFocus
        selectTextOnFocus
        editable={!busy}
        value={value}
        onChangeText={setValue}
        maxLength={max}
        onSubmitEditing={() => void save()}
        returnKeyType="done"
        style={{
          paddingHorizontal: 10,
          paddingVertical: 4,
          minHeight: 36,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          marginVertical: 8,
          fontSize: 15,
          color: colors.text,
        }}
      />
      {invalid && (
        <Text accessibilityRole="alert" style={{ color: colors.error }}>
          {t.invalid}
        </Text>
      )}
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
          label={t.save}
          disabled={busy}
          onPress={() => void save()}
          style={{ flex: 1 }}
        />
      </View>
    </ModalCard>
  );
}
