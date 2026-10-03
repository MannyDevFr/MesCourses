import { useEffect, useRef } from 'react';
import { Pressable, Text } from 'react-native';
import { colors } from '../../constants/colors';
import { useTranslations } from '../../hooks/useTranslations';
export function EditableName({
  name,
  checked,
  onEdit,
  onPress,
  disabled,
}: {
  name: string;
  checked?: boolean;
  onEdit: () => void;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const last = useRef(0),
    t = useTranslations();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  function edit() {
    clearTimeout(timer.current);
    last.current = 0;
    onEdit();
  }
  function press() {
    const now = Date.now();
    if (now - last.current < 300) {
      last.current = 0;
      edit();
    } else {
      last.current = now;
      if (onPress) timer.current = setTimeout(onPress, 300);
    }
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      accessibilityHint={t.hint}
      accessibilityActions={[{ name: 'edit', label: t.edit }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'edit') edit();
      }}
      disabled={disabled}
      onPress={press}
      onLongPress={edit}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 48,
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        style={{
          fontFamily: 'OpenSans-Regular',
          fontSize: 16,
          color: checked ? colors.muted : colors.text,
          textDecorationLine: checked ? 'line-through' : 'none',
        }}
      >
        {name}
      </Text>
    </Pressable>
  );
}
