import { useState } from 'react';
import { Text, View, TextInput, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { Button } from './common/Button';
import { useTranslations } from '../hooks/useTranslations';
export function AddProductInput({
  label,
  suggestions,
  onAdd,
  busy,
  max = 300,
}: {
  label: string;
  suggestions: string[];
  onAdd: (name: string) => Promise<boolean>;
  busy: boolean;
  max?: number;
}) {
  const [value, setValue] = useState(''),
    t = useTranslations();
  async function add(name = value) {
    if (!name.trim()) return;
    if (await onAdd(name)) setValue('');
  }
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          accessibilityLabel={label}
          editable={!busy}
          value={value}
          onChangeText={setValue}
          placeholder={label}
          placeholderTextColor={colors.muted}
          maxLength={max}
          onSubmitEditing={() => void add()}
          returnKeyType="done"
          style={styles.input}
        />
        <Button
          label={t.add}
          disabled={busy || !value.trim()}
          onPress={() => void add()}
          style={{ backgroundColor: colors.accent }}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.chips}
      >
        {suggestions.map((name) => (
          <Button
            key={name}
            label={name}
            secondary
            disabled={busy}
            onPress={() => void add(name)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { gap: 8, marginBottom: 16 },
  label: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 14,
    color: colors.secondary,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'OpenSans-Regular',
    fontSize: 16,
    padding: 8,
    color: colors.text,
  },
  chips: { gap: 8 },
});
