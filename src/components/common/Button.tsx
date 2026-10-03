import {
  Pressable,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../../constants/colors';
export function Button({
  label,
  onPress,
  disabled,
  secondary,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        style,
        { opacity: disabled ? 0.45 : pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={[styles.label, secondary && { color: colors.primary }]}>
        {label}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    minWidth: 48,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: { backgroundColor: colors.border },
  label: {
    fontFamily: 'OpenSans-Semibold',
    fontSize: 15,
    color: colors.surface,
  },
});
