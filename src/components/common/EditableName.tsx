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
  singleLine,
}: {
  name: string;
  checked?: boolean;
  onEdit: () => void;
  onPress?: () => void;
  disabled?: boolean;
  singleLine?: boolean;
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
      accessibilityRole={checked === undefined ? 'button' : 'checkbox'}
      accessibilityLabel={name}
      accessibilityHint={onPress ? t.hint : t.edit}
      accessibilityState={{ disabled: !!disabled, checked }}
      accessibilityActions={[{ name: 'edit', label: t.edit }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'edit') edit();
      }}
      disabled={disabled}
      onPress={onPress ? press : edit}
      onLongPress={edit}
      style={({ pressed }) => ({
        flex: 1,
        minWidth: 0,
        minHeight: 36,
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        numberOfLines={singleLine ? 1 : undefined}
        style={{
          fontFamily: 'OpenSans-Regular',
          fontSize: 15,
          color: checked ? colors.secondary : colors.text,
          textDecorationLine: checked ? 'line-through' : 'none',
        }}
      >
        {name}
      </Text>
    </Pressable>
  );
}
