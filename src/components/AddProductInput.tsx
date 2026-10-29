import { useRef, useState } from 'react';
import { Text, View, TextInput, Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../constants/colors';
import { Button } from './common/Button';
import { useTranslations } from '../hooks/useTranslations';
import { normalizeProduct } from '../utils/catalog';
export function AddProductInput({
  label,
  suggestions,
  onAdd,
  busy,
  max = 300,
  autoFocus = false,
}: {
  label: string;
  suggestions: string[];
  onAdd: (name: string) => Promise<boolean>;
  busy: boolean;
  max?: number;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState(''),
    t = useTranslations();
  const input = useRef<TextInput>(null);
  const saving = useRef(false);
  const revision = useRef(0);
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const matchingSuggestions = suggestions
    .filter((name) => normalizeProduct(name).includes(normalizeProduct(value)))
    .sort((a, b) => {
      const query = normalizeProduct(value);
      const rank = (name: string) => {
        const normalized = normalizeProduct(name);
        if (normalized === query) return 0;
        if (normalized.startsWith(query)) return 1;
        return 2;
      };
      return rank(a) - rank(b);
    })
    .slice(0, 4);
  const choices = [...matchingSuggestions];
  const customName = value.trim();
  const hasCustomChoice =
    !!customName &&
    !matchingSuggestions.some(
      (name) => normalizeProduct(name) === normalizeProduct(customName),
    );
  if (hasCustomChoice) choices.push(customName);
  const expanded = focused && choices.length > 0;
  const selected = choices[Math.min(selectedIndex, choices.length - 1)];
  function submit() {
    if (value.trim()) void add(expanded ? selected : value);
  }
  async function add(name = value) {
    if (busy || saving.current || !name.trim()) return;
    const submittedRevision = revision.current;
    saving.current = true;
    input.current?.focus();
    try {
      if (await onAdd(name)) {
        // A completed save must not erase the next draft or a different suggestion.
        if (
          revision.current === submittedRevision &&
          normalizeProduct(name).includes(normalizeProduct(value))
        )
          setValue('');
      }
    } finally {
      saving.current = false;
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          autoFocus={autoFocus}
          ref={input}
          accessibilityLabel={label}
          accessibilityRole="combobox"
          accessibilityState={{ expanded }}
          accessibilityHint={
            expanded ? `${t.enterToAdd}: ${selected}` : undefined
          }
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChangeText={(text) => {
            revision.current += 1;
            setValue(text);
            setSelectedIndex(0);
            setFocused(true);
          }}
          onKeyPress={({ nativeEvent: { key } }) => {
            if (key === 'ArrowDown')
              setSelectedIndex(
                (index) => (index + 1) % Math.max(choices.length, 1),
              );
            if (key === 'ArrowUp')
              setSelectedIndex(
                (index) =>
                  (index + choices.length - 1) % Math.max(choices.length, 1),
              );
            if (key === 'Escape') setFocused(false);
          }}
          placeholder={label}
          placeholderTextColor={colors.muted}
          maxLength={max}
          onSubmitEditing={submit}
          returnKeyType="done"
          submitBehavior="submit"
          style={styles.input}
        />
        <Button
          label={t.add}
          icon="return-down-back-outline"
          disabled={busy || !value.trim()}
          onPress={submit}
          accent
        />
      </View>
      {expanded && (
        <View style={styles.dropdown}>
          {choices.map((name, index) => {
            const isSelected = name === selected;
            const isCustom = hasCustomChoice && index === choices.length - 1;
            return (
              <Pressable
                key={name}
                accessibilityRole="button"
                accessibilityLabel={
                  isCustom ? `${t.useTypedName}: ${name}` : name
                }
                accessibilityState={{ selected: isSelected, disabled: busy }}
                disabled={busy}
                onPress={() => void add(name)}
                style={({ pressed }) => [
                  styles.option,
                  isSelected && styles.selectedOption,
                  { opacity: busy ? 0.4 : pressed ? 0.6 : 1 },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[styles.optionText, isSelected && styles.selectedText]}
                >
                  {isCustom ? `${t.useTypedName}: ${name}` : name}
                </Text>
                {isSelected && (
                  <Ionicons
                    name="return-down-back-outline"
                    color={colors.primary}
                    size={18}
                  />
                )}
              </Pressable>
            );
          })}
          <Text style={styles.keyboardHint}>{t.enterToAdd}</Text>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { gap: 4, marginBottom: 8 },
  label: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 13,
    color: colors.secondary,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'OpenSans-Regular',
    fontSize: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minHeight: 36,
    color: colors.text,
  },
  dropdown: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  option: {
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedOption: { backgroundColor: colors.primarySoft },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontFamily: 'OpenSans-Regular',
  },
  selectedText: { color: colors.primary, fontFamily: 'OpenSans-Semibold' },
  keyboardHint: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: colors.secondary,
  },
});
